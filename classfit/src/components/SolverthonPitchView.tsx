import React, { useState } from 'react';
import { Assessment, StudentProfile, WeeklyBlockSlot } from '../types';
import { JungsanLogo } from './JungsanLogo';
import { parseNotice } from '../utils/noticeParser';
import {
  Trophy,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Play,
  FileText,
  Clock,
  Layers,
  Send,
  Zap,
} from 'lucide-react';

interface SolverthonPitchViewProps {
  students: StudentProfile[];
  assessments: Assessment[];
  weeklySchedule: WeeklyBlockSlot[];
  onGoToDualCompare: () => void;
  onGoToStudentHome: () => void;
  onGoToTeacherDashboard: () => void;
  onOpenSlideDeck: () => void;
  onAddAssessment: (asmt: Assessment) => void;
}

export const SolverthonPitchView: React.FC<SolverthonPitchViewProps> = ({
  students,
  assessments,
  weeklySchedule,
  onGoToDualCompare,
  onGoToStudentHome,
  onGoToTeacherDashboard,
  onOpenSlideDeck,
  onAddAssessment,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [riroInput, setRiroInput] = useState(
    '[중산고 3학년 공지] 11월 4일(수) E블록 물리Ⅱ 시간에 전자기 유도 탐구 실험평가를 실시합니다. 준비물은 공학용 계산기와 실험 가운입니다. 신관 3층 물리실험실로 이동하세요.'
  );
  const [riroResult, setRiroResult] = useState<{ ok: boolean; message: string } | null>(null);

  const handleParseRiroNotice = () => {
    const knownSubjects = [
      ...students.flatMap((s) => s.courses.map((c) => c.subject)),
      ...assessments.map((a) => a.subject),
    ];
    const parsed = parseNotice(riroInput, new Date(), knownSubjects);

    if (parsed.missing.length > 0 || !parsed.grade || !parsed.block) {
      setRiroResult({
        ok: false,
        message: `공지에서 ${parsed.missing.join(', ')} 항목을 찾지 못해 등록하지 않았습니다. 공지 글을 보완해 주세요.`,
      });
      return;
    }

    const newAsmt: Assessment = {
      id: `asmt-notice-${Date.now()}`,
      subject: parsed.subject,
      block: parsed.block,
      targetGrade: parsed.grade,
      title: parsed.title,
      type: parsed.type,
      date: parsed.date,
      supplies: parsed.supplies,
      description: riroInput.trim(),
      criteria: [],
      teacherName: '담당 선생님',
      createdAt: new Date().toISOString(),
    };
    onAddAssessment(newAsmt);

    const targets = students.filter(
      (s) =>
        s.grade === parsed.grade &&
        s.courses.some((c) => c.block === parsed.block && c.subject === parsed.subject)
    );
    const suppliesText = parsed.supplies.length > 0 ? parsed.supplies.join(', ') : '없음';
    setRiroResult({
      ok: true,
      message: `${parsed.date} ${parsed.grade}학년 ${parsed.block}블록 ${parsed.subject} 「${parsed.title}」 등록 완료 (준비물: ${suppliesText}, 교실: ${parsed.room || '학생별 수강 교실'}) · 표시 대상 ${targets.length}명: ${targets.map((s) => s.name).join(', ') || '없음'}`,
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-amber-400 text-slate-950 font-black text-xs tracking-wider uppercase flex items-center gap-1 shadow-sm">
                <Trophy className="w-3.5 h-3.5" />
                2026 중산 솔버톤 출품작
              </span>
              <span className="text-xs text-slate-300 font-medium">
                중산고등학교 ICT기획부 주최
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <JungsanLogo size={42} className="bg-white rounded-full p-0.5" />
              <span>중산고 맞춤 수행평가·준비물 알림</span>
            </h1>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              <strong>"중산고 문제를 해결할 수 있는 모든 것 개발"</strong> — 선택과목제 도입으로
              같은 반이어도 A~D 블록마다 뿔뿔이 흩어지는 중산고 학생들을 위해,
              선생님의 1회 공지와 학생 개인 시간표를 자동 연결합니다.
            </p>
          </div>

          <div className="shrink-0 flex flex-col gap-2">
            <button
              onClick={onOpenSlideDeck}
              className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4 text-slate-950" />
              🖥️ 3분 피칭 슬라이드 모드 (발표용)
            </button>
            <button
              onClick={onGoToDualCompare}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              핵심 시연(듀얼 뷰) 바로가기
            </button>
            <div className="text-[11px] text-slate-400 text-center">
              키보드 화살표(←, →) 지원
            </div>
          </div>
        </div>
      </div>

      {/* Problem & Solution Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* The Problem in Jungsan High */}
        <div className="bg-white rounded-2xl border border-rose-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            중산고의 현실 문제 (Problem)
          </div>
          <h2 className="text-base font-bold text-slate-900 leading-snug">
            "같은 3학년 2반인데 왜 공지는 남의 이야기 같을까요?"
          </h2>
          <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">1.</span>
              <span>
                <strong>선택과목 블록제:</strong> A블록에 누구는 물리Ⅱ(신관 3층), 누구는 생명과학Ⅱ(본관 3층)를 듣습니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">2.</span>
              <span>
                <strong>리로서쿨의 전체 공지:</strong> 과목별 공지가 무차별로 올라와 내가 듣는 과목인지 일일이 찾아봐야 합니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">3.</span>
              <span>
                <strong>준비물 및 교시 누락:</strong> 공지엔 날짜만 적혀 있어, 몇 교시인지 이동교실이 어디인지 몰라 지각하거나 계산기를 빠뜨립니다.
              </span>
            </li>
          </ul>
        </div>

        {/* The Solution */}
        <div className="bg-white rounded-2xl border border-indigo-200/80 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-indigo-600" />
            우리 팀의 솔루션 (Solution)
          </div>
          <h2 className="text-base font-bold text-slate-900 leading-snug">
            "선생님은 1번 공지, 학생은 1번 시간표 등록으로 끝"
          </h2>
          <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">1.</span>
              <span>
                <strong>블록 기반 자동 매칭:</strong> 학생 시간표와 대조하여 내가 수강하는 선택과목 평가만 필터링합니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">2.</span>
              <span>
                <strong>교시·교실 자동 계산:</strong> 중산고 주간 블록 배치표를 바탕으로 당일 몇 교시인지, 어느 특별실인지 자동 안내합니다.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 font-bold">3.</span>
              <span>
                <strong>D-Day & 준비물 체크리스트:</strong> 오늘/내일 수행평가 우선 알림과 체크박스로 준비물 누락을 0%로 줄입니다.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* 3-Step Live Demo Flow Controller */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              발표 리허설 & 심사위원 시연 가이드
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              솔버톤 심사위원을 사로잡는 3단계 시연 시나리오
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">추천 발표 시간: 3분</span>
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => setActiveStep(1)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeStep === 1
                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-indigo-700">STEP 1</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="font-bold text-xs text-slate-900">같은 반 학생 화면 비교</div>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
              3-2반 김민준과 이서연이 같은 반임에도 각자 다른 맞춤 화면을 봄
            </p>
          </button>

          <button
            onClick={() => setActiveStep(2)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeStep === 2
                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-indigo-700">STEP 2</span>
              <Send className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="font-bold text-xs text-slate-900">선생님 공지 즉시 발행</div>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
              공지 1회 작성 시 블록 시간표로 교시·교실 자동 변환 배포
            </p>
          </button>

          <button
            onClick={() => setActiveStep(3)}
            className={`p-3.5 rounded-xl border text-left transition-all ${
              activeStep === 3
                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="text-indigo-700">STEP 3</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="font-bold text-xs text-slate-900">준비물 & D-Day 알림</div>
            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
              D-0 오늘 평가 긴급 알림과 지참 준비물 실시간 체크
            </p>
          </button>
        </div>

        {/* Step Detail Explanation */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-3">
          {activeStep === 1 && (
            <div>
              <div className="font-bold text-slate-900 text-sm mb-1">
                🗣️ 발표 멘트: "심사위원 여러분, 같은 3학년 2반 교실에 앉아 있는 두 학생의 스마트폰 화면을 보여드리겠습니다."
              </div>
              <p className="text-slate-600 leading-relaxed">
                김민준 학생은 물리Ⅱ와 화학Ⅱ를 선택하여 3교시 신관 3층 물리실험실 평가가 보이지만,
                옆자리 이서연 학생에게는 생명과학Ⅱ와 경제 평가가 뜹니다.
                단 하나의 시스템으로 각자의 시간표에 맞게 100% 개인화됩니다.
              </p>
              <div className="pt-2">
                <button
                  onClick={onGoToDualCompare}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  듀얼 비교 화면 열기 <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div>
              <div className="font-bold text-slate-900 text-sm mb-1">
                🗣️ 발표 멘트: "선생님은 과목과 일자만 입력하면 끝납니다. 교시 계산은 시스템이 알아서 합니다."
              </div>
              <p className="text-slate-600 leading-relaxed">
                선생님은 학생들의 개별 시간표를 일일이 대조할 필요가 없습니다. 과목과 블록(A~D)을 지정하면,
                중산고 주간 블록표에서 자동으로 당일 교시(예: 화요일 3교시)를 찾아 학생에게 전달합니다.
              </p>
              <div className="pt-2">
                <button
                  onClick={onGoToTeacherDashboard}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  선생님 공지 작성창 열기 <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div>
              <div className="font-bold text-slate-900 text-sm mb-1">
                🗣️ 발표 멘트: "수행평가 당일 계산기나 실험 가운을 두고 와서 감점당하는 일이 사라집니다."
              </div>
              <p className="text-slate-600 leading-relaxed">
                D-0 당일 평가가 상단에 강조되며, 준비물 체크리스트(공학용 계산기, 실험 가운, 볼펜 등)를
                하나씩 체크하여 등교 전 완벽하게 준비할 수 있습니다.
              </p>
              <div className="pt-2">
                <button
                  onClick={onGoToStudentHome}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  학생 맞춤 홈 확인하기 <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Riroschool Notice Auto-Parser Feature */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
              중산고 리로서쿨 연계
            </span>
            <h3 className="font-bold text-slate-900 text-sm">
              리로서쿨 일반 공지문 원클릭 블록 파서 (Riro-to-Block)
            </h3>
          </div>
          <span className="text-xs text-slate-500">교사 복사·붙여넣기 편의 기능</span>
        </div>

        <p className="text-xs text-slate-600">
          선생님이 리로서쿨 공지게시판에 올리던 공지 텍스트를 그대로 넣으면,
          시스템이 블록, 과목, 일자, 준비물을 자동 추출하여 학생 시간표로 변환합니다.
        </p>

        <div className="space-y-2">
          <textarea
            rows={3}
            value={riroInput}
            onChange={(e) => setRiroInput(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              * 포스터에 기재된 '중산고 문제를 해결할 수 있는 개발' 충실 반영
            </span>

            <button
              onClick={handleParseRiroNotice}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              리로서쿨 공지 맞춤 파싱 및 등록
            </button>
          </div>
        </div>

        {riroResult && (
          <div
            className={`p-3 border rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in ${
              riroResult.ok
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            {riroResult.ok ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{riroResult.message}</span>
          </div>
        )}
      </div>

      {/* Poster Information & School Context Reference */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 text-xs text-slate-600 space-y-2">
        <div className="flex items-center justify-between font-bold text-slate-800">
          <span>대회 규정 및 제출 체크리스트</span>
          <span className="text-indigo-600">중산고등학교 솔버톤</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
            <strong className="block text-slate-800 mb-0.5">대회 일시</strong>
            2026. 10. 31.(토) 09:00 - 17:00 (8시간 개발)
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
            <strong className="block text-slate-800 mb-0.5">신청 마감</strong>
            10월 27일(화) 리로서쿨 신청게시판
          </div>
          <div className="p-2.5 bg-white rounded-lg border border-slate-200">
            <strong className="block text-slate-800 mb-0.5">생기부 기재 활동</strong>
            중산고 ICT기획부 정식 주최 솔버톤
          </div>
        </div>
      </div>
    </div>
  );
};
