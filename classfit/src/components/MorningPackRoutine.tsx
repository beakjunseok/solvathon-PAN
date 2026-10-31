import React from 'react';
import { MatchedAssessment, StudentProfile } from '../types';
import { CheckCircle2, Circle, Sparkles, X, Backpack, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface MorningPackRoutineProps {
  student: StudentProfile;
  matchedAssessments: MatchedAssessment[];
  onToggleSupply: (assessmentId: string, item: string) => void;
  onClose: () => void;
}

export const MorningPackRoutine: React.FC<MorningPackRoutineProps> = ({
  student,
  matchedAssessments,
  onToggleSupply,
  onClose,
}) => {
  // Filter assessments for today and tomorrow (imminent)
  const imminent = matchedAssessments.filter(
    (a) => (a.isToday || a.daysRemaining === 1) && !a.isCompleted
  );

  // Flatten all required supplies with their metadata
  interface SupplyTask {
    assessmentId: string;
    subject: string;
    item: string;
    period: number;
    room: string;
    isToday: boolean;
    isChecked: boolean;
  }

  const tasks: SupplyTask[] = [];
  imminent.forEach((asmt) => {
    const checkedList = student.checkedSupplies[asmt.id] || [];
    asmt.supplies.forEach((item) => {
      tasks.push({
        assessmentId: asmt.id,
        subject: asmt.subject,
        item,
        period: asmt.calculatedPeriod,
        room: asmt.studentRoom,
        isToday: asmt.isToday,
        isChecked: checkedList.includes(item),
      });
    });
  });

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.isChecked).length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;
  const isAllReady = totalCount > 0 && completedCount === totalCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <Backpack className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  등교 전 30초 준비물 총점검
                </h2>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                  {student.name} 학생
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                오늘과 내일 치러지는 수행평가 필수 지참물을 가방에 넣고 체크하세요.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Progress Card */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4 shadow-sm">
            <div>
              <div className="text-xs text-slate-400 font-medium mb-1">
                오늘 준비물 챙김 달성률
              </div>
              <div className="text-2xl font-black text-white tabular-nums flex items-baseline gap-1">
                <span>{percentage}%</span>
                <span className="text-xs font-normal text-slate-400">
                  ({completedCount}/{totalCount} 완료)
                </span>
              </div>
              <div className="text-xs text-slate-300 mt-1 font-medium">
                {isAllReady
                  ? '🎉 완벽합니다! 오늘 수행평가 준비물 가방 패킹 완료!'
                  : '빠뜨린 준비물이 없는지 확인하고 체크하세요.'}
              </div>
            </div>

            <div className="w-14 h-14 rounded-full border-4 border-slate-700 flex items-center justify-center font-bold text-base relative shrink-0">
              {isAllReady ? (
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
              ) : (
                <span className="text-amber-400 tabular-nums">{percentage}%</span>
              )}
            </div>
          </div>

          {/* Task Checklist Items */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
              <span>필수 지참 준비물 목록</span>
              <span className="text-slate-400 font-normal">터치하여 챙김 확인</span>
            </h3>

            {tasks.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="font-bold text-slate-700 text-xs">
                  오늘과 내일 예정된 특별 준비물이 없습니다.
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  기본 필기도구만 챙겨 편안하게 등교하세요!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task, idx) => (
                  <button
                    key={`${task.assessmentId}-${task.item}-${idx}`}
                    onClick={() => onToggleSupply(task.assessmentId, task.item)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 ${
                      task.isChecked
                        ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 shadow-2xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {task.isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                      )}
                      <div>
                        <div
                          className={`font-bold text-sm ${
                            task.isChecked ? 'line-through text-emerald-800' : 'text-slate-900'
                          }`}
                        >
                          {task.item}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-indigo-700">
                            {task.subject}
                          </span>
                          <span>·</span>
                          <span className="font-medium text-slate-700 tabular-nums">
                            {task.isToday ? '오늘' : '내일'} {task.period}교시
                          </span>
                          <span>·</span>
                          <span className="text-slate-400 truncate max-w-[140px]">
                            {task.room}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        task.isChecked
                          ? 'bg-emerald-200/80 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {task.isChecked ? '챙김 완료' : '미체크'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            준비물 미지참으로 인한 감점 0% 달성 캠페인
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
};
