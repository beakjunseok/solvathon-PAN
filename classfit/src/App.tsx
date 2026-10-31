/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AppRole, Assessment, AuthUser, MatchedAssessment, StudentProfile, WeeklyBlockSlot } from './types';
import {
  getStoredStudents,
  saveStudents,
  getStoredAssessments,
  saveAssessments,
  getStoredSchedule,
  saveSchedule,
  getActiveStudentId,
  setActiveStudentId,
  resetAllData,
} from './utils/storage';
import { matchStudentAssessments, getClosestStudentAssessment, getClosestTeacherAssessment } from './utils/scheduleMatcher';
import {
  isRemoteConfigured,
  fetchRemoteAssessments,
  upsertRemoteAssessments,
  deleteRemoteAssessment,
} from './utils/remoteStore';
import { disableDailyPush, isDailyPushEnabled, refreshDailyPush } from './utils/dailyPush';
import {
  AuthSession,
  fetchStudentAccounts,
  readSession,
  saveRemoteProfile,
  verifySession,
  writeSession,
} from './utils/authClient';
import { refreshSchoolSettings } from './utils/schoolSettings';
import { Navbar } from './components/Navbar';
import { StudentHome } from './components/StudentHome';
import { StudentScheduleEditor } from './components/StudentScheduleEditor';
import { TeacherDashboard } from './components/TeacherDashboard';
import { DualCompareView } from './components/DualCompareView';
import { WeeklyBlockMatrix } from './components/WeeklyBlockMatrix';
import { AssessmentDetailModal } from './components/AssessmentDetailModal';
import { SolverthonPitchView } from './components/SolverthonPitchView';
import { CampusMapModal } from './components/JungsanCampusMap';
import { MorningPackRoutine } from './components/MorningPackRoutine';
import { SolverthonSlideDeck } from './components/SolverthonSlideDeck';
import { LoginPortal } from './components/LoginPortal';
import { ComciganImportModal } from './components/ComciganImportModal';
import { PhoneNotificationModal } from './components/PhoneNotificationModal';
import { TeacherAccessDeniedModal } from './components/TeacherAccessDeniedModal';
import { RiroFullMenuModal } from './components/RiroFullMenuModal';
import { MyPageView } from './components/MyPageView';
import { RiroBottomBar } from './components/RiroBottomBar';
import { Sparkles, GraduationCap, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState<AuthSession | null>(() => readSession());
  const [isSessionVerified, setIsSessionVerified] = useState(false);
  const lastSavedProfile = useRef('');
  const [students, setStudents] = useState<StudentProfile[]>(() =>
    session?.profile ? [session.profile] : getStoredStudents()
  );
  const [activeStudentId, setActiveId] = useState<string>(() => session?.profile?.id || getActiveStudentId());
  const [assessments, setAssessments] = useState<Assessment[]>(() => getStoredAssessments());
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyBlockSlot[]>(() => getStoredSchedule());

  const [isRemoteOnline, setIsRemoteOnline] = useState(false);
  const [settingsVersion, setSettingsVersion] = useState(0);

  const pullRemoteAssessments = async () => {
    if (!isRemoteConfigured) return;
    refreshSchoolSettings()
      .then((changed) => {
        if (changed) setSettingsVersion((version) => version + 1);
      })
      .catch((err) => console.error('Failed to load timetable settings', err));
    try {
      const remote = await fetchRemoteAssessments();
      if (remote.length === 0) {
        // 빈 테이블이면 현재 데이터를 올려 모든 기기가 같은 평가를 보게 한다.
        const local = getStoredAssessments();
        if (local.length > 0) await upsertRemoteAssessments(local);
      } else {
        setAssessments(remote);
        saveAssessments(remote);
      }
      setIsRemoteOnline(true);
    } catch (err) {
      console.error('Failed to load assessments from Supabase', err);
      setIsRemoteOnline(false);
    }
  };

  const pushRemote = (task: Promise<void>) => {
    task.then(() => setIsRemoteOnline(true)).catch((err) => {
      console.error('Failed to sync assessments to Supabase', err);
      setIsRemoteOnline(false);
    });
  };

  // 다른 기기에서 등록한 평가가 보이도록 주기적으로 다시 불러온다.
  useEffect(() => {
    pullRemoteAssessments();
    const timer = setInterval(pullRemoteAssessments, 15000);
    return () => clearInterval(timer);
  }, []);

  const authUser: AuthUser =
    session?.role === 'teacher'
      ? { role: 'teacher', name: session.name }
      : { role: 'student', id: session?.id || '', name: session?.name || '' };

  const [currentRole, setCurrentRole] = useState<AppRole>(() => {
    return authUser.role === 'teacher' ? 'teacher' : 'student';
  });
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'matrix' | 'mypage'>('home');

  const [isScheduleEditorOpen, setIsScheduleEditorOpen] = useState(false);
  const [selectedAssessmentForModal, setSelectedAssessmentForModal] = useState<MatchedAssessment | null>(null);

  // Login Portal State & Access Denied Modal State
  const [isAccessDeniedOpen, setIsAccessDeniedOpen] = useState(false);

  // New Interactive Modals
  const [isCampusMapOpen, setIsCampusMapOpen] = useState(false);
  const [campusMapRoom, setCampusMapRoom] = useState<string | undefined>(undefined);
  const [isMorningRoutineOpen, setIsMorningRoutineOpen] = useState(false);
  const [isSlideDeckOpen, setIsSlideDeckOpen] = useState(false);
  const [isComciganModalOpen, setIsComciganModalOpen] = useState(false);
  const [isLockScreenOpen, setIsLockScreenOpen] = useState(false);
  const [isFullMenuOpen, setIsFullMenuOpen] = useState(false);

  // Active student object
  const activeStudent = useMemo(() => {
    return students.find((s) => s.id === activeStudentId) || students[0];
  }, [students, activeStudentId]);

  // Reactive matched assessments for active student
  const matchedAssessments = useMemo(() => {
    if (!activeStudent) return [];
    return matchStudentAssessments(activeStudent, assessments, weeklySchedule);
  }, [activeStudent, assessments, weeklySchedule, settingsVersion]);

  // Closest assessment for student (personal) and teacher (school-wide)
  const closestStudentAssessment = useMemo(() => {
    return getClosestStudentAssessment(matchedAssessments);
  }, [matchedAssessments]);

  const closestTeacherAssessment = useMemo(() => {
    return getClosestTeacherAssessment(assessments, weeklySchedule);
  }, [assessments, weeklySchedule, settingsVersion]);

  // 앱을 열거나 수행평가 상태가 바뀌면 고정 알림의 D-Day를 다시 맞춘다.
  useEffect(() => {
    if (!activeStudent || !session) return;
    refreshDailyPush(activeStudent, closestStudentAssessment).catch((err) => {
      console.error('Failed to refresh daily notification', err);
    });
  }, [activeStudent, closestStudentAssessment, session]);

  // Persistence hooks
  const handleSelectRole = (newRole: AppRole) => {
    if (newRole === 'teacher' && authUser.role === 'student') {
      // Strictly prevent student accounts from switching into teacher mode!
      setIsAccessDeniedOpen(true);
      return;
    }
    setCurrentRole(newRole);
  };

  const handleSelectStudent = (id: string) => {
    setActiveId(id);
    setActiveStudentId(id);
  };

  const handleUpdateStudent = (updatedStudent: StudentProfile) => {
    const next = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    setStudents(next);
    saveStudents(next);
  };

  const handleAddAssessment = (newAsmt: Assessment) => {
    const next = [newAsmt, ...assessments];
    setAssessments(next);
    saveAssessments(next);
    if (isRemoteConfigured) pushRemote(upsertRemoteAssessments([newAsmt]));
  };

  const handleUpdateAssessment = (updatedAsmt: Assessment) => {
    const next = assessments.map((a) => (a.id === updatedAsmt.id ? updatedAsmt : a));
    setAssessments(next);
    saveAssessments(next);
    if (isRemoteConfigured) pushRemote(upsertRemoteAssessments([updatedAsmt]));
  };

  const handleDeleteAssessment = (id: string) => {
    const next = assessments.filter((a) => a.id !== id);
    setAssessments(next);
    saveAssessments(next);
    if (isRemoteConfigured) pushRemote(deleteRemoteAssessment(id));
  };

  const handleToggleSupply = (assessmentId: string, item: string) => {
    if (!activeStudent) return;
    const currentList = activeStudent.checkedSupplies[assessmentId] || [];
    const nextList = currentList.includes(item)
      ? currentList.filter((i) => i !== item)
      : [...currentList, item];

    const updated: StudentProfile = {
      ...activeStudent,
      checkedSupplies: {
        ...activeStudent.checkedSupplies,
        [assessmentId]: nextList,
      },
    };
    handleUpdateStudent(updated);

    // Also update modal state if open
    if (selectedAssessmentForModal && selectedAssessmentForModal.id === assessmentId) {
      // triggers re-render via checkedSupplies prop
    }
  };

  const handleToggleComplete = (assessmentId: string) => {
    if (!activeStudent) return;
    const isCompleted = activeStudent.completedAssessments.includes(assessmentId);
    const nextCompleted = isCompleted
      ? activeStudent.completedAssessments.filter((id) => id !== assessmentId)
      : [...activeStudent.completedAssessments, assessmentId];

    const updated: StudentProfile = {
      ...activeStudent,
      completedAssessments: nextCompleted,
    };
    handleUpdateStudent(updated);

    if (selectedAssessmentForModal && selectedAssessmentForModal.id === assessmentId) {
      setSelectedAssessmentForModal({
        ...selectedAssessmentForModal,
        isCompleted: !isCompleted,
      });
    }
  };

  const handleResetData = () => {
    const confirmed = window.confirm('초기 샘플 데이터(김민준, 이서연 시간표 및 수행평가 공지)로 리셋하시겠습니까?');
    if (confirmed) {
      const initial = resetAllData();
      setStudents(initial.students);
      setAssessments(initial.assessments);
      setWeeklySchedule(initial.schedule);
      setActiveId(initial.students[0].id);
      setCurrentRole('student');
    }
  };

  const applySession = (next: AuthSession) => {
    writeSession(next);
    setSession(next);
    setIsSessionVerified(true);
    setActiveTab('home');

    if (next.role === 'teacher') {
      setCurrentRole('teacher');
      fetchStudentAccounts(next.token)
        .then((list) => {
          if (list.length > 0) setStudents(list);
        })
        .catch((err) => console.error('Failed to load student accounts', err));
      return;
    }

    if (next.profile) {
      lastSavedProfile.current = JSON.stringify(next.profile);
      setStudents([next.profile]);
      setActiveId(next.profile.id);
      setCurrentRole('student');
      if (next.profile.grade !== 1 && next.profile.courses.length === 0) {
        setIsScheduleEditorOpen(true);
      }
    }
  };

  const handleLogout = () => {
    if (isDailyPushEnabled()) {
      disableDailyPush().catch((err) => console.error('Failed to turn off notifications', err));
    }
    writeSession(null);
    setSession(null);
    setIsSessionVerified(false);
  };

  // 저장된 세션을 서버에서 확인한다. 네트워크 오류면 다음 접속 때 다시 확인한다.
  useEffect(() => {
    if (!session) return;
    verifySession(session.token)
      .then(applySession)
      .catch((err) => {
        if (err.message === '다시 로그인해 주세요.') handleLogout();
      });
  }, []);

  // 선택과목과 체크 상태를 계정에 저장해 다른 기기에서도 이어서 쓴다.
  useEffect(() => {
    if (!session || session.role !== 'student' || !isSessionVerified || !activeStudent) return;
    if (activeStudent.id !== session.id) return;
    const serialized = JSON.stringify(activeStudent);
    if (serialized === lastSavedProfile.current) return;
    lastSavedProfile.current = serialized;
    saveRemoteProfile(session.token, activeStudent).catch((err) => {
      console.error('Failed to save profile', err);
    });
  }, [activeStudent, session, isSessionVerified]);

  if (!session) {
    return <LoginPortal onLoggedIn={applySession} />;
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans w-full max-w-full overflow-x-hidden">
      {/* Strict Top Navigation Bar with Closest Assessment Countdown */}
      <Navbar
        currentRole={currentRole}
        authUser={authUser}
        onSelectRole={handleSelectRole}
        activeStudent={activeStudent}
        students={students}
        onSelectStudent={handleSelectStudent}
        onResetData={handleResetData}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenMyPage={() => {
          setActiveTab('mypage');
          if (currentRole !== 'student') setCurrentRole('student');
        }}
        onOpenLoginPortal={handleLogout}
        onAttemptTeacherAccess={() => setIsAccessDeniedOpen(true)}
        closestStudentAssessment={closestStudentAssessment}
        closestTeacherAssessment={closestTeacherAssessment}
        onOpenLockScreen={() => setIsLockScreenOpen(true)}
        onOpenFullMenu={() => setIsFullMenuOpen(true)}
        onOpenClosestDetail={(asmt) => {
          if (currentRole === 'teacher') {
            setCurrentRole('teacher');
          } else {
            setSelectedAssessmentForModal(asmt);
          }
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentRole === 'solverthon' ? (
          <SolverthonPitchView
            students={students}
            assessments={assessments}
            weeklySchedule={weeklySchedule}
            onGoToDualCompare={() => setCurrentRole('dual_compare')}
            onGoToStudentHome={() => {
              setCurrentRole('student');
              setActiveTab('home');
            }}
            onGoToTeacherDashboard={() => handleSelectRole('teacher')}
            onOpenSlideDeck={() => setIsSlideDeckOpen(true)}
            onAddAssessment={handleAddAssessment}
          />
        ) : currentRole === 'dual_compare' ? (
          <DualCompareView
            students={students}
            assessments={assessments}
            weeklySchedule={weeklySchedule}
            onAddAssessment={handleAddAssessment}
            onOpenDetailModal={(asmt) => setSelectedAssessmentForModal(asmt)}
          />
        ) : currentRole === 'teacher' ? (
          <TeacherDashboard
            onTimetableSaved={() => setSettingsVersion((version) => version + 1)}
            students={students}
            defaultTeacherName={authUser.role === 'teacher' ? authUser.name : ''}
            assessments={assessments}
            weeklySchedule={weeklySchedule}
            onAddAssessment={handleAddAssessment}
            onUpdateAssessment={handleUpdateAssessment}
            onDeleteAssessment={handleDeleteAssessment}
          />
        ) : (
          /* Student Role */
          activeTab === 'mypage' ? (
            <MyPageView
              student={activeStudent}
              allStudents={students}
              onSelectStudent={handleSelectStudent}
              matchedAssessments={matchedAssessments}
              allAssessments={assessments}
              weeklySchedule={weeklySchedule}
              onOpenScheduleEditor={() => setIsScheduleEditorOpen(true)}
              onOpenComciganModal={() => setIsComciganModalOpen(true)}
              onOpenCampusMap={(roomKey) => {
                setCampusMapRoom(roomKey);
                setIsCampusMapOpen(true);
              }}
              onOpenMorningRoutine={() => setIsMorningRoutineOpen(true)}
              onOpenLockScreen={() => setIsLockScreenOpen(true)}
              onOpenDetailModal={(asmt) => setSelectedAssessmentForModal(asmt)}
              onToggleComplete={handleToggleComplete}
              onToggleSupply={handleToggleSupply}
              onBackToHome={() => setActiveTab('home')}
              onOpenLoginPortal={handleLogout}
            />
          ) : activeTab === 'matrix' ? (
            <WeeklyBlockMatrix
              schedule={weeklySchedule}
              activeStudent={activeStudent}
              students={students}
              assessments={assessments}
              onSelectStudent={handleSelectStudent}
              onOpenDetailModal={(asmt) => setSelectedAssessmentForModal(asmt)}
              onOpenScheduleEditor={() => setIsScheduleEditorOpen(true)}
            />
          ) : (
            <StudentHome
              student={activeStudent}
              matchedAssessments={matchedAssessments}
              allAssessments={assessments}
              weeklySchedule={weeklySchedule}
              onOpenScheduleEditor={() => setIsScheduleEditorOpen(true)}
              onOpenDetailModal={(asmt) => setSelectedAssessmentForModal(asmt)}
              onOpenCampusMap={(roomKey) => {
                setCampusMapRoom(roomKey);
                setIsCampusMapOpen(true);
              }}
              onOpenMorningRoutine={() => setIsMorningRoutineOpen(true)}
              onOpenComciganModal={() => setIsComciganModalOpen(true)}
              onOpenLockScreen={() => setIsLockScreenOpen(true)}
              onOpenFullMenu={() => setIsFullMenuOpen(true)}
              onOpenMyPage={() => setActiveTab('mypage')}
              onToggleSupply={handleToggleSupply}
              onToggleComplete={handleToggleComplete}
            />
          )
        )}
      </main>

      {/* Schedule Editor Modal */}
      {isScheduleEditorOpen && (
        <StudentScheduleEditor
          student={activeStudent}
          onSave={handleUpdateStudent}
          onClose={() => setIsScheduleEditorOpen(false)}
        />
      )}

      {/* Assessment Detail Modal */}
      {selectedAssessmentForModal && (
        <AssessmentDetailModal
          assessment={selectedAssessmentForModal}
          student={activeStudent}
          onSubmitted={() => {
            if (!activeStudent.completedAssessments.includes(selectedAssessmentForModal.id)) {
              handleToggleComplete(selectedAssessmentForModal.id);
            }
          }}
          onClose={() => setSelectedAssessmentForModal(null)}
          checkedSupplies={activeStudent.checkedSupplies[selectedAssessmentForModal.id] || []}
          onToggleSupply={(item) => handleToggleSupply(selectedAssessmentForModal.id, item)}
          onToggleComplete={() => handleToggleComplete(selectedAssessmentForModal.id)}
        />
      )}

      {/* Jungsan Campus Map Modal */}
      {isCampusMapOpen && (
        <CampusMapModal
          initialRoom={campusMapRoom}
          onClose={() => setIsCampusMapOpen(false)}
        />
      )}

      {/* Morning 30-sec Pack Routine Modal */}
      {isMorningRoutineOpen && (
        <MorningPackRoutine
          student={activeStudent}
          matchedAssessments={matchedAssessments}
          onToggleSupply={handleToggleSupply}
          onClose={() => setIsMorningRoutineOpen(false)}
        />
      )}

      {/* Solverthon 3-Min Fullscreen Slide Deck */}
      {isSlideDeckOpen && (
        <SolverthonSlideDeck
          students={students}
          assessments={assessments}
          weeklySchedule={weeklySchedule}
          onClose={() => setIsSlideDeckOpen(false)}
          onAddAssessment={handleAddAssessment}
        />
      )}

      {/* Comcigan Timetable Parser Integration Modal */}
      {isComciganModalOpen && (
        <ComciganImportModal
          student={activeStudent}
          weeklySchedule={weeklySchedule}
          onApplySchedule={(sched) => {
            setWeeklySchedule(sched);
            saveSchedule(sched);
          }}
          onClose={() => setIsComciganModalOpen(false)}
        />
      )}

      {/* Phone/Tablet Upper Notification Shade Modal (Replicating user's screenshot) */}
      {isLockScreenOpen && (
        <PhoneNotificationModal
          student={activeStudent}
          closestAssessment={closestStudentAssessment}
          onClose={() => setIsLockScreenOpen(false)}
          onOpenDetailModal={(asmt) => {
            setIsLockScreenOpen(false);
            setSelectedAssessmentForModal(asmt);
          }}
          onOpenCampusMap={(roomKey) => {
            setIsLockScreenOpen(false);
            setCampusMapRoom(roomKey);
            setIsCampusMapOpen(true);
          }}
          onToggleSupply={handleToggleSupply}
        />
      )}

      {/* Riroschool Full Menu Drawer Modal (Exact match to Screenshot 2) */}
      <RiroFullMenuModal
        isOpen={isFullMenuOpen}
        onClose={() => setIsFullMenuOpen(false)}
        student={activeStudent}
        urgentCount={matchedAssessments.filter((a) => !a.isCompleted && a.daysRemaining >= 0 && a.daysRemaining <= 2).length}
        onOpenCampusMap={(roomKey) => {
          setCampusMapRoom(roomKey);
          setIsCampusMapOpen(true);
        }}
        onOpenMorningRoutine={() => setIsMorningRoutineOpen(true)}
        onOpenLockScreen={() => setIsLockScreenOpen(true)}
        onOpenScheduleEditor={() => setIsScheduleEditorOpen(true)}
        onOpenMyPage={() => {
          setActiveTab('mypage');
          if (currentRole !== 'student') setCurrentRole('student');
        }}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (currentRole !== 'student') setCurrentRole('student');
        }}
      />

      {/* Teacher Access Denied Modal for Student Accounts */}
      {isAccessDeniedOpen && (
        <TeacherAccessDeniedModal
          studentName={authUser.role === 'student' ? authUser.name : activeStudent.name}
          onClose={() => setIsAccessDeniedOpen(false)}
          onOpenTeacherLogin={() => {
            setIsAccessDeniedOpen(false);
            handleLogout();
          }}
        />
      )}

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>중산고등학교 2026 중산 솔버톤 출품작</span>
            <span className="text-slate-400 font-normal">| 주제: 수행평가·준비물 알림</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>주최: 중산고등학교 ICT기획부</span>
            <span>·</span>
            <span>선택과목 A·B·C·D 블록 자동 연동</span>
            <span>·</span>
            <span>2026. 10. 31.(토) 대회</span>
            <span>·</span>
            <span>{isRemoteOnline ? '서버 동기화 중' : '이 브라우저에만 저장 중'}</span>
          </div>
        </div>
      </footer>

      {/* Persistent Bottom App Bar for Student Role (Exact match to screenshot) */}
      {currentRole === 'student' && (
        <RiroBottomBar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onRefresh={() => {
            // Re-sync storage data
            setAssessments(getStoredAssessments());
            setWeeklySchedule(getStoredSchedule());
            setStudents(getStoredStudents());
            pullRemoteAssessments();
          }}
          onGoBack={() => {
            if (activeTab === 'mypage' || activeTab === 'matrix') {
              setActiveTab('home');
            } else {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          onGoForward={() => {
            if (activeTab === 'home') {
              setActiveTab('mypage');
            } else if (activeTab === 'mypage') {
              setActiveTab('matrix');
            } else {
              setActiveTab('home');
            }
          }}
        />
      )}
    </div>
  );
}
