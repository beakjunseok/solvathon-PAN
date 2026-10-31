import React from 'react';
import { MatchedAssessment } from '../types';
import { Bell, Check, MapPin, Signal, Wifi } from 'lucide-react';

interface IphoneNotificationPreviewProps {
  assessment?: MatchedAssessment | null;
  badge: string;
  periodTime: string;
  dateText: string;
  timeText: string;
  checkedSupplies: string[];
  onOpenDetail?: (assessment: MatchedAssessment) => void;
  onOpenCampusMap?: (room: string) => void;
  onToggleSupply?: (assessmentId: string, item: string) => void;
}

const CARD_CLASS = 'apple-glass rounded-3xl p-3.5 border border-white/10 shadow-lg';

const AppIcon: React.FC = () => (
  <span className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
    <Bell className="w-5 h-5 text-white" />
  </span>
);

export const IphoneNotificationPreview: React.FC<IphoneNotificationPreviewProps> = ({
  assessment,
  badge,
  periodTime,
  dateText,
  timeText,
  checkedSupplies,
  onOpenDetail,
  onOpenCampusMap,
  onToggleSupply,
}) => {
  return (
    <div
      className="w-full max-w-[390px] min-h-[720px] bg-gradient-to-b from-slate-800 via-indigo-950 to-black rounded-[46px] border-4 border-slate-700 p-4 shadow-2xl relative select-none text-white animate-in zoom-in-95 duration-200"
      style={{ fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
    >
      {/* Status bar and Dynamic Island */}
      <div className="flex items-center justify-between px-3 pt-0.5 text-xs font-semibold">
        <span className="tabular-nums">{timeText}</span>
        <span className="w-24 h-7 rounded-full bg-black" aria-hidden="true" />
        <span className="flex items-center gap-1.5">
          <Signal className="w-3.5 h-3.5" />
          <Wifi className="w-3.5 h-3.5" />
          <span className="w-6 h-3 border border-white/80 rounded-[3px] p-[1.5px] flex">
            <span className="h-full w-[84%] bg-white rounded-[1px]" />
          </span>
        </span>
      </div>

      <div className="mt-6 mb-6 text-center">
        <p className="text-base font-medium">{dateText}</p>
        <p className="text-7xl font-semibold tracking-tight tabular-nums mt-1">{timeText}</p>
      </div>

      <div className="space-y-2.5">
        {assessment ? (
          <>
            <button
              type="button"
              onClick={() => onOpenDetail && onOpenDetail(assessment)}
              className={`${CARD_CLASS} w-full text-left flex items-start gap-3`}
            >
              <AppIcon />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold truncate">
                    {badge} {assessment.subject} 수행평가
                  </span>
                  <span className="text-[11px] text-slate-300 shrink-0">지금</span>
                </span>
                <span className="block text-sm text-slate-100 truncate">{assessment.title}</span>
                <span className="block text-xs text-slate-300 mt-0.5">
                  {assessment.calculatedPeriod}교시 {periodTime} · {assessment.studentRoom}
                </span>
              </span>
            </button>

            {assessment.supplies.length > 0 && (
              <div className={CARD_CLASS}>
                <div className="flex items-center gap-3 mb-2">
                  <AppIcon />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">지참 준비물</p>
                    <p className="text-xs text-slate-300">
                      {checkedSupplies.length}/{assessment.supplies.length} 챙김
                    </p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {assessment.supplies.map((item) => {
                    const isChecked = checkedSupplies.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        aria-pressed={isChecked}
                        onClick={() => onToggleSupply && onToggleSupply(assessment.id, item)}
                        className="w-full min-h-10 px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 flex items-center gap-2 text-left text-sm"
                      >
                        <span
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isChecked ? 'bg-emerald-500 border-emerald-500' : 'border-white/50'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 text-white" />}
                        </span>
                        <span className={isChecked ? 'line-through text-slate-300' : ''}>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {onOpenCampusMap && (
              <button
                type="button"
                onClick={() => onOpenCampusMap(assessment.studentRoom)}
                className={`${CARD_CLASS} w-full text-left flex items-center gap-3`}
              >
                <span className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">이동 교실</span>
                  <span className="block text-sm text-slate-200 truncate">{assessment.studentRoom}</span>
                </span>
              </button>
            )}
          </>
        ) : (
          <div className={`${CARD_CLASS} flex items-center gap-3`}>
            <AppIcon />
            <p className="text-sm">예정된 수행평가가 없습니다.</p>
          </div>
        )}
      </div>

      <div className="mt-8 mx-auto w-32 h-1 rounded-full bg-white/70" aria-hidden="true" />
    </div>
  );
};
