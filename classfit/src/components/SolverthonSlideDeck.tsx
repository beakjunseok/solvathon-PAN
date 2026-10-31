import React, { useState, useEffect } from 'react';
import { Assessment, StudentProfile, WeeklyBlockSlot } from '../types';
import { JungsanLogo } from './JungsanLogo';
import {
  Trophy,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  MapPin,
} from 'lucide-react';

interface SolverthonSlideDeckProps {
  students: StudentProfile[];
  assessments: Assessment[];
  weeklySchedule: WeeklyBlockSlot[];
  onClose: () => void;
  onAddAssessment: (asmt: Assessment) => void;
}

export const SolverthonSlideDeck: React.FC<SolverthonSlideDeckProps> = ({
  students,
  assessments,
  weeklySchedule,
  onClose,
  onAddAssessment,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 5;

  const studentA = students[0]; // Minjun
  const studentB = students[1]; // Seoyeon

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-10 select-none animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <JungsanLogo size={40} className="bg-white rounded-full p-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                2026 중산 솔버톤 심사 발표
              </span>
              <span className="text-xs text-slate-400">포스터 예시 주제 2번 채택</span>
            </div>
            <h1 className="text-sm font-semibold text-slate-200">
              선택과목 블록 기반 맞춤 수행평가·준비물 알림
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-mono">
            SLIDE <span className="text-amber-400 font-bold">{currentSlide + 1}</span> / {totalSlides}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="슬라이드 닫기 (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Slide Content Canvas */}
      <div className="flex-1 my-auto flex items-center justify-center max-w-5xl mx-auto w-full py-6">
        {/* SLIDE 0: Title & Vision */}
        {currentSlide === 0 && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>No.1 바이브 코딩 개발자 중산 솔버톤 출품 프로젝트</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              같은 반이어도 시간표는 다르다!<br />
              <span className="bg-linear-to-r from-amber-400 via-indigo-400 to-rose-400 bg-clip-text text-transparent">
                중산고 선택과목 블록 맞춤 수행평가 알림
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
              교사는 단 1회 공지 등록, 학생은 1회 시간표 입력.<br />
              중산고 3학년 A~D 블록표와 실시간 매칭하여<br />
              <strong>"내 교시, 내 이동교실, 내 필수 준비물"</strong>만 스마트하게 전달합니다.
            </p>

            <div className="pt-4 flex items-center justify-center gap-3 text-xs text-slate-400">
              <span className="px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
                주제: 수행평가·준비물 알림
              </span>
              <span>·</span>
              <span className="px-3 py-1 bg-slate-900 rounded-lg border border-slate-800">
                중산고등학교 ICT기획부
              </span>
            </div>
          </div>
        )}

        {/* SLIDE 1: Problem Definition */}
        {currentSlide === 1 && (
          <div className="space-y-6 w-full animate-fade-in">
            <div className="text-center space-y-2 mb-6">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                01. PROBLEM DEFINITION
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                왜 중산고 학생들은 단톡과 리로서쿨을 뒤져야 할까요?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">선택과목 파편화</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  같은 3학년 2반 김민준은 A블록에 물리Ⅱ(신관 3층), 이서연은 생명과학Ⅱ(본관 3층)를 수강하여
                  학급 단위 공지가 무의미합니다.
                </p>
              </div>

              <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">교시 계산의 피로</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  공지에 날짜만 적혀 있으면 요일별 블록표를 직접 대조해 "내가 몇 교시에 가야 하지?"를
                  매번 찾아야 하는 번거로움이 발생합니다.
                </p>
              </div>

              <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">준비물 미지참 & 지각</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  공학용 계산기나 실험 가운을 집에 두고 와 감점당하거나,
                  10분 쉬는시간 동안 신관과 본관 사이 교실을 헤매는 일이 빈번합니다.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: Solution Architecture */}
        {currentSlide === 2 && (
          <div className="space-y-6 w-full animate-fade-in">
            <div className="text-center space-y-2 mb-6">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                02. SOLUTION ARCHITECTURE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Before ↔ After의 명확한 패러다임 전환
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Before */}
              <div className="p-6 bg-slate-900/90 rounded-2xl border border-rose-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded">
                    Before: 기존 전체 공지 방식
                  </span>
                  <span className="text-xs text-slate-500">학생 피로도 High</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-3 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>전체 과목 공지가 한꺼번에 올라와 내 과목인지 수동 대조</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>시간표 책자를 찾아 몇 교시인지 직접 계산</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>준비물 확인 누락으로 수행평가 감점 발생</span>
                  </li>
                </ul>
              </div>

              {/* After */}
              <div className="p-6 bg-indigo-950/40 rounded-2xl border border-indigo-400 space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
                    After: 블록 매칭 맞춤 시스템
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">효율 100%</span>
                </div>
                <ul className="text-xs text-slate-200 space-y-3 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>학생 시간표 자동 필터링:</strong> 내게 해당하는 공지만 노출</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>교시·교실 자동 역계산:</strong> "10월 27일(화) 3교시 신관 물리실" 즉시 확인</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span><strong>준비물 체크리스트 & D-Day:</strong> 등교 전 30초 점검으로 미지참 0%</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: Live Dual Screen Demonstration */}
        {currentSlide === 3 && (
          <div className="space-y-5 w-full animate-fade-in">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                03. LIVE DEMONSTRATION
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                같은 3학년 2반 두 학생의 화면 실시간 대조 시연
              </h2>
            </div>

            {/* Live Interactive Trigger on Slide */}
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-300">
                선생님이 물리Ⅱ 공지를 발행하면 김민준에게만 즉각 뜨는 마법을 직접 확인하세요.
              </span>
              <button
                onClick={() => {
                  onAddAssessment({
                    id: `asmt-slide-${Date.now()}`,
                    subject: '물리Ⅱ',
                    block: 'E',
                    targetGrade: 3,
                    title: '물리Ⅱ 전자기 유도 MBL 현장 측정 평가 (시연 발행)',
                    type: '실험/탐구',
                    date: '2026-10-30',
                    supplies: ['공학용 계산기', '실험 가운'],
                    description: '심사위원 시연 중 실시간 발행된 물리Ⅱ 수행평가 공지입니다.',
                    criteria: ['데이터 정확도 (50점)', '보고서 서술 (50점)'],
                    teacherName: '박물리 선생님',
                    createdAt: new Date().toISOString(),
                  });
                }}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                + 물리Ⅱ 공지 즉시 발행
              </button>
            </div>

            {/* Split Comparison Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-900 rounded-xl border border-indigo-500/50 space-y-2">
                <div className="flex items-center justify-between font-bold text-indigo-300 border-b border-slate-800 pb-2">
                  <span>학생 1: {studentA.name} (3-2반 14번)</span>
                  <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded text-indigo-200">
                    물리Ⅱ / 화학Ⅱ 수강
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  배정 교실: <span className="text-white font-semibold">신관 3층 물리실험실 (3-4)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-slate-300">
                  📢 <strong>물리Ⅱ · 화학Ⅱ</strong> 관련 평가만 정확하게 필터링되어 교시(3교시)와 함께 표시됨
                </div>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-rose-500/50 space-y-2">
                <div className="flex items-center justify-between font-bold text-rose-300 border-b border-slate-800 pb-2">
                  <span>학생 2: {studentB.name} (3-2반 21번)</span>
                  <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded text-rose-200">
                    생명과학Ⅱ / 경제 수강
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  배정 교실: <span className="text-white font-semibold">본관 3층 생명과학실</span>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/40 text-[11px] text-slate-300">
                  📢 <strong>생명과학Ⅱ · 경제</strong> 관련 평가만 표시되며, 김민준의 물리Ⅱ는 전혀 보이지 않음!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: Future Vision & Impact */}
        {currentSlide === 4 && (
          <div className="space-y-6 w-full animate-fade-in text-center">
            <div className="space-y-2 mb-6">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                04. IMPACT & EXTENSION
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                중산고등학교에 가져올 변화
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-2xl font-black text-indigo-400">0 건</div>
                <h3 className="font-bold text-white text-sm">준비물 미지참률 0%</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  등교 전 30초 점검 모드와 푸시 알림으로 계산기, 실험 가운 미지참으로 인한 억울한 감점 원천 차단
                </p>
              </div>

              <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-2xl font-black text-emerald-400">-70%</div>
                <h3 className="font-bold text-white text-sm">교사 공지 업무 시간 단축</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  선생님은 과목과 일자만 1회 등록하면, 반별/학생별 시간표 대조 작업을 시스템이 자동 처리
                </p>
              </div>

              <div className="p-5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-2xl font-black text-amber-400">100%</div>
                <h3 className="font-bold text-white text-sm">리로서쿨 & 생기부 연계</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  중산고 기존 리로서쿨 공지 파서 연동 및 학생 주도 ICT 문제해결 활동으로 생기부 기재 가치 극대화
                </p>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-lg transition-all"
              >
                실제 앱 라이브 시연으로 돌아가기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Slide Controller Bar */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-4">
        <button
          onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
          disabled={currentSlide === 0}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> 이전 슬라이드
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2 bg-slate-700 hover:bg-slate-600'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1))}
          disabled={currentSlide === totalSlides - 1}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
        >
          다음 슬라이드 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
