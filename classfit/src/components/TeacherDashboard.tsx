import React, { useEffect, useState } from 'react';
import { Assessment, AssessmentSlot, BlockId, AssessmentType, FileRef, StudentProfile, SubmissionMode, SubmissionSettings, WeeklyBlockSlot } from '../types';
import { formatSlot, getDayOfWeekFromDate, getPeriodForBlockAndDate, DAY_KOREAN, TODAY_DATE_STR, getClosestTeacherAssessment, getDetailedTimeRemaining } from '../utils/scheduleMatcher';
import { FILE_ACCEPT, isRemoteConfigured, uploadFile, validateFile } from '../utils/remoteStore';
import { SubmissionStatusModal } from './SubmissionStatusModal';
import { TimetableManager } from './TimetableManager';
import { SchoolSubject, SubjectChooser, fetchSchoolSubjects } from './SubjectChooser';
import { saveTeacherSubjects } from '../utils/authClient';
import { AssessmentSlotPicker } from './AssessmentSlotPicker';
import { Plus, Trash2, Edit3, Calendar, Clock, BookOpen, AlertCircle, CheckCircle, Tag, Sparkles, X, Filter, Upload, ClipboardList } from 'lucide-react';

interface TeacherDashboardProps {
  students: StudentProfile[];
  defaultTeacherName: string;
  authToken: string;
  teacherSubjects: string[];
  onSubjectsSaved: (subjects: string[]) => void;
  onTimetableSaved: () => void;
  assessments: Assessment[];
  weeklySchedule: WeeklyBlockSlot[];
  onAddAssessment: (newAsmt: Assessment) => void;
  onUpdateAssessment: (updatedAsmt: Assessment) => void;
  onDeleteAssessment: (id: string) => void;
}

const ASSESSMENT_TYPES: AssessmentType[] = [
  '실험/탐구',
  '논술/서술',
  '구술/발표',
  '프로젝트',
  '포트폴리오',
  '단원평가',
];

const COMMON_SUPPLIES = [
  '공학용 계산기',
  '실험 가운',
  '30cm 자',
  '컴퓨터용 사인펜',
  '검은색 볼펜',
  '수정테이프',
  '태블릿 PC',
  '발표 큐카드',
  '개인 학습지 철',
];

const ANALYZABLE_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
const MAX_ANALYSIS_BYTES = 3 * 1024 * 1024;

// AI가 쓴 과목명을 학생 수강 정보의 표기로 맞춰야 평가가 학생에게 연결된다.
function normalizeSubject(subject: string): string {
  return subject
    .replace(/\s/g, '')
    .replace(/Ⅱ|II/gi, '2')
    .replace(/Ⅰ|I/gi, '1')
    .toLowerCase();
}

function matchKnownSubject(subject: string, students: StudentProfile[]): string {
  const target = normalizeSubject(subject);
  const known = students.flatMap((s) => s.courses.map((c) => c.subject));
  return known.find((name) => normalizeSubject(name) === target) || subject;
}

function getLocalDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('파일을 읽지 못했습니다.'));
    reader.readAsDataURL(file);
  });
}

function getDefaultDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  students,
  defaultTeacherName,
  authToken,
  teacherSubjects,
  onSubjectsSaved,
  onTimetableSaved,
  assessments,
  weeklySchedule,
  onAddAssessment,
  onUpdateAssessment,
  onDeleteAssessment,
}) => {
  const [filterGrade, setFilterGrade] = useState<'ALL' | '1' | '2' | '3'>('ALL');
  const [filterBlock, setFilterBlock] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimetableOpen, setIsTimetableOpen] = useState(false);
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(teacherSubjects.length === 0);
  const [subjectDraft, setSubjectDraft] = useState<string[]>(teacherSubjects);
  const [subjectError, setSubjectError] = useState('');
  const [schoolSubjects, setSchoolSubjects] = useState<SchoolSubject[]>([]);

  useEffect(() => {
    fetchSchoolSubjects()
      .then(setSchoolSubjects)
      .catch((err) => console.error('Failed to load subjects', err));
  }, []);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [targetGrade, setTargetGrade] = useState(3);
  const [block, setBlock] = useState<BlockId>('E');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<AssessmentType>('실험/탐구');
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<AssessmentSlot[]>([]);
  const [supplies, setSupplies] = useState<string[]>([]);
  const [newSupplyInput, setNewSupplyInput] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState<string[]>([]);
  const [newCriterionInput, setNewCriterionInput] = useState('');
  const [teacherName, setTeacherName] = useState(defaultTeacherName);
  const [documents, setDocuments] = useState<FileRef[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [analysisFile, setAnalysisFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMessage, setAnalysisMessage] = useState('');
  const [submissionEnabled, setSubmissionEnabled] = useState(false);
  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>('both');
  const [submissionDeadline, setSubmissionDeadline] = useState('');
  const [statusAssessment, setStatusAssessment] = useState<Assessment | null>(null);

  // Preview of period based on date and block

  // Closest assessment for teacher banner
  const closestUpcoming = getClosestTeacherAssessment(assessments, weeklySchedule);
  const closestTimeInfo = closestUpcoming ? getDetailedTimeRemaining(closestUpcoming.date, closestUpcoming.period) : null;

  const resetForm = () => {
    setTargetGrade(3);
    setBlock('E');
    setSubject('');
    setTitle('');
    setType('실험/탐구');
    setDate('');
    setSlots([]);
    setSupplies([]);
    setNewSupplyInput('');
    setDescription('');
    setCriteria([]);
    setNewCriterionInput('');
    setTeacherName(defaultTeacherName);
    setDocuments([]);
    setUploadError('');
    setAnalysisFile(null);
    setAnalysisMessage('');
    setSubmissionEnabled(false);
    setSubmissionMode('both');
    setSubmissionDeadline('');
    setEditingId(null);
  };

  const handleGradeChangeInForm = (newGrade: number) => {
    setTargetGrade(newGrade);
    setSlots([]);
    // 학년이 바뀌면 그 학년의 내 과목으로 맞춘다.
    const nextSubjects = schoolSubjects.filter((item) => item.grades.includes(newGrade)).map((item) => item.name);
    if (nextSubjects.length > 0 && !nextSubjects.includes(subject)) {
      setSubject(teacherSubjects.find((name) => nextSubjects.includes(name)) || '');
    }
    if (newGrade === 3) {
      if (['A', 'B', 'C', 'D'].includes(block)) {
        setBlock('E');
      }
    } else {
      if (['E', 'F', 'G', 'H'].includes(block)) {
        setBlock('A');
      }
    }
    if (newGrade === 1) setBlock('COMMON');
  };

  // 과목 목록이 늦게 도착해도 내 과목의 학년으로 맞춘다.
  useEffect(() => {
    if (!isModalOpen || editingId || !subject) return;
    const grades = schoolSubjects.find((item) => item.name === subject)?.grades || [];
    if (grades.length > 0 && !grades.includes(targetGrade)) handleGradeChangeInForm(grades[0]);
  }, [schoolSubjects]);

  const gradeSubjectNames = schoolSubjects
    .filter((item) => item.grades.includes(targetGrade))
    .map((item) => item.name);
  const myGradeSubjects = teacherSubjects.filter((name) => gradeSubjectNames.includes(name));

  const handleSaveSubjects = async () => {
    setSubjectError('');
    try {
      const saved = await saveTeacherSubjects(authToken, subjectDraft);
      onSubjectsSaved(saved);
      setIsSubjectsOpen(false);
    } catch (err) {
      setSubjectError(err instanceof Error ? err.message : '담당 과목을 저장하지 못했습니다.');
    }
  };

  const handleOpenAddModal = () => {
    resetForm();
    if (teacherSubjects.length > 0) {
      const grades = schoolSubjects.find((item) => item.name === teacherSubjects[0])?.grades || [];
      if (grades.length > 0) setTargetGrade(grades[0]);
      setSubject(teacherSubjects[0]);
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (asmt: Assessment) => {
    setEditingId(asmt.id);
    setSubject(asmt.subject);
    setBlock(asmt.block);
    setTargetGrade(asmt.targetGrade || 3);
    setTitle(asmt.title);
    setType(asmt.type);
    setDate(asmt.date);
    setSlots(asmt.slots || []);
    setSupplies(asmt.supplies);
    setDescription(asmt.description);
    setCriteria(asmt.criteria || []);
    setTeacherName(asmt.teacherName);
    setDocuments(asmt.documents || []);
    setSubmissionEnabled(Boolean(asmt.submission?.enabled));
    setSubmissionMode(asmt.submission?.mode || 'both');
    setSubmissionDeadline(asmt.submission?.deadline || '');
    setIsModalOpen(true);
  };

  const handleAddSupply = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !supplies.includes(trimmed)) {
      setSupplies([...supplies, trimmed]);
      setNewSupplyInput('');
    }
  };

  const handleRemoveSupply = (item: string) => {
    setSupplies(supplies.filter((s) => s !== item));
  };

  const handleAddCriterion = () => {
    const trimmed = newCriterionInput.trim();
    if (trimmed) {
      setCriteria([...criteria, trimmed]);
      setNewCriterionInput('');
    }
  };

  const handleRemoveCriterion = (idx: number) => {
    setCriteria(criteria.filter((_, i) => i !== idx));
  };

  const getSortedSlots = () => {
    return [...slots].sort((a, b) => a.date.localeCompare(b.date) || a.period - b.period);
  };

  const getLastSlotDate = () => {
    const sorted = getSortedSlots();
    return sorted.length > 0 ? sorted[sorted.length - 1].date : getLocalDate(new Date());
  };

  // 첫 칸의 값은 교사 화면의 일정 정렬에 쓰고, 학생별 날짜는 slots로 계산한다.
  const buildScheduleFields = () => {
    const [first] = getSortedSlots();
    return {
      slots: getSortedSlots(),
      date: first.date,
      block: first.block || ('COMMON' as BlockId),
      periodOverride: first.period,
    };
  };

  const buildSubmissionSettings = (): SubmissionSettings | undefined => {
    if (!submissionEnabled) return undefined;
    return {
      enabled: true,
      mode: submissionMode,
      deadline: submissionDeadline || `${getLastSlotDate()}T23:59`,
    };
  };

  const handleUploadDocuments = async (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;
    setUploadError('');
    setIsUploading(true);
    try {
      const uploaded: FileRef[] = [];
      for (const file of Array.from(selected)) {
        const invalid = validateFile(file);
        if (invalid) {
          setUploadError(invalid);
          continue;
        }
        uploaded.push(await uploadFile('assessments', file));
        if (ANALYZABLE_TYPES.includes(file.type) && file.size <= MAX_ANALYSIS_BYTES) {
          setAnalysisFile(file);
        }
      }
      setDocuments((current) => [...current, ...uploaded]);
    } catch {
      setUploadError('문서를 올리지 못했습니다. Supabase 설정을 확인해 주세요.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyzeDocument = async () => {
    if (!analysisFile) return;
    setIsAnalyzing(true);
    setUploadError('');
    setAnalysisMessage('');
    try {
      const data = await readFileAsBase64(analysisFile);
      const response = await fetch('/api/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, mimeType: analysisFile.type, today: getLocalDate(new Date()) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      if (result.targetGrade) handleGradeChangeInForm(result.targetGrade);
      if (result.block) setBlock(result.block);
      if (result.subject) setSubject(matchKnownSubject(result.subject, students));
      if (result.title) setTitle(result.title);
      if (result.type) setType(result.type);
      if (result.date) setDate(result.date);
      if (result.description) setDescription(result.description);
      if (result.supplies.length > 0) setSupplies(result.supplies);
      if (result.criteria.length > 0) setCriteria(result.criteria);
      setAnalysisMessage('문서 내용을 채웠습니다. 시간표 칸을 체크하고 내용을 확인해 주세요.');
    } catch (err) {
      setUploadError(err instanceof Error && err.message ? err.message : '문서를 분석하지 못했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || slots.length === 0) return;

    if (editingId) {
      const updated: Assessment = {
        id: editingId,
        subject,
        block,
        targetGrade,
        title,
        type,
        date,
        supplies,
        description,
        criteria,
        teacherName,
        documents,
        submission: buildSubmissionSettings(),
        ...buildScheduleFields(),
        createdAt: new Date().toISOString(),
      };
      onUpdateAssessment(updated);
    } else {
      const newAsmt: Assessment = {
        id: `asmt-${Date.now()}`,
        subject,
        block,
        targetGrade,
        title,
        type,
        date,
        supplies,
        description,
        criteria,
        teacherName,
        documents,
        submission: buildSubmissionSettings(),
        ...buildScheduleFields(),
        createdAt: new Date().toISOString(),
      };
      onAddAssessment(newAsmt);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const filteredAssessments = assessments.filter((a) => {
    if (filterGrade !== 'ALL' && a.targetGrade !== Number(filterGrade)) return false;
    if (filterBlock === 'ALL') return true;
    return a.block === filterBlock;
  }).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Teacher Mode Security Notice */}
      <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
          <span className="font-bold">선생님 전용 공지 관리 센터 (교원 인증 모드)</span>
          <span className="text-amber-700 hidden sm:inline">| 학생용 화면이 완전히 분리되어 표시되지 않습니다.</span>
        </div>
        <span className="font-semibold text-[11px] bg-amber-200/80 px-2.5 py-0.5 rounded-full">
          교원 권한
        </span>
      </div>

      {/* Closest Assessment Banner for Teachers */}
      {closestUpcoming && closestTimeInfo && (
        <aside
          aria-label="학교 다음 임박 수행평가 일정"
          className="rounded-2xl bg-slate-900 border-2 border-amber-400 p-4 sm:p-5 text-white shadow-xl relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[11px] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 fill-slate-950 stroke-amber-400" />
                  가장 가까운 학교 수행평가 일정
                </span>
                <span className="font-mono font-bold text-amber-300 text-xs">
                  {closestTimeInfo.humanBadge} · {closestTimeInfo.detailedText}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-amber-300 font-black text-base">
                  [{closestUpcoming.subject}]
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                  {closestUpcoming.title}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                <span>
                  대상: <strong className="text-white">{closestUpcoming.targetGrade}학년</strong> ({closestUpcoming.block === 'COMMON' ? '공통' : `${closestUpcoming.block}블록`})
                </span>
                <span>·</span>
                <span>
                  일자: <strong className="text-amber-200">{closestUpcoming.date} ({closestUpcoming.dayStr}) {closestUpcoming.period}교시</strong>
                </span>
                <span>·</span>
                <span>담당: {closestUpcoming.teacherName}</span>
                {closestUpcoming.supplies.length > 0 && (
                  <>
                    <span>·</span>
                    <span className="text-slate-400">준비물: {closestUpcoming.supplies.join(', ')}</span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => handleOpenEditModal(closestUpcoming)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors shrink-0"
            >
              공지 수정하기
            </button>
          </div>
        </aside>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
            <BookOpen className="w-4 h-4" />
            <span>중산고 교원 전용 블록 매칭 공지서 등록기</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            선생님 수행평가 공지 관리
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            과목을 고르고 평가를 보는 시간표 칸을 체크하면, 그 칸에 해당하는 학생에게만 평가가 보입니다.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => {
              setSubjectDraft(teacherSubjects);
              setIsSubjectsOpen(true);
            }}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            담당 과목
          </button>
          <button
            onClick={() => setIsTimetableOpen(true)}
            className="px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            시간표 관리
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            새 수행평가 등록
          </button>
        </div>
      </div>

      {/* Grade & Block Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold text-slate-700">학년 필터:</span>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
              <button
                onClick={() => {
                  setFilterGrade('ALL');
                  setFilterBlock('ALL');
                }}
                className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                  filterGrade === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                전체 학년
              </button>
              <button
                onClick={() => {
                  setFilterGrade('3');
                  setFilterBlock('ALL');
                }}
                className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                  filterGrade === '3' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                3학년 (E~H 블록)
              </button>
              {(['2', '1'] as const).map((grade) => (
                <button
                  key={grade}
                  onClick={() => {
                    setFilterGrade(grade);
                    setFilterBlock('ALL');
                  }}
                  className={`px-2.5 py-1 rounded-md transition-all font-semibold ${
                    filterGrade === grade ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  {grade === '2' ? '2학년 (A~D 블록)' : '1학년 (공통과목만)'}
                </button>
              ))}
            </div>
          </div>

          <div className="text-slate-500">
            등록된 공지 총 <strong className="text-slate-900 tabular-nums">{filteredAssessments.length}건</strong>
          </div>
        </div>

        {/* Sub Block Filters */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] text-slate-400 font-medium">블록 선택:</span>
          <button
            onClick={() => setFilterBlock('ALL')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              filterBlock === 'ALL' ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            전체 블록
          </button>

          {/* 3rd grade blocks */}
          {(filterGrade === 'ALL' || filterGrade === '3') && (
            <>
              {['E', 'F', 'G', 'H'].map((b) => (
                <button
                  key={b}
                  onClick={() => setFilterBlock(b)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    filterBlock === b ? 'bg-indigo-600 text-white font-bold' : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                  }`}
                >
                  {b}블록 (3학년)
                </button>
              ))}
            </>
          )}

          {/* 1, 2 grade blocks */}
          {(filterGrade === 'ALL' || filterGrade === '2') && (
            <>
              {['A', 'B', 'C', 'D'].map((b) => (
                <button
                  key={b}
                  onClick={() => setFilterBlock(b)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    filterBlock === b ? 'bg-emerald-600 text-white font-bold' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  {b}블록 (2학년)
                </button>
              ))}
            </>
          )}

          <button
            onClick={() => setFilterBlock('COMMON')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
              filterBlock === 'COMMON' ? 'bg-slate-700 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            공통과목
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-3">
        {filteredAssessments.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">해당 조건에 등록된 수행평가 공지가 없습니다.</p>
          </div>
        ) : (
          filteredAssessments.map((asmt) => {
            const periodInfo = getPeriodForBlockAndDate(asmt.block, asmt.date, weeklySchedule, asmt.periodOverride, asmt.targetGrade);
            return (
              <div
                key={asmt.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 text-xs font-semibold flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono text-[11px] font-bold">
                        {asmt.block === 'COMMON' ? '공통과목' : `${asmt.block}블록 선택`}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-900 font-bold">{asmt.subject}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-indigo-800 font-medium bg-indigo-50/80 px-2 py-0.5 rounded text-[11px]">
                        {asmt.targetGrade}학년 대상 ({asmt.targetGrade === 3 ? 'E~H블록' : 'A~D블록'})
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">{asmt.type}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{asmt.title}</h3>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {asmt.description}
                    </p>

                    {/* Auto-matching info banner */}
                    <div className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {asmt.slots?.length
                            ? `${asmt.slots.length}개 칸: ${asmt.slots.slice(0, 3).map(formatSlot).join(', ')}${asmt.slots.length > 3 ? ' 외' : ''}`
                            : `일자: ${asmt.date} (${periodInfo.dayStr.slice(0, 1)})`}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 font-semibold text-indigo-900">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        {!asmt.slots?.length && <span>자동 계산 교시: {periodInfo.period}교시</span>}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        담당: {asmt.teacherName}
                      </div>
                    </div>

                    {/* Supplies Chips */}
                    {(asmt.documents?.length || asmt.submission?.enabled) && (
                      <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-600">
                        {!!asmt.documents?.length && <span>문서 {asmt.documents.length}개</span>}
                        {asmt.submission?.enabled && (
                          <span>제출 마감 {asmt.submission.deadline.replace('T', ' ')}</span>
                        )}
                      </div>
                    )}
                    {asmt.supplies.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[11px] font-semibold text-slate-500">준비물:</span>
                        {asmt.supplies.map((s) => (
                          <span
                            key={s}
                            className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {asmt.submission?.enabled && (
                      <button
                        onClick={() => setStatusAssessment(asmt)}
                        className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <ClipboardList className="w-4 h-4" />
                        제출 현황
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEditModal(asmt)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="수정"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteAssessment(asmt.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isSubjectsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 space-y-3 shadow-2xl">
            <div>
              <h2 className="text-base font-bold text-slate-900">담당 과목 선택</h2>
              <p className="text-xs text-slate-500 mt-0.5">가르치는 과목을 모두 골라 주세요. 평가 등록에 바로 나타납니다.</p>
            </div>
            <SubjectChooser value={subjectDraft} onChange={setSubjectDraft} />
            {subjectError && <p className="text-xs font-semibold text-rose-700">{subjectError}</p>}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsSubjectsOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                닫기
              </button>
              <button
                onClick={handleSaveSubjects}
                disabled={subjectDraft.length === 0}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {isTimetableOpen && (
        <TimetableManager onClose={() => setIsTimetableOpen(false)} onSaved={onTimetableSaved} />
      )}

      {statusAssessment && (
        <SubmissionStatusModal
          assessment={statusAssessment}
          students={students}
          onClose={() => setStatusAssessment(null)}
        />
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                {editingId ? '수행평가 공지 수정' : '새 수행평가 공지 작성'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Target Grade & Block Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">대상 학년</label>
                  <select
                    value={targetGrade}
                    onChange={(e) => handleGradeChangeInForm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={3}>3학년 (E,F,G,H블록)</option>
                    <option value={2}>2학년 (A,B,C,D블록)</option>
                    <option value={1}>1학년 (공통과목만)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">과목명</label>
                  <select
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="">과목을 고르세요</option>
                    {subject && !gradeSubjectNames.includes(subject) && <option value={subject}>{subject}</option>}
                    {myGradeSubjects.length > 0 && (
                      <optgroup label="내 과목">
                        {myGradeSubjects.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label={`${targetGrade}학년 과목`}>
                      {gradeSubjectNames
                        .filter((name) => !myGradeSubjects.includes(name))
                        .map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Title & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">수행평가 제목</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 전자기 유도 법칙 탐구 실험 및 보고서 작성"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">평가 유형</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AssessmentType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {ASSESSMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">담당 선생님 성함</label>
                <input
                  type="text"
                  required
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <AssessmentSlotPicker
                grade={targetGrade}
                subject={subject}
                slots={slots}
                focusDate={date}
                onChange={setSlots}
              />

              {/* Assessment Documents */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="block font-semibold text-slate-700">수행평가 안내 문서</label>
                {isRemoteConfigured ? (
                  <label className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-dashed border-slate-400 rounded-lg font-semibold text-slate-700 cursor-pointer hover:bg-slate-50">
                    <Upload className="w-4 h-4" />
                    {isUploading ? '올리는 중입니다' : 'PDF, 한글, 워드 등 문서 올리기 (20MB 이하)'}
                    <input
                      type="file"
                      multiple
                      accept={FILE_ACCEPT}
                      disabled={isUploading}
                      className="sr-only"
                      onChange={(e) => {
                        handleUploadDocuments(e.target.files);
                        e.target.value = '';
                      }}
                    />
                  </label>
                ) : (
                  <p className="text-amber-700">서버가 연결되지 않아 문서를 올릴 수 없습니다. 내용은 아래에 직접 입력해 주세요.</p>
                )}
                {uploadError && <p className="font-semibold text-rose-700">{uploadError}</p>}
                {analysisFile && (
                  <button
                    type="button"
                    onClick={handleAnalyzeDocument}
                    disabled={isAnalyzing}
                    className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    {isAnalyzing ? '문서를 읽는 중입니다' : `AI로 ${analysisFile.name} 내용 채우기`}
                  </button>
                )}
                {analysisMessage && <p className="font-semibold text-emerald-700">{analysisMessage}</p>}
                {documents.map((file) => (
                  <div key={file.path} className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200">
                    <span className="truncate text-slate-800">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setDocuments(documents.filter((d) => d.path !== file.path))}
                      className="text-slate-400 hover:text-rose-600 px-1"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Online Submission Settings */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={submissionEnabled}
                    onChange={(e) => setSubmissionEnabled(e.target.checked)}
                    className="w-4 h-4"
                  />
                  이 웹에서 과제 제출 받기 (디벗 제출)
                </label>
                {submissionEnabled && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 mb-1">제출 방식</label>
                      <select
                        value={submissionMode}
                        onChange={(e) => setSubmissionMode(e.target.value as SubmissionMode)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                      >
                        <option value="both">글 작성 + 파일 첨부</option>
                        <option value="text">글 작성만</option>
                        <option value="file">파일 첨부만</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">제출 마감</label>
                      <input
                        type="datetime-local"
                        required
                        value={submissionDeadline || `${getLastSlotDate()}T23:59`}
                        onChange={(e) => setSubmissionDeadline(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">평가 세부 내용 및 유의사항</label>
                <textarea
                  rows={3}
                  required
                  placeholder="학생들이 숙지해야 할 실험/평가 절차, 유의점 등을 기재하세요."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Supplies */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">학생 지참 준비물</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="준비물 입력 후 추가 (예: 공학용 계산기)"
                    value={newSupplyInput}
                    onChange={(e) => setNewSupplyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSupply(newSupplyInput);
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSupply(newSupplyInput)}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-semibold"
                  >
                    추가
                  </button>
                </div>

                {/* Quick Add Chips */}
                <div className="flex items-center gap-1.5 flex-wrap mb-2">
                  <span className="text-[11px] text-slate-400">자주 쓰는 준비물:</span>
                  {COMMON_SUPPLIES.slice(0, 6).map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handleAddSupply(item)}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                      + {item}
                    </button>
                  ))}
                </div>

                {/* Selected Supplies Chips */}
                <div className="flex flex-wrap gap-1.5 min-h-[30px] p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {supplies.length === 0 ? (
                    <span className="text-slate-400 italic">추가된 준비물이 없습니다.</span>
                  ) : (
                    supplies.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1 bg-white border border-slate-300 px-2 py-0.5 rounded-md text-slate-800 font-medium"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => handleRemoveSupply(item)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Rubric Criteria */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">평가 루브릭 / 배점 기준</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="채점 기준 입력 (예: 탐구 설계 및 가설 설정 (30점))"
                    value={newCriterionInput}
                    onChange={(e) => setNewCriterionInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCriterion();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCriterion}
                    className="px-3 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-semibold"
                  >
                    항목 추가
                  </button>
                </div>

                <div className="space-y-1.5">
                  {criteria.map((crit, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <span className="text-slate-700">
                        {idx + 1}. {crit}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterion(idx)}
                        className="text-slate-400 hover:text-rose-600 px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={slots.length === 0}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-sm transition-all"
                >
                  {editingId ? '공지 수정 완료' : '공지 발행하기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
