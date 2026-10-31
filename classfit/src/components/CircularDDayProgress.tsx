import React from 'react';

interface CircularDDayProgressProps {
  daysRemaining: number;
  hoursRemaining?: number;
  minutesRemaining?: number;
  isToday?: boolean;
  size?: number; // diameter in px (default 92)
  strokeWidth?: number; // stroke thickness (default 8)
  showSubText?: boolean;
  className?: string;
}

export const CircularDDayProgress: React.FC<CircularDDayProgressProps> = ({
  daysRemaining,
  hoursRemaining = 0,
  minutesRemaining = 0,
  isToday = false,
  size = 92,
  strokeWidth = 7,
  showSubText = true,
  className = '',
}) => {
  // Calculate remaining percentage based on a standard 7-day (168 hour) assessment window
  const TOTAL_WINDOW_HOURS = 7 * 24; // 168 hours standard notice period

  let remainingPercent: number;
  if (daysRemaining < 0) {
    remainingPercent = 0;
  } else if (daysRemaining === 0 || isToday) {
    // Today: calculate remaining proportion of school day (08:30 ~ 16:30 = 8h / 480 mins)
    const remMins = Math.max(5, (hoursRemaining * 60) + minutesRemaining);
    remainingPercent = Math.max(4, Math.min(30, Math.round((remMins / 480) * 100)));
  } else {
    const totalRemainingHours = (daysRemaining * 24) + Math.max(0, hoursRemaining);
    remainingPercent = Math.max(5, Math.min(100, Math.round((totalRemainingHours / TOTAL_WINDOW_HOURS) * 100)));
  }

  const elapsedPercent = 100 - remainingPercent;

  // SVG Geometry
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Stroke dash offset represents remaining proportion (starts full, drains clockwise)
  const strokeDashoffset = circumference - (remainingPercent / 100) * circumference;

  // Theme color based on urgency
  let strokeGradientId = 'grad-sky';
  let badgeColor = 'text-sky-400';
  let trackColor = 'text-slate-800';

  if (isToday || daysRemaining === 0) {
    strokeGradientId = 'grad-rose';
    badgeColor = 'text-rose-400';
  } else if (daysRemaining <= 2) {
    strokeGradientId = 'grad-amber';
    badgeColor = 'text-amber-400';
  }

  return (
    <div className={`relative flex flex-col items-center justify-center shrink-0 ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg] transition-all duration-700 ease-out"
        >
          {/* Gradients */}
          <defs>
            {/* Urgent / Today: Rose to Amber */}
            <linearGradient id="grad-rose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>

            {/* Impending D-1 / D-2: Amber to Orange */}
            <linearGradient id="grad-amber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>

            {/* Standard: Sky to Indigo */}
            <linearGradient id="grad-sky" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className={`${trackColor} opacity-25`}
          />

          {/* Animated Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${strokeGradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1 pointer-events-none select-none">
          <span className={`font-mono font-black text-sm sm:text-base leading-none tracking-tight tabular-nums ${badgeColor}`}>
            {remainingPercent}%
          </span>
          {showSubText && (
            <span className="text-[9px] font-semibold text-slate-400 leading-tight mt-0.5">
              남은시간
            </span>
          )}
        </div>
      </div>

      {/* Mini status indicator */}
      <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 font-medium font-mono">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        <span>{isToday ? 'D-Day' : `D-${daysRemaining}`}</span>
        <span>·</span>
        <span>{elapsedPercent}% 경과</span>
      </div>
    </div>
  );
};
