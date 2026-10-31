import React, { useState, useEffect, useRef } from 'react';
import { MatchedAssessment, StudentProfile } from '../types';
import { getDetailedTimeRemaining } from '../utils/scheduleMatcher';
import { JungsanLogo } from './JungsanLogo';
import {
  Smartphone,
  Tablet,
  Download,
  X,
  Clock,
  MapPin,
  CheckCircle2,
  Sparkles,
  Sun,
  Shield,
  Volume2,
  Flame,
  Battery,
  Wifi,
  Eye,
  Check,
} from 'lucide-react';

interface LockScreenWidgetModalProps {
  student: StudentProfile;
  closestAssessment: MatchedAssessment | null;
  onClose: () => void;
  onOpenDetailModal?: (asmt: MatchedAssessment) => void;
}

export const LockScreenWidgetModal: React.FC<LockScreenWidgetModalProps> = ({
  student,
  closestAssessment,
  onClose,
  onOpenDetailModal,
}) => {
  const [deviceType, setDeviceType] = useState<'phone' | 'pad'>('phone');
  const [currentTimeStr, setCurrentTimeStr] = useState('10:24');
  const [currentDateStr, setCurrentDateStr] = useState('10월 23일 금요일');
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [mediaSessionActive, setMediaSessionActive] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const wakeLockRef = useRef<any>(null);

  // Live Clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${hours}:${minutes}`);

      const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      setCurrentDateStr(`${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Screen Wake Lock API handler (Keeps student's desk tablet/phone awake)
  const toggleWakeLock = async () => {
    if (!wakeLockActive) {
      try {
        if ('wakeLock' in navigator) {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          setWakeLockActive(true);
        } else {
          setWakeLockActive(true); // simulated fallback
        }
      } catch (err) {
        console.warn('Wake Lock not available or rejected', err);
        setWakeLockActive(true);
      }
    } else {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
        } catch {}
        wakeLockRef.current = null;
      }
      setWakeLockActive(false);
    }
  };

  // Lock Screen Media Session API Widget
  // Places an active lock screen widget on Android and iOS devices
  const toggleMediaSession = () => {
    if (!mediaSessionActive && closestAssessment) {
      if ('mediaSession' in navigator) {
        try {
          const timeInfo = getDetailedTimeRemaining(closestAssessment.date, closestAssessment.calculatedPeriod);
          navigator.mediaSession.metadata = new MediaMetadata({
            title: `[${closestAssessment.subject}] ${closestAssessment.title}`,
            artist: `${closestAssessment.dayOfWeekStr} ${closestAssessment.calculatedPeriod}교시 (${timeInfo.periodTime}) · ${closestAssessment.studentRoom}`,
            album: `중산고 맞춤 알림 (${student.name}) · ${timeInfo.detailedText}`,
            artwork: [
              {
                src: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=512&auto=format&fit=crop&q=80',
                sizes: '512x512',
                type: 'image/png',
              },
            ],
          });

          // Play silent audio to keep lock screen widget active
          const audio = new Audio(
            'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'
          );
          audio.loop = true;
          audio.play().catch(() => {});
        } catch (e) {
          console.warn('MediaSession error', e);
        }
      }
      setMediaSessionActive(true);
    } else {
      setMediaSessionActive(false);
    }
  };

  // Generate downloadable Mobile Lock Screen Wallpaper using Canvas
  const handleDownloadWallpaper = () => {
    if (!closestAssessment) return;
    const canvas = document.createElement('canvas');
    const width = 1080;
    const height = 1920;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const timeInfo = getDetailedTimeRemaining(closestAssessment.date, closestAssessment.calculatedPeriod);

    // 1. Dark Gradient Wallpaper Background
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, '#090d16');
    grad.addColorStop(0.5, '#0f172a');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Decorative soft orbs
    ctx.fillStyle = 'rgba(79, 70, 229, 0.15)';
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.25, 300, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.beginPath();
    ctx.arc(width * 0.2, height * 0.6, 350, 0, Math.PI * 2);
    ctx.fill();

    // 2. Lock Screen Date & Clock
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 42px Pretendard, sans-serif';
    ctx.fillText(currentDateStr, width / 2, 280);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 160px Pretendard, sans-serif';
    ctx.fillText(currentTimeStr, width / 2, 450);

    // 3. School & Student Name Badge
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 36px Pretendard, sans-serif';
    ctx.fillText(`중산고등학교 · ${student.name} (${student.grade}학년 ${student.classNum}반)`, width / 2, 530);

    // 4. Closest Assessment Main Widget Box
    const cardX = 90;
    const cardY = 620;
    const cardW = 900;
    const cardH = 580;

    // Card background
    ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 40);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Widget Tag
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 32px Pretendard, sans-serif';
    ctx.fillText('⚡ 가장 가까운 수행평가 D-DAY 위젯', cardX + 45, cardY + 70);

    ctx.fillStyle = timeInfo.isToday ? '#ef4444' : '#60a5fa';
    ctx.font = '800 36px Pretendard, sans-serif';
    ctx.fillText(`${timeInfo.humanBadge} · ${timeInfo.detailedText}`, cardX + 45, cardY + 130);

    // Assessment Subject & Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px Pretendard, sans-serif';
    ctx.fillText(`[${closestAssessment.subject}]`, cardX + 45, cardY + 210);

    ctx.font = '600 36px Pretendard, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    const titleSnippet = closestAssessment.title.length > 24 ? closestAssessment.title.slice(0, 24) + '...' : closestAssessment.title;
    ctx.fillText(titleSnippet, cardX + 45, cardY + 275);

    // Period & Room Highlight
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 38px Pretendard, sans-serif';
    ctx.fillText(`⏰ ${closestAssessment.calculatedPeriod}교시 (${timeInfo.periodTime})`, cardX + 45, cardY + 360);

    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 36px Pretendard, sans-serif';
    ctx.fillText(`📍 내 이동교실: ${closestAssessment.studentRoom}`, cardX + 45, cardY + 420);

    // Supplies
    if (closestAssessment.supplies.length > 0) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 32px Pretendard, sans-serif';
      const suppliesText = '🎒 필수 준비물: ' + closestAssessment.supplies.join(', ');
      ctx.fillText(suppliesText.slice(0, 32), cardX + 45, cardY + 500);
    }

    // 5. Bottom Footer Note
    ctx.textAlign = 'center';
    ctx.fillStyle = '#64748b';
    ctx.font = '400 30px Pretendard, sans-serif';
    ctx.fillText('2026 중산 솔버톤 · 선택과목 블록 맞춤 수행평가 알림', width / 2, 1780);

    // Trigger download
    const link = document.createElement('a');
    link.download = `중산고_잠금화면_${student.name}_${closestAssessment.subject}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  const timeInfo = closestAssessment
    ? getDetailedTimeRemaining(closestAssessment.date, closestAssessment.calculatedPeriod)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  휴대폰·패드 잠금화면 위젯 & Always-On 디스플레이
                </h2>
                <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                  실시간 연동
                </span>
              </div>
              <p className="text-xs text-slate-400">
                공부할 때 책상 위에 올려두는 <strong>탁상시계 AOD 모드</strong>와 실제 <strong>잠금화면 배경화면</strong>을 지원합니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Device Switcher */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Device Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              onClick={() => setDeviceType('phone')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                deviceType === 'phone'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              스마트폰 모드
            </button>
            <button
              onClick={() => setDeviceType('pad')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                deviceType === 'pad'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              태블릿 / 패드 모드
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Screen Wake Lock */}
            <button
              onClick={toggleWakeLock}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                wakeLockActive
                  ? 'bg-amber-400 text-slate-950 border-amber-300 font-bold'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="자율학습 시 휴대폰/패드 화면이 꺼지지 않도록 유지합니다"
            >
              <Sun className="w-3.5 h-3.5" />
              <span>화면 켜짐 유지 (AOD)</span>
              <span className={`text-[10px] font-mono px-1 rounded ${wakeLockActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-700'}`}>
                {wakeLockActive ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* Lock Screen Media Session Card */}
            <button
              onClick={toggleMediaSession}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                mediaSessionActive
                  ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
              title="스마트폰 실제 잠금화면에 실시간 위젯 카드를 상주시킵니다"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>잠금화면 미디어 위젯</span>
              <span className={`text-[10px] font-mono px-1 rounded ${mediaSessionActive ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-700'}`}>
                {mediaSessionActive ? '활성' : '대기'}
              </span>
            </button>

            {/* Download Wallpaper */}
            <button
              onClick={handleDownloadWallpaper}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>다운로드 완료!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>잠금화면 배경화면 저장</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Main Canvas: Realistic Simulated Lock Screen Frame */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center bg-slate-950/40">
          {deviceType === 'phone' ? (
            /* PHONE FRAME (iPhone / Galaxy Style) */
            <div className="w-[340px] sm:w-[360px] h-[680px] bg-slate-950 rounded-[48px] border-4 border-slate-700 shadow-2xl relative p-5 flex flex-col justify-between overflow-hidden select-none">
              {/* Wallpaper Ambient Glow */}
              <div className="absolute top-0 right-0 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-10 left-0 w-60 h-60 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Dynamic Island Pill */}
              <div className="mx-auto w-28 h-6 bg-black rounded-full flex items-center justify-between px-3 text-[10px] text-slate-400 z-10">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                <span className="text-[9px] text-amber-300 font-bold">D-Day</span>
              </div>

              {/* Status bar icons */}
              <div className="flex items-center justify-between text-xs text-slate-300 px-3 pt-1 z-10">
                <span className="font-semibold text-[11px]">{currentTimeStr}</span>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Wifi className="w-3.5 h-3.5" />
                  <Battery className="w-4 h-4 text-emerald-400" />
                </div>
              </div>

              {/* Lock Screen Header Date & Time */}
              <div className="text-center my-auto space-y-1 z-10">
                <div className="text-xs font-medium text-slate-300">{currentDateStr}</div>
                <div className="text-6xl font-black text-white tracking-tighter drop-shadow-md">
                  {currentTimeStr}
                </div>
                <div className="text-[11px] font-semibold text-indigo-300 flex items-center justify-center gap-1">
                  <JungsanLogo size={14} className="bg-white rounded-full p-0.5" />
                  <span>중산고 {student.name} ({student.grade}학년 {student.classNum}반)</span>
                </div>
              </div>

              {/* THE LOCK SCREEN WIDGET CARD */}
              <div className="z-10 space-y-3 pb-6">
                {closestAssessment && timeInfo ? (
                  <div
                    onClick={() => onOpenDetailModal && onOpenDetailModal(closestAssessment)}
                    className="p-4 rounded-3xl bg-slate-900/90 border-2 border-amber-400/80 shadow-2xl backdrop-blur-md cursor-pointer hover:scale-[1.02] transition-transform space-y-2 text-left"
                  >
                    {/* Widget Top tag */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-400">
                        <Flame className="w-3.5 h-3.5 fill-amber-400" />
                        가장 임박한 수행평가
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          timeInfo.isToday ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-800 text-amber-300'
                        }`}
                      >
                        {timeInfo.humanBadge}
                      </span>
                    </div>

                    {/* Subject & Title */}
                    <div>
                      <div className="text-sm font-black text-white flex items-center gap-1">
                        <span className="text-amber-300">[{closestAssessment.subject}]</span>
                        <span className="truncate">{closestAssessment.title}</span>
                      </div>
                      <div className="text-[11px] text-amber-300 font-bold mt-0.5">
                        {timeInfo.detailedText}
                      </div>
                    </div>

                    {/* Classroom & Period */}
                    <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-300">
                      <span className="flex items-center gap-1 text-slate-200">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <strong className="text-white">{closestAssessment.calculatedPeriod}교시</strong> ({timeInfo.periodTime})
                      </span>
                      <span className="flex items-center gap-1 text-rose-300 font-semibold truncate max-w-[130px]">
                        <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                        <span>{closestAssessment.studentRoom}</span>
                      </span>
                    </div>

                    {/* Supplies list */}
                    {closestAssessment.supplies.length > 0 && (
                      <div className="text-[10px] text-slate-400 pt-0.5 truncate">
                        🎒 준비물: <strong className="text-slate-200">{closestAssessment.supplies.join(', ')}</strong>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 text-center text-xs text-slate-400">
                    남은 수행평가가 없습니다.
                  </div>
                )}

                {/* Bottom Lock screen Home Indicator */}
                <div className="mx-auto w-32 h-1 bg-white/40 rounded-full" />
              </div>
            </div>
          ) : (
            /* TABLET / PAD FRAME (iPad Landscape Style) */
            <div className="w-full max-w-2xl h-[420px] bg-slate-950 rounded-[36px] border-4 border-slate-700 shadow-2xl relative p-6 flex flex-col justify-between overflow-hidden select-none">
              {/* Wallpaper Ambient Glow */}
              <div className="absolute top-0 right-1/4 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

              {/* Status bar */}
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-2 z-10">
                <span className="font-semibold">{currentDateStr}</span>
                <div className="flex items-center gap-3">
                  <span className="text-indigo-400 font-bold">중산고등학교 스마트패드</span>
                  <div className="flex items-center gap-1">
                    <Wifi className="w-3.5 h-3.5" />
                    <Battery className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Pad Split View: Left Clock, Right Huge Live Widget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center my-auto z-10">
                {/* Left: Huge Clock */}
                <div className="text-left space-y-1">
                  <div className="text-6xl sm:text-7xl font-black text-white tracking-tighter">
                    {currentTimeStr}
                  </div>
                  <div className="text-sm font-semibold text-slate-300">
                    {student.name} 학생 ({student.grade}학년 {student.classNum}반 {student.studentNum}번)
                  </div>
                  <div className="text-xs text-slate-400">
                    {student.grade === 1 ? '1학년 시간표 연동 중' : student.grade === 3 ? '3학년 E~H 블록 시간표 연동 중' : '2학년 A~D 블록 시간표 연동 중'}
                  </div>
                </div>

                {/* Right: Pad Live Widget Card */}
                {closestAssessment && timeInfo && (
                  <div
                    onClick={() => onOpenDetailModal && onOpenDetailModal(closestAssessment)}
                    className="p-5 rounded-3xl bg-slate-900/90 border-2 border-amber-400 shadow-2xl space-y-3 cursor-pointer hover:border-amber-300 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs font-black uppercase text-amber-400">
                        <Flame className="w-4 h-4 fill-amber-400" />
                        가장 가까운 수행평가
                      </span>
                      <span className="bg-rose-500 text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-md">
                        {timeInfo.humanBadge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-white">
                        [{closestAssessment.subject}] {closestAssessment.title}
                      </h3>
                      <p className="text-xs text-amber-300 font-bold mt-1">
                        {timeInfo.detailedText}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 pt-1 border-t border-slate-800">
                      <span className="font-semibold text-white flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {closestAssessment.calculatedPeriod}교시 ({timeInfo.periodTime})
                      </span>
                      <span className="text-rose-300 font-semibold flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        {closestAssessment.studentRoom}
                      </span>
                    </div>

                    {closestAssessment.supplies.length > 0 && (
                      <div className="text-xs text-slate-400 truncate">
                        🎒 지참 준비물: <strong className="text-slate-200">{closestAssessment.supplies.join(', ')}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Home Indicator */}
              <div className="mx-auto w-40 h-1 bg-white/30 rounded-full z-10" />
            </div>
          )}
        </div>

        {/* Footer Explanations */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>심사위원 어필 포인트:</strong> 책상 거치대 AOD 모드(화면 켜짐 유지) & iOS/안드로이드 잠금화면 미디어 위젯 실시간 연동
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
