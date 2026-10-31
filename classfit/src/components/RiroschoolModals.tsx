import React from 'react';
import { StudentProfile } from '../types';
import { JungsanLogo } from './JungsanLogo';
import { X, Calendar, Utensils, Award, CheckCircle2, QrCode, Clock, MapPin, Sparkles } from 'lucide-react';

interface CafeteriaModalProps {
  onClose: () => void;
}

export const CafeteriaModal: React.FC<CafeteriaModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-100 uppercase tracking-wider">
                중산고등학교 급식실
              </div>
              <h2 className="text-lg font-black text-white">오늘의 식단 (중식)</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 border-b pb-2">
            <span>2026. 10. 29. (목) 중식</span>
            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              열량: 864.2 Kcal
            </span>
          </div>

          <div className="space-y-2.5">
            {[
              { name: '친환경 발아현미밥', tag: '주식' },
              { name: '돈육 묵은지 김치찌개', tag: '국/찌개' },
              { name: '언양식 바싹 불고기 & 파채', tag: '주찬' },
              { name: '해물 부추전 & 초간장', tag: '부찬' },
              { name: '아삭 깍두기', tag: '김치' },
              { name: '달콤 샤인머스캣 포도', tag: '후식' },
            ].map((dish, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-amber-300 transition-colors"
              >
                <span className="text-sm font-bold text-slate-800">{dish.name}</span>
                <span className="text-[11px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {dish.tag}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
            <div className="font-bold">알레르기 유발 정보:</div>
            <p className="text-slate-600">
              돼지고기(10), 대두(5), 밀(6), 오징어(17), 새우(9), 조개류(18) 함유
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            확인 닫기
          </button>
        </div>
      </div>
    </div>
  );
};

interface AcademicCalendarModalProps {
  onClose: () => void;
}

export const AcademicCalendarModal: React.FC<AcademicCalendarModalProps> = ({ onClose }) => {
  const events = [
    { date: '10.28 (수)', title: '2026학년도 학교평가 설문조사 실시', type: '학사' },
    { date: '10.30 (금)', title: '3학년 물리Ⅱ 전자기 유도 탐구 실험평가 (E블록 3교시)', type: '수행평가', highlight: true },
    { date: '10.31 (토)', title: '2026 중산 솔버톤 해커톤 대회 (09:00~17:00)', type: '교내대회', highlight: true },
    { date: '11.02 (월)', title: '3학년 화학Ⅱ 화학 평형 이동 실험평가 (F블록 3교시)', type: '수행평가', highlight: true },
    { date: '11.05 (목)', title: '3학년 세계사 사료 분석 서술형 평가 (G블록 6교시)', type: '수행평가' },
    { date: '11.13 (금)', title: '2027학년도 대학수학능력시험 예비소집일 (단축수업)', type: '학사' },
    { date: '11.18 (수) ~ 11.23 (월)', title: '2학기 2차 지필평가 (기말고사)', type: '정기고사', highlight: true },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-blue-200 uppercase tracking-wider">
                중산고등학교 교무기획부
              </div>
              <h2 className="text-lg font-black text-white">2026학년도 2학기 주요 학사일정</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
          {events.map((ev, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                ev.highlight
                  ? 'bg-indigo-50/70 border-indigo-200 shadow-xs'
                  : 'bg-white border-slate-100 hover:bg-slate-50'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                    {ev.date}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      ev.type === '수행평가'
                        ? 'bg-amber-100 text-amber-900'
                        : ev.type === '교내대회'
                        ? 'bg-rose-100 text-rose-900'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {ev.type}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900">{ev.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

interface StudentIdCardModalProps {
  student: StudentProfile;
  onClose: () => void;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({ student, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-3xl border border-indigo-500/40 max-w-sm w-full p-6 text-white shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between relative z-10 border-b border-indigo-800/60 pb-3">
          <div className="flex items-center gap-2">
            <JungsanLogo size={32} className="bg-white rounded-full p-0.5" />
            <div>
              <div className="text-[10px] tracking-wider text-indigo-300 font-bold uppercase">
                Jungsan High School
              </div>
              <div className="text-xs font-black text-white">중산고등학교 모바일 학생증</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Photo and Info */}
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-24 h-28 rounded-2xl bg-indigo-800/60 border-2 border-indigo-400/40 flex flex-col items-center justify-center text-white font-bold text-3xl shadow-inner">
            {student.name.slice(0, 1)}
            <span className="text-[9px] font-normal text-indigo-300 mt-1">2026.03 발급</span>
          </div>
          <div className="space-y-1.5">
            <div className="text-[11px] text-indigo-300 font-semibold">재학생 신분확인</div>
            <h3 className="text-xl font-black text-white">{student.name}</h3>
            <div className="text-xs text-slate-300 space-y-0.5">
              <div>
                <strong>학년/반/번:</strong> {student.grade}학년 {student.classNum}반 {student.studentNum}번
              </div>
              <div>
                <strong>학번:</strong> 302{String(student.studentNum).padStart(2, '0')}
              </div>
              <div>
                <strong>선택과목 블록:</strong> {student.grade === 3 ? 'E·F·G·H' : 'A·B·C·D'}
              </div>
            </div>
          </div>
        </div>

        {/* Barcode Strip */}
        <div className="bg-white p-3 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-md relative z-10">
          <div className="w-full h-10 flex items-center justify-between px-2">
            {/* Fake barcode bars */}
            {[2, 1, 3, 1, 4, 2, 1, 3, 2, 4, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2].map((w, idx) => (
              <div
                key={idx}
                className="h-full bg-slate-900"
                style={{ width: `${w * 2}px` }}
              />
            ))}
          </div>
          <span className="font-mono text-[10px] tracking-widest text-slate-600 font-bold">
            JS-2026-{student.grade}02{String(student.studentNum).padStart(2, '0')}
          </span>
        </div>

        <div className="text-center text-[10px] text-indigo-300/80">
          본 학생증은 중산고등학교 수행알리미 및 교내 도서관에서 유효합니다.
        </div>
      </div>
    </div>
  );
};
