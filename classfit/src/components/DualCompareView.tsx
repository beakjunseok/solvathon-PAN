import React, { useState } from 'react';
import { Assessment, StudentProfile, WeeklyBlockSlot } from '../types';
import { matchStudentAssessments, formatDDay } from '../utils/scheduleMatcher';
import {
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Zap,
  Info,
  CheckSquare,
} from 'lucide-react';

interface DualCompareViewProps {
  students: StudentProfile[];
  assessments: Assessment[];
  weeklySchedule: WeeklyBlockSlot[];
  onAddAssessment: (asmt: Assessment) => void;
  onOpenDetailModal: (asmt: any) => void;
}

export const DualCompareView: React.FC<DualCompareViewProps> = ({
  students,
  assessments,
  weeklySchedule,
  onAddAssessment,
  onOpenDetailModal,
}) => {
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  const studentA = students[0]; // Kim Minjun
  const studentB = students[1]; // Lee Seoyeon

  const matchedA = matchStudentAssessments(studentA, assessments, weeklySchedule);
  const matchedB = matchStudentAssessments(studentB, assessments, weeklySchedule);

  const handleQuickAddPhysics = () => {
    const newAsmt: Assessment = {
      id: `asmt-demo-phy-${Date.now()}`,
      subject: '물리Ⅱ',
      block: 'E',
      targetGrade: 3,
      title: '물리Ⅱ 빛의 간섭과 회절 MBL 광센서 즉석 탐구',
      type: '실험/탐구',
      date: '2026-10-30', // 금요일 3교시
      supplies: ['단일/이중 슬릿 세트', '레이저 포인터', '공학용 계산기'],
      description: '슬릿 간격과 스크린 거리에 따른 간섭 무늬 간격을 측정하고 파장을 계산합니다.',
      criteria: ['슬릿 간격 측정의 정밀도 (40점)', '파장 오차율 계산 (30점)', '실험 정리 (30점)'],
      teacherName: '박물리 선생님',
      createdAt: new Date().toISOString(),
    };
    onAddAssessment(newAsmt);
    setLastActionMessage('📢 선생님이 [물리Ⅱ (3학년 E블록)] 공지를 발행했습니다! -> 김민준 화면에만 즉시 추가됩니다.');
    setTimeout(() => setLastActionMessage(null), 5000);
  };

  const handleQuickAddLifeScience = () => {
    const newAsmt: Assessment = {
      id: `asmt-demo-bio-${Date.now()}`,
      subject: '생명과학Ⅱ',
      block: 'E',
      targetGrade: 3,
      title: '생명과학Ⅱ PCR 증폭 산물 아가로스 겔 전기영동 밴드 판독',
      type: '실험/탐구',
      date: '2026-10-30', // 금요일 3교시
      supplies: ['UV 차단 안경', '라텍스 장갑', '실험 관찰 기록지'],
      description: 'DNA 염기서열 증폭 산물의 겔 사진을 촬영하여 bp 단위 크기를 판독합니다.',
      criteria: ['마커 밴드 대조 분석 정확도 (40점)', '염색 시약 안전 규정 (30점)', '결과 도출 (30점)'],
      teacherName: '최생명 선생님',
      createdAt: new Date().toISOString(),
    };
    onAddAssessment(newAsmt);
    setLastActionMessage('📢 선생님이 [생명과학Ⅱ (3학년 E블록)] 공지를 발행했습니다! -> 이서연 화면에만 즉시 추가됩니다.');
    setTimeout(() => setLastActionMessage(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Demo Guide Header */}
      <div className="bg-linear-to-r from-amber-600 via-indigo-700 to-indigo-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-200 text-xs font-bold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>발표 및 심사용 핵심 시연 모드</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              같은 반(3학년 2반) 두 학생의 실시간 화면 대조 시연
            </h1>
            <p className="text-xs sm:text-sm text-slate-100 mt-1 max-w-3xl leading-relaxed">
              선생님은 공지를 <strong>단 1번만</strong> 올리지만, 학생의 3학년 E~H 블록 선택과목에 따라
              <strong> 김민준에게는 물리Ⅱ·화학Ⅱ</strong>가, <strong>이서연에게는 생명과학Ⅱ·경제</strong>가
              각자의 교실과 교시로 자동 계산되어 다르게 나타납니다.
            </p>
          </div>

          {/* Quick Demo Triggers */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 shrink-0 space-y-2">
            <div className="text-[11px] font-bold text-amber-200 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              발표자용 원클릭 공지 발행 테스트
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleQuickAddPhysics}
                className="px-3 py-1.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1"
              >
                + 물리Ⅱ 공지 즉시 등록
              </button>
              <button
                onClick={handleQuickAddLifeScience}
                className="px-3 py-1.5 bg-white text-rose-900 hover:bg-rose-50 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1"
              >
                + 생명과학Ⅱ 공지 즉시 등록
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Toast Feedback */}
        {lastActionMessage && (
          <div className="mt-4 p-3 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg animate-bounce">
            <Info className="w-4 h-4 shrink-0" />
            <span>{lastActionMessage}</span>
          </div>
        )}
      </div>

      {/* Side-by-side Dual Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Kim Minjun */}
        <div className="bg-white rounded-2xl border-2 border-indigo-200 p-5 shadow-xs space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center">
                김
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900 text-base">{studentA.name}</h2>
                  <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md font-semibold">
                    {studentA.grade}학년 {studentA.classNum}반 {studentA.studentNum}번
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  이공계열 선택 (물리Ⅱ / 화학Ⅱ / 세계사 / 심화영어)
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-indigo-700 tabular-nums">
                {matchedA.length}건 배정됨
              </span>
            </div>
          </div>

          {/* Student A Course Tags */}
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {studentA.courses.map((c) => (
              <div key={c.block} className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100/70">
                <span className="font-bold text-indigo-800 text-[10px] mr-1">{c.block}블록:</span>
                <span className="font-semibold text-slate-900">{c.subject}</span>
                <div className="text-[10px] text-slate-500 truncate">{c.room}</div>
              </div>
            ))}
          </div>

          {/* Matched Feed */}
          <div className="space-y-2.5 pt-2">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              김민준에게만 매칭된 맞춤 수행평가
            </h3>

            {matchedA.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">등록된 수행평가가 없습니다.</p>
            ) : (
              matchedA.map((asmt) => {
                const dDay = formatDDay(asmt.daysRemaining);
                return (
                  <div
                    key={asmt.id}
                    onClick={() => onOpenDetailModal(asmt)}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-indigo-300 transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded text-[10px]">
                          {dDay.text}
                        </span>
                        <span className="font-bold text-slate-900">{asmt.subject}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 text-[11px]">{asmt.type}</span>
                      </div>
                      <span className="text-[11px] text-indigo-600 font-bold tabular-nums">
                        {asmt.calculatedPeriod}교시
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{asmt.title}</h4>

                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <strong className="text-slate-700 font-medium truncate max-w-[180px]">
                          {asmt.studentRoom}
                        </strong>
                      </span>
                      <span className="tabular-nums text-slate-400">{asmt.date}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Lee Seoyeon */}
        <div className="bg-white rounded-2xl border-2 border-rose-200 p-5 shadow-xs space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-rose-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white font-bold flex items-center justify-center">
                이
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-slate-900 text-base">{studentB.name}</h2>
                  <span className="text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md font-semibold">
                    {studentB.grade}학년 {studentB.classNum}반 {studentB.studentNum}번
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  바이오·상경 선택 (생명과학Ⅱ / 지구과학Ⅱ / 경제 / 일본어Ⅱ)
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-rose-700 tabular-nums">
                {matchedB.length}건 배정됨
              </span>
            </div>
          </div>

          {/* Student B Course Tags */}
          <div className="grid grid-cols-2 gap-1.5 text-xs">
            {studentB.courses.map((c) => (
              <div key={c.block} className="p-2 bg-rose-50/50 rounded-lg border border-rose-100/70">
                <span className="font-bold text-rose-800 text-[10px] mr-1">{c.block}블록:</span>
                <span className="font-semibold text-slate-900">{c.subject}</span>
                <div className="text-[10px] text-slate-500 truncate">{c.room}</div>
              </div>
            ))}
          </div>

          {/* Matched Feed */}
          <div className="space-y-2.5 pt-2">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
              이서연에게만 매칭된 맞춤 수행평가
            </h3>

            {matchedB.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">등록된 수행평가가 없습니다.</p>
            ) : (
              matchedB.map((asmt) => {
                const dDay = formatDDay(asmt.daysRemaining);
                return (
                  <div
                    key={asmt.id}
                    onClick={() => onOpenDetailModal(asmt)}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-rose-300 transition-all cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded text-[10px]">
                          {dDay.text}
                        </span>
                        <span className="font-bold text-slate-900">{asmt.subject}</span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 text-[11px]">{asmt.type}</span>
                      </div>
                      <span className="text-[11px] text-rose-600 font-bold tabular-nums">
                        {asmt.calculatedPeriod}교시
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{asmt.title}</h4>

                    <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        <strong className="text-slate-700 font-medium truncate max-w-[180px]">
                          {asmt.studentRoom}
                        </strong>
                      </span>
                      <span className="tabular-nums text-slate-400">{asmt.date}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
