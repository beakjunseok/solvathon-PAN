import React from 'react';
import { MatchedAssessment } from '../types';
import { formatDDay } from '../utils/scheduleMatcher';
import { X, CheckCircle2, Circle, MapPin, Clock, Calendar, AlertCircle, FileText, User } from 'lucide-react';

interface AssessmentDetailModalProps {
  assessment: MatchedAssessment | null;
  onClose: () => void;
  checkedSupplies: string[];
  onToggleSupply: (supplyItem: string) => void;
  onToggleComplete: () => void;
}

export const AssessmentDetailModal: React.FC<AssessmentDetailModalProps> = ({
  assessment,
  onClose,
  checkedSupplies,
  onToggleSupply,
  onToggleComplete,
}) => {
  if (!assessment) return null;

  const dDayInfo = formatDDay(assessment.daysRemaining);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span className="text-indigo-600 font-bold">{assessment.block === 'COMMON' ? '공통' : `${assessment.block}블록`}</span>
              <span>·</span>
              <span className="text-slate-600">{assessment.subject}</span>
              <span>·</span>
              <span className="text-slate-500">{assessment.type}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              {assessment.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Key Personalized Timetable Banner */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-[#f4f7ff] rounded-2xl border border-indigo-100/70">
            <div>
              <div className="text-xs text-indigo-600 font-medium flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5" />
                일자 / D-day
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {assessment.date} ({assessment.dayOfWeekStr.slice(0, 1)})
              </div>
              <div className="text-xs text-indigo-600 font-bold mt-1">
                {dDayInfo.text} ({dDayInfo.label})
              </div>
            </div>

            <div>
              <div className="text-xs text-indigo-700/80 font-medium flex items-center gap-1 mb-0.5">
                <Clock className="w-3.5 h-3.5" />
                실시 교시
              </div>
              <div className="font-semibold text-slate-900 tabular-nums">
                {assessment.calculatedPeriod}교시
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                블록표 자동 연동
              </div>
            </div>

            <div>
              <div className="text-xs text-indigo-700/80 font-medium flex items-center gap-1 mb-0.5">
                <MapPin className="w-3.5 h-3.5" />
                이동 교실
              </div>
              <div className="font-semibold text-slate-900 truncate" title={assessment.studentRoom}>
                {assessment.studentRoom}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                내 시간표 기준
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" />
              평가 세부 내용
            </h3>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line">
              {assessment.description}
            </p>
          </div>

          {/* Supplies checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-slate-400" />
                지참 준비물 체크리스트
              </h3>
              <span className="text-xs text-slate-500 tabular-nums">
                {checkedSupplies.length} / {assessment.supplies.length} 준비 완료
              </span>
            </div>

            {assessment.supplies.length === 0 ? (
              <p className="text-xs text-slate-400 italic">지정된 특별 준비물이 없습니다.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {assessment.supplies.map((item) => {
                  const isChecked = checkedSupplies.includes(item);
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => onToggleSupply(item)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900'
                          : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isChecked && (
                          <svg className="w-2.5 h-2.5 fill-current stroke-current" viewBox="0 0 12 12">
                            <path d="M3.5 6.5l2 2 4-4" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${isChecked ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Evaluation Criteria */}
          {assessment.criteria && assessment.criteria.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                평가 루브릭 및 채점 기준
              </h3>
              <ul className="space-y-1.5">
                {assessment.criteria.map((crit, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-slate-700 bg-slate-50 px-3 py-2 rounded-md border border-slate-100 flex items-start gap-2"
                  >
                    <span className="font-bold text-slate-400 shrink-0 tabular-nums">{idx + 1}.</span>
                    <span>{crit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Teacher Info */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              출제 교사: <strong className="text-slate-700 font-medium">{assessment.teacherName}</strong>
            </span>
            <span className="tabular-nums">공지 등록: {assessment.createdAt.slice(0, 10)}</span>
          </div>
        </div>

        {/* Footer matching Screenshot_20261031-083724_Chrome */}
        <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onToggleComplete}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              assessment.isCompleted
                ? 'bg-slate-100 text-slate-800 border border-slate-200 hover:bg-slate-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
            }`}
          >
            <CheckCircle2 className={`w-4 h-4 ${assessment.isCompleted ? 'text-slate-600' : 'text-white'}`} />
            <span>{assessment.isCompleted ? '완료 취소' : '수행평가 완료 처리'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
