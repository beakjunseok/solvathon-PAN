import React, { useState, useEffect } from 'react';
import { MatchedAssessment, StudentProfile } from '../types';
import { getDetailedTimeRemaining } from '../utils/scheduleMatcher';
import { IphoneNotificationPreview } from './IphoneNotificationPreview';
import {
  disableDailyPush,
  enableDailyPush,
  isDailyPushEnabled,
  isDailyPushSupported,
  refreshDailyPush,
} from '../utils/dailyPush';
import { Wind,
  X,
  Clock,
  MapPin,
  CheckCircle2,
  Bell,
  Wifi,
  VolumeX,
  Bluetooth,
  RotateCw,
  Plane,
  Flashlight,
  Settings,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Footprints,
  AlertCircle,
  Sun,
  Smartphone,
  Tablet,
  Check,
  Send,
  Battery,
  Flame,
  ArrowRight,
  Compass,
  Calendar,
  Layers,
  Sparkles,
  Maximize2,
  Sliders,
  Volume2,
} from 'lucide-react';

interface PhoneNotificationModalProps {
  student: StudentProfile;
  closestAssessment: MatchedAssessment | null;
  onClose: () => void;
  onOpenDetailModal?: (asmt: MatchedAssessment) => void;
  onOpenCampusMap?: (room?: string) => void;
  onToggleSupply?: (assessmentId: string, item: string) => void;
}

type DeviceMode = 'galaxy' | 'iphone' | 'ipados' | 'galaxytab';

export const PhoneNotificationModal: React.FC<PhoneNotificationModalProps> = ({
  student,
  closestAssessment,
  onClose,
  onOpenDetailModal,
  onOpenCampusMap,
  onToggleSupply,
}) => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('galaxy');
  const [currentTimeStr, setCurrentTimeStr] = useState('9:39');
  const [currentTime24, setCurrentTime24] = useState('09:39');
  const [currentDateStr, setCurrentDateStr] = useState('10월 31일 토요일');
  const [currentDateApple, setCurrentDateApple] = useState('10월 31일 토요일');
  const [webNotificationSent, setWebNotificationSent] = useState(false);
  const [isDailyPushOn, setIsDailyPushOn] = useState(isDailyPushEnabled);
  const [isDailyPushBusy, setIsDailyPushBusy] = useState(false);
  const [webNotificationError, setWebNotificationError] = useState<string | null>(null);
  const [showHeadsUpBanner, setShowHeadsUpBanner] = useState(false);
  const [expandedCard, setExpandedCard] = useState<boolean>(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);

  // Live Clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const displayHours12 = hours % 12 || 12;
      setCurrentTimeStr(`${displayHours12}:${minutes}`);
      setCurrentTime24(`${String(hours).padStart(2, '0')}:${minutes}`);

      const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      const dayKorean = days[now.getDay()];
      setCurrentDateStr(`${now.getMonth() + 1}월 ${now.getDate()}일 ${dayKorean}`);
      setCurrentDateApple(`${dayKorean}, ${now.getMonth() + 1}월 ${now.getDate()}일`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const timeInfo = closestAssessment
    ? getDetailedTimeRemaining(closestAssessment.date, closestAssessment.calculatedPeriod)
    : null;

  // Gentle notification sound using Web Audio API
  const playNotificationSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.15);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.45);
      osc2.stop(ctx.currentTime + 0.45);
    } catch {
      // AudioContext not permitted or supported
    }
  };

  // Real Web Browser Notification API Trigger
  const triggerRealWebNotification = async () => {
    setWebNotificationError(null);
    if (!('Notification' in window)) {
      setWebNotificationError('이 브라우저는 웹 알림(Notification API)을 지원하지 않습니다.');
      return;
    }

    try {
      let permission = Notification.permission;
      if (permission !== 'granted') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        playNotificationSound();
        const title = closestAssessment
          ? `[중산고 알림] ${closestAssessment.subject} 수행평가 · ${timeInfo?.humanBadge || 'D-Day'}`
          : '[중산고 알림] 등록된 수행평가 일정';

        const body = closestAssessment
          ? `${closestAssessment.calculatedPeriod}교시 (${timeInfo?.periodTime || ''}) | 이동교실: ${closestAssessment.studentRoom}\n` +
            `남은 시간: ${timeInfo?.detailedText || '임박'} | 준비물: ${closestAssessment.supplies.join(', ') || '없음'}`
          : '현재 예정된 급한 수행평가가 없습니다.';

        const options = {
          body,
          icon: '/assets/aistudio/images_0069c149.png',
          tag: 'jungsan-assessment-top-notification',
          vibrate: [200, 100, 200],
        };

        // 모바일 브라우저는 new Notification을 막으므로 서비스 워커를 먼저 사용한다.
        if ('serviceWorker' in navigator) {
          await navigator.serviceWorker.register('/sw.js');
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(title, options);
        } else {
          new Notification(title, options);
        }

        setWebNotificationSent(true);
        setTimeout(() => setWebNotificationSent(false), 4000);
      } else {
        setWebNotificationError('브라우저 알림 권한이 거부되었습니다. 브라우저 설정에서 알림을 허용해주세요.');
      }
    } catch (e: any) {
      setWebNotificationError('알림 발송 중 오류: ' + (e?.message || '알림 권한 필요'));
    }
  };

  const handleToggleDailyPush = async () => {
    setWebNotificationError(null);
    setIsDailyPushBusy(true);
    try {
      if (isDailyPushOn) {
        await disableDailyPush();
        setIsDailyPushOn(false);
      } else {
        await enableDailyPush(student);
        await refreshDailyPush(student, closestAssessment);
        setIsDailyPushOn(true);
      }
    } catch (e: any) {
      setWebNotificationError(e?.message || '알림을 설정하지 못했습니다.');
    } finally {
      setIsDailyPushBusy(false);
    }
  };

  // Simulated Heads-up dropdown banner trigger
  const triggerHeadsUpBanner = () => {
    playNotificationSound();
    setShowHeadsUpBanner(true);
    setTimeout(() => {
      setShowHeadsUpBanner(false);
    }, 5000);
  };

  const checkedSupplies = closestAssessment
    ? student.checkedSupplies[closestAssessment.id] || []
    : [];

  // Homebase and movement route calculations
  const homebaseFloor = student.grade === 3 ? '4층' : student.grade === 2 ? '3층' : '2층';
  const homebaseRoom = `${student.grade}학년 ${student.classNum}반 (${homebaseFloor})`;
  const destinationRoom = closestAssessment?.studentRoom || '5층 물리실';
  const currentBlockName = closestAssessment ? `${closestAssessment.block}블록 ${closestAssessment.subject}` : '선택과목 이동';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      {/* Interactive Heads-Up Banner Notification (Slides down from top screen) */}
      {showHeadsUpBanner && closestAssessment && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-60 w-[94%] max-w-lg bg-[#1c1c1e]/95 backdrop-blur-2xl text-white rounded-2xl p-4 shadow-2xl border border-white/15 animate-in slide-in-from-top-6 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-sm text-sm">
              중산
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-0.5">
                <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <span>중산고 수행평가 알리미</span>
                  <span className="text-slate-500 font-bold">·</span>
                  <span>방금 전</span>
                </span>
                <span className="text-[11px] bg-rose-500 text-white font-extrabold px-2 py-0.5 rounded font-mono tabular-nums">
                  {timeInfo?.humanBadge}
                </span>
              </div>
              <p className="text-sm font-bold text-white truncate">
                [{closestAssessment.subject}] {closestAssessment.title}
              </p>
              <div className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
                <span className="text-amber-300 font-bold font-mono tabular-nums">
                  {closestAssessment.calculatedPeriod}교시 ({timeInfo?.periodTime})
                </span>
                <span className="text-slate-500">·</span>
                <span className="flex items-center gap-1 text-slate-200">
                  <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                  {closestAssessment.studentRoom}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-amber-200 font-mono tabular-nums">
                  남은시간 {timeInfo?.detailedText}
                </span>
              </div>
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-end gap-2 text-xs">
                <button
                  onClick={() => {
                    setShowHeadsUpBanner(false);
                    onOpenDetailModal && onOpenDetailModal(closestAssessment);
                  }}
                  className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg text-xs hover:bg-amber-300 transition-colors"
                >
                  공지 자세히 보기
                </button>
              </div>
            </div>
            <button
              onClick={() => setShowHeadsUpBanner(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container Modal */}
      <div
        className={`relative w-full ${
          deviceMode === 'galaxy' || deviceMode === 'iphone'
            ? 'max-w-xl'
            : deviceMode === 'ipados'
            ? 'max-w-4xl'
            : 'max-w-4xl'
        } bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] transition-all duration-300`}
      >
        {/* Top Control Bar with Device Switcher */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/95 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold border border-amber-400/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">상단 알림창 시뮬레이터</h2>
                <span className="text-xs text-amber-300 font-medium">
                  {deviceMode === 'galaxy'
                    ? '갤럭시 폰 One UI'
                    : deviceMode === 'iphone'
                    ? 'iPhone 알림 센터'
                    : deviceMode === 'ipados'
                    ? 'iPadOS 알림 센터'
                    : '갤럭시 탭 와이드'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                화면 상단에서 스와이프했을 때 표시되는 실시간 수행평가 D-day 및 이동 동선
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Device Toggle Tabs */}
            <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setDeviceMode('galaxy')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  deviceMode === 'galaxy'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>갤럭시 폰</span>
              </button>
              <button
                onClick={() => setDeviceMode('iphone')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  deviceMode === 'iphone'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>아이폰</span>
              </button>
              <button
                onClick={() => setDeviceMode('ipados')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  deviceMode === 'ipados'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>iPadOS 알림센터</span>
              </button>
              <button
                onClick={() => setDeviceMode('galaxytab')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  deviceMode === 'galaxytab'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>갤럭시 탭 와이드</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Trigger Bar: Web Notification & Heads-Up Banner */}
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={triggerRealWebNotification}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="실제 휴대폰/PC 브라우저의 상단 알림바에 시스템 푸시 알림을 띄웁니다"
            >
              <Send className="w-3.5 h-3.5" />
              <span>실제 기기 상단 알림바 발송 (Web Push)</span>
            </button>

            <button
              onClick={handleToggleDailyPush}
              disabled={isDailyPushBusy || !isDailyPushSupported}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="매일 아침 D-Day가 바뀐 알림을 받습니다"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{isDailyPushOn ? '매일 D-Day 알림 끄기' : '매일 D-Day 알림 켜기'}</span>
            </button>

            <button
              onClick={triggerHeadsUpBanner}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              title="화면 상단에서 슥 내려오는 헤드업 팝업 알림 시뮬레이션"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>상단 팝업(헤드업) 울리기</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {webNotificationSent && (
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" /> 기기 상단 알림 전송됨!
              </span>
            )}
            {webNotificationError && (
              <span className="text-rose-400 text-xs">
                {webNotificationError}
              </span>
            )}
          </div>
        </div>

        {/* Daily Notification Guide */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 text-xs text-slate-300 space-y-2">
          <p className="font-bold text-white">
            {isDailyPushOn ? '매일 D-Day 알림이 켜져 있습니다.' : '매일 D-Day 알림 켜는 방법'}
          </p>
          {isDailyPushOn ? (
            <p>매일 오전 7시쯤 D-Day가 바뀐 알림이 옵니다. 알림을 지워도 다음 갱신 때 다시 나타납니다.</p>
          ) : (
            <>
              <ol className="list-decimal pl-4 space-y-1">
                <li>휴대폰이나 디벗의 Chrome으로 이 사이트를 엽니다.</li>
                <li>위의 초록색 <strong className="text-white">매일 D-Day 알림 켜기</strong>를 누릅니다.</li>
                <li>알림을 보내도 되는지 묻는 창에서 <strong className="text-white">허용</strong>을 누릅니다.</li>
                <li>상단에 D-Day 알림이 뜨면 완료입니다.</li>
              </ol>
              <p className="text-slate-400">
                허용 창이 안 나오면 주소창 왼쪽 아이콘 → 권한 → 알림을 허용으로 바꾼 뒤 새로고침하세요.
                아이폰은 Safari 공유 버튼 → 홈 화면에 추가 후, 추가된 앱에서 켜야 합니다.
              </p>
            </>
          )}
          {!isDailyPushSupported && (
            <p className="text-rose-400">이 브라우저는 알림을 지원하지 않습니다. Chrome에서 열어 주세요.</p>
          )}
        </div>

        {/* Scrollable Viewport: Device UI Render */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-950 flex justify-center items-start">
          {/* ========================================================================= */}
          {/* MODE 1: GALAXY PHONE (Android One UI 100% Screenshot Recreation)         */}
          {/* ========================================================================= */}
          {deviceMode === 'galaxy' && (
            <div
              className="w-full max-w-[390px] bg-black rounded-[38px] border-4 border-slate-800 p-4 sm:p-5 shadow-2xl relative select-none font-sans text-white animate-in zoom-in-95 duration-200"
              style={{
                fontFamily:
                  'Pretendard, -apple-system, BlinkMacSystemFont, "Samsung Sans", "Segoe UI", Roboto, sans-serif',
              }}
            >
              {/* 1. Android Status Bar (Top Line: 9:39 / Icons / Battery 92%) */}
              <div className="flex items-center justify-between text-xs text-white pt-1 pb-3 px-1">
                <span className="font-semibold text-sm tracking-tight font-mono tabular-nums">{currentTimeStr}</span>
                <div className="flex items-center gap-1.5 text-xs">
                  <VolumeX className="w-3.5 h-3.5 text-slate-300" />
                  <Bluetooth className="w-3.5 h-3.5 text-slate-300" />
                  <Wifi className="w-3.5 h-3.5 text-slate-300" />
                  <div className="flex items-center gap-1 font-mono font-medium text-[11px] tabular-nums">
                    <span>92%</span>
                    <div className="w-5 h-2.5 border border-white rounded-[2px] p-[1px] flex items-center">
                      <div className="h-full bg-white w-[92%] rounded-[1px]"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Date & Header (10월 31일 토요일 / Gear Settings) */}
              <div className="flex items-center justify-between px-1 mb-4">
                <h3 className="text-xl font-bold text-white tracking-tight">{currentDateStr}</h3>
                <div className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors">
                  <Settings className="w-5 h-5 text-slate-300" />
                </div>
              </div>

              {/* 3. Quick Settings Circle Toggles (Blue / Gray buttons matching screenshot) */}
              <div className="grid grid-cols-6 gap-2 mb-4 px-1">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-full bg-[#1b64da] text-white flex items-center justify-center shadow-md">
                    <Wifi className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-full bg-[#303033] text-slate-300 flex items-center justify-center">
                    <VolumeX className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-full bg-[#1b64da] text-white flex items-center justify-center shadow-md">
                    <Bluetooth className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-full bg-[#1b64da] text-white flex items-center justify-center shadow-md">
                    <RotateCw className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-full bg-[#303033] text-slate-300 flex items-center justify-center">
                    <Plane className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-11 h-11 rounded-full bg-[#303033] text-slate-300 flex items-center justify-center">
                    <Flashlight className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* 4. "기기 제어" & "미디어 출력" Pill Buttons */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <button className="py-2.5 px-4 rounded-2xl bg-[#28282b] text-slate-200 text-xs font-semibold text-center hover:bg-[#343438] transition-colors">
                  기기 제어
                </button>
                <button className="py-2.5 px-4 rounded-2xl bg-[#28282b] text-slate-200 text-xs font-semibold text-center hover:bg-[#343438] transition-colors">
                  미디어 출력
                </button>
              </div>

              {/* 5. NOTIFICATION STACK */}
              <div className="space-y-2.5">
                {/* === HERO NOTIFICATION CARD: 중산고 수행평가 알리미 === */}
                {closestAssessment ? (
                  <div className="rounded-2xl bg-[#222226] border border-amber-400/40 p-3.5 shadow-lg relative overflow-hidden transition-all">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-400"></div>

                    {/* Header */}
                    <div
                      onClick={() => setExpandedCard(!expandedCard)}
                      className="flex items-center justify-between cursor-pointer pl-1.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-md bg-amber-400 text-slate-950 flex items-center justify-center font-black text-[10px]">
                          중산
                        </div>
                        <span className="text-xs font-bold text-amber-300 truncate">
                          중산고 수행평가 알리미
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">· 방금 전</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded font-mono tabular-nums ${
                            timeInfo?.isToday
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          }`}
                        >
                          {timeInfo?.humanBadge || 'D-Day'}
                        </span>
                        {expandedCard ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mt-2 pl-1.5">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-xs font-extrabold text-amber-400">
                          [{closestAssessment.subject}]
                        </span>
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          {closestAssessment.title}
                        </h4>
                      </div>

                      {/* Remaining Time Box */}
                      <div className="mt-2 p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-amber-200 font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>남은 시간:</span>
                          <span className="font-mono tabular-nums text-white text-xs underline decoration-amber-400">
                            {timeInfo?.detailedText}
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-slate-300 font-mono tabular-nums">
                          {closestAssessment.calculatedPeriod}교시 ({timeInfo?.periodTime})
                        </span>
                      </div>

                      {/* Expanded Section with Movement Route & Supplies */}
                      {expandedCard && (
                        <div className="mt-2.5 space-y-2 text-xs text-slate-300">
                          {/* Movement Route Visualization */}
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1.5">
                              <span className="flex items-center gap-1 text-amber-300">
                                <Compass className="w-3 h-3 text-amber-400" />
                                <span>선택과목 이동 동선</span>
                              </span>
                              <span className="text-[10px] text-slate-400">도보 약 2분</span>
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-slate-200">
                              <span className="truncate max-w-[100px]">{homebaseRoom.split(' ')[0]}</span>
                              <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="text-slate-400 truncate">중앙계단</span>
                              <ArrowRight className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="font-bold text-emerald-300 truncate max-w-[110px]">
                                {closestAssessment.studentRoom}
                              </span>
                            </div>
                          </div>

                          {/* Classroom Location & Map */}
                          <div className="flex items-center justify-between text-xs bg-white/5 px-2.5 py-1.5 rounded-lg">
                            <span className="flex items-center gap-1 text-slate-300">
                              <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span>이동교실:</span>
                              <strong className="text-white">{closestAssessment.studentRoom}</strong>
                            </span>
                            {onOpenCampusMap && (
                              <button
                                onClick={() => onOpenCampusMap(closestAssessment.studentRoom)}
                                className="text-[11px] text-amber-300 hover:underline font-semibold"
                              >
                                지도보기 →
                              </button>
                            )}
                          </div>

                          {/* Supplies */}
                          {closestAssessment.supplies.length > 0 && (
                            <div className="p-2 rounded-lg bg-white/5 space-y-1.5">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-amber-300">지참 준비물</span>
                                <span className="text-slate-400 font-mono tabular-nums">
                                  ({checkedSupplies.length}/{closestAssessment.supplies.length} 완료)
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {closestAssessment.supplies.map((item) => {
                                  const isChecked = checkedSupplies.includes(item);
                                  return (
                                    <button
                                      key={item}
                                      onClick={() => onToggleSupply && onToggleSupply(closestAssessment.id, item)}
                                      className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors ${
                                        isChecked
                                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                          : 'bg-white/10 text-slate-300 hover:bg-white/20'
                                      }`}
                                    >
                                      <CheckCircle2
                                        className={`w-3 h-3 ${isChecked ? 'text-emerald-400' : 'text-slate-500'}`}
                                      />
                                      <span>{item}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="pt-1 flex items-center justify-end gap-2 text-xs">
                            <button
                              onClick={() => onOpenDetailModal && onOpenDetailModal(closestAssessment)}
                              className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                            >
                              <span>공지·루브릭 열기</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl bg-[#222226] p-4 text-center text-xs text-slate-400">
                    현재 등록된 긴급 수행평가 알림이 없습니다.
                  </div>
                )}


                {/* Health Steps */}
                <div className="rounded-2xl bg-[#222226] p-3 shadow-md flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white">
                      <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono tabular-nums">
                        <Footprints className="w-3.5 h-3.5" />
                        990걸음
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">오전 8:47</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">목표 걸음 수는 10000걸음입니다.</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                </div>

                {/* System Low Power Notice */}
                <div className="rounded-2xl bg-[#222226] p-3 shadow-md flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                      <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>알림</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">저전력 (절전) 모드를 해제하십시오.</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                </div>

                {/* Weather Card */}
                <div className="rounded-2xl bg-[#222226] p-3 shadow-md flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 mb-0.5">
                      11° 날씨날씨 강남구 일원동 · 오전 9:03
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-6 h-6 text-slate-300" />
                      <div>
                        <span className="text-base font-bold text-white font-mono tabular-nums">11°</span>
                        <span className="text-[11px] text-slate-400 ml-1.5 font-mono tabular-nums">16° / 7°</span>
                        <div className="text-[10px] text-slate-400">어제보다 2°높아요</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#ee9a2e] text-white px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm shrink-0">
                    <span>☹️ 미세미세 나쁨</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-2 flex items-center justify-between text-xs text-slate-400 px-2">
                <button className="hover:text-white font-medium">알림 설정</button>
                <button className="hover:text-white font-medium">지우기</button>
              </div>

              <div className="mt-6 text-center text-[10px] text-slate-600 font-mono tracking-widest">
                LG U+
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: iPadOS NOTIFICATION CENTER (Apple iPad 2-Column Wide View)        */}
          {/* ========================================================================= */}
          {deviceMode === 'iphone' && (
            <IphoneNotificationPreview
              assessment={closestAssessment}
              badge={timeInfo?.humanBadge || 'D-Day'}
              periodTime={timeInfo?.periodTime || ''}
              dateText={currentDateApple}
              timeText={currentTime24}
              checkedSupplies={checkedSupplies}
              onOpenDetail={onOpenDetailModal}
              onOpenCampusMap={onOpenCampusMap}
              onToggleSupply={onToggleSupply}
            />
          )}

          {deviceMode === 'ipados' && (
            <div
              className="w-full max-w-[820px] bg-black/95 rounded-[36px] border-4 border-slate-700/80 p-5 sm:p-7 shadow-2xl relative select-none font-sans text-white animate-in zoom-in-95 duration-200"
              style={{
                fontFamily:
                  'Pretendard, -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif',
              }}
            >
              {/* iPad Status Bar */}
              <div className="flex items-center justify-between text-xs text-slate-300 pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm font-mono tabular-nums">{currentTime24}</span>
                  <span className="text-[11px] text-slate-400">{currentDateApple}</span>
                </div>
                {/* Center Camera Notch Simulator */}
                <div className="w-16 h-3 bg-slate-900 rounded-full border border-white/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-slate-800 border border-slate-700"></div>
                </div>
                <div className="flex items-center gap-3">
                  <Wifi className="w-4 h-4 text-slate-300" />
                  <span className="font-mono text-xs tabular-nums text-slate-200">iPad 84%</span>
                  <div className="w-6 h-3 border border-white/80 rounded-[3px] p-[1.5px] flex items-center">
                    <div className="h-full bg-white w-[84%] rounded-[1px]"></div>
                  </div>
                </div>
              </div>

              {/* iPad Large Clock & Title */}
              <div className="my-5 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-semibold text-amber-300 tracking-wider">
                  {currentDateApple}
                </span>
                <h1 className="text-5xl sm:text-6xl font-light tracking-tight font-mono tabular-nums text-white mt-1">
                  {currentTime24}
                </h1>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>중산고등학교 고교학점제 스마트 캠퍼스 알림 센터</span>
                </p>
              </div>

              {/* iPad 2-Column Split Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mt-4">
                {/* Left Column (5 Cols): Widgets & Movement Route */}
                <div className="md:col-span-5 space-y-3.5">
                  {/* Widget 1: Next Period Block Movement Route (선택과목 이동 동선) */}
                  <div className="apple-glass rounded-2xl p-4 border border-white/10 shadow-lg">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-2.5">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-amber-400" />
                        <span>다음 이동수업 동선</span>
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono tabular-nums font-semibold">
                        도보 2분
                      </span>
                    </div>

                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <div className="text-xs font-semibold text-white mb-2">
                        {currentBlockName}
                      </div>

                      {/* 3-Step Pathway */}
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                            1
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-400">출발지 (홈베이스)</span>
                            <p className="text-xs font-medium text-white truncate">{homebaseRoom}</p>
                          </div>
                        </div>

                        <div className="ml-2.5 border-l-2 border-dashed border-amber-400/40 h-3"></div>

                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center text-[10px] font-bold shrink-0">
                            2
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-slate-400">이동 경로</span>
                            <p className="text-xs font-medium text-slate-200">본관 2층 중앙연결통로 ➔ 과학관</p>
                          </div>
                        </div>

                        <div className="ml-2.5 border-l-2 border-dashed border-emerald-400/40 h-3"></div>

                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-bold shrink-0">
                            3
                          </div>
                          <div className="min-w-0">
                            <span className="text-[10px] text-emerald-400 font-semibold">도착 교실</span>
                            <p className="text-xs font-bold text-white truncate">{destinationRoom}</p>
                          </div>
                        </div>
                      </div>

                      {onOpenCampusMap && (
                        <button
                          onClick={() => onOpenCampusMap(destinationRoom)}
                          className="w-full mt-3 py-1.5 bg-white/10 hover:bg-white/15 text-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <MapPin className="w-3.5 h-3.5 text-rose-400" />
                          <span>교내 캠퍼스 맵 전체보기</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Widget 2: Apple Battery Status Ring */}
                  <div className="apple-glass rounded-2xl p-4 border border-white/10 shadow-lg">
                    <div className="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Battery className="w-4 h-4 text-emerald-400" />
                        <span>기기 배터리 현황</span>
                      </span>
                      <span className="text-[10px] text-slate-400">iPad & 악세서리</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full border-2 border-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] text-white">
                          84
                        </div>
                        <span className="text-[10px] text-slate-300 mt-1">iPad Air</span>
                      </div>
                      <div className="p-2 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full border-2 border-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] text-white">
                          100
                        </div>
                        <span className="text-[10px] text-slate-300 mt-1">Pencil</span>
                      </div>
                      <div className="p-2 bg-white/5 rounded-xl border border-white/5 flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full border-2 border-amber-400 flex items-center justify-center font-mono font-bold text-[10px] text-white">
                          72
                        </div>
                        <span className="text-[10px] text-slate-300 mt-1">AirPods</span>
                      </div>
                    </div>
                  </div>

                  {/* Widget 3: Weather Card */}
                  <div className="apple-glass rounded-2xl p-3.5 border border-white/10 shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Sun className="w-7 h-7 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-xs text-slate-400">서울 강남구 일원동</div>
                        <div className="text-sm font-bold text-white font-mono tabular-nums">
                          11° <span className="text-xs font-normal text-slate-400">안개</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-lg border border-emerald-500/30">
                      미세먼지 좋음
                    </span>
                  </div>
                </div>

                {/* Right Column (7 Cols): Apple-Style Notifications Stack */}
                <div className="md:col-span-7 space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                    <span className="font-semibold text-slate-300">알림 센터</span>
                    <button className="text-slate-400 hover:text-white">모두 지우기</button>
                  </div>

                  {/* Hero Notification: Jungsan Assessment D-Day Glass Card */}
                  {closestAssessment ? (
                    <div className="apple-glass rounded-2xl p-4 border border-amber-400/40 shadow-xl transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs shadow-sm">
                            중산
                          </div>
                          <div>
                            <span className="text-xs font-bold text-amber-300">중산고 수행평가 알리미</span>
                            <span className="text-[11px] text-slate-400 ml-1.5 font-medium">· 방금 전</span>
                          </div>
                        </div>

                        <span
                          className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg font-mono tabular-nums ${
                            timeInfo?.isToday
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-amber-400 text-slate-950 font-bold'
                          }`}
                        >
                          {timeInfo?.humanBadge || 'D-Day'}
                        </span>
                      </div>

                      {/* Main Assessment Info */}
                      <div className="mt-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-amber-400 font-mono">
                            [{closestAssessment.block}블록]
                          </span>
                          <h3 className="text-base font-bold text-white tracking-tight">
                            [{closestAssessment.subject}] {closestAssessment.title}
                          </h3>
                        </div>

                        <div className="mt-2.5 p-2.5 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                            <span className="text-slate-300 font-medium">실시간 카운트다운:</span>
                            <span className="text-amber-300 font-bold font-mono tabular-nums text-sm underline decoration-amber-400">
                              {timeInfo?.detailedText}
                            </span>
                          </div>
                          <span className="text-xs text-slate-300 font-mono tabular-nums">
                            {closestAssessment.calculatedPeriod}교시 ({timeInfo?.periodTime})
                          </span>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-slate-300 bg-white/5 px-3 py-2 rounded-xl">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-400" />
                            <span>이동 평가 교실:</span>
                            <strong className="text-white">{closestAssessment.studentRoom}</strong>
                          </span>
                          <span className="text-[11px] text-slate-400">
                            담당: {closestAssessment.teacherName} 선생님
                          </span>
                        </div>

                        {/* Supplies Checklist */}
                        {closestAssessment.supplies.length > 0 && (
                          <div className="mt-3 p-3 rounded-xl bg-white/5 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-amber-300">지참 준비물 체크</span>
                              <span className="text-slate-400 font-mono tabular-nums text-[11px]">
                                {checkedSupplies.length} / {closestAssessment.supplies.length} 완료
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {closestAssessment.supplies.map((item) => {
                                const isChecked = checkedSupplies.includes(item);
                                return (
                                  <button
                                    key={item}
                                    onClick={() => onToggleSupply && onToggleSupply(closestAssessment.id, item)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                                      isChecked
                                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                                    }`}
                                  >
                                    <CheckCircle2
                                      className={`w-3.5 h-3.5 ${isChecked ? 'text-emerald-400' : 'text-slate-500'}`}
                                    />
                                    <span>{item}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="mt-3.5 flex items-center justify-end gap-2 text-xs">
                          {onOpenCampusMap && (
                            <button
                              onClick={() => onOpenCampusMap(closestAssessment.studentRoom)}
                              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-slate-200 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1"
                            >
                              <MapPin className="w-3.5 h-3.5 text-rose-400" />
                              <span>위치 안내</span>
                            </button>
                          )}
                          <button
                            onClick={() => onOpenDetailModal && onOpenDetailModal(closestAssessment)}
                            className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-1"
                          >
                            <span>공지·루브릭 열기</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="apple-glass rounded-2xl p-5 text-center text-xs text-slate-400">
                      예정된 급한 수행평가 알림이 없습니다.
                    </div>
                  )}


                  {/* Secondary Card: School Academic Notice */}
                  <div className="apple-glass rounded-2xl p-3.5 border border-white/10 shadow-md flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">
                          중산고 2학기 2차 지필평가 및 수행평가 반영 일정
                        </div>
                        <div className="text-[11px] text-slate-400">교무기획부 안내 · 학생 시간표 연동 완료</div>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                </div>
              </div>

              {/* Bottom Home Indicator */}
              <div className="mt-6 flex justify-center">
                <div className="w-36 h-1.5 bg-white/30 rounded-full"></div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 3: GALAXY TAB WIDE (Samsung One UI Tablet 2-Column Shade)            */}
          {/* ========================================================================= */}
          {deviceMode === 'galaxytab' && (
            <div
              className="w-full max-w-[840px] bg-[#121214] rounded-[36px] border-4 border-slate-800 p-5 sm:p-7 shadow-2xl relative select-none font-sans text-white animate-in zoom-in-95 duration-200"
              style={{
                fontFamily:
                  'Pretendard, -apple-system, BlinkMacSystemFont, "Samsung Sans", "Segoe UI", Roboto, sans-serif',
              }}
            >
              {/* Galaxy Tab Top Status Bar */}
              <div className="flex items-center justify-between text-xs text-slate-300 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm font-mono tabular-nums">{currentTime24}</span>
                  <span className="text-[11px] text-slate-400">{currentDateStr}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono tabular-nums">
                  <Wifi className="w-3.5 h-3.5 text-slate-300" />
                  <VolumeX className="w-3.5 h-3.5 text-slate-300" />
                  <Bluetooth className="w-3.5 h-3.5 text-slate-300" />
                  <span>88%</span>
                  <div className="w-5 h-2.5 border border-white rounded-[2px] p-[1px] flex items-center">
                    <div className="h-full bg-white w-[88%] rounded-[1px]"></div>
                  </div>
                </div>
              </div>

              {/* Tablet Full-width Quick Settings Panel */}
              <div className="my-4 p-3 bg-[#1e1e22] rounded-2xl border border-white/5">
                <div className="grid grid-cols-8 gap-2 text-center text-xs">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-[#1b64da] text-white flex items-center justify-center">
                      <Wifi className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-300">와이파이</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-[#303033] text-slate-300 flex items-center justify-center">
                      <VolumeX className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-300">소리</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-[#1b64da] text-white flex items-center justify-center">
                      <Bluetooth className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-300">블루투스</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-[#1b64da] text-white flex items-center justify-center">
                      <RotateCw className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-300">자동회전</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-[#303033] text-slate-300 flex items-center justify-center">
                      <Plane className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-300">비행기탑승</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-[#303033] text-slate-300 flex items-center justify-center">
                      <Flashlight className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-300">손전등</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-[#1b64da] text-white flex items-center justify-center">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-300">DeX 모드</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-[#303033] text-slate-300 flex items-center justify-center">
                      <Settings className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] text-slate-300">설정</span>
                  </div>
                </div>

                {/* Brightness slider bar */}
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-3 px-2">
                  <Sun className="w-4 h-4 text-slate-400" />
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-[#1b64da] rounded-full"></div>
                  </div>
                  <Sun className="w-5 h-5 text-amber-400" />
                </div>
              </div>

              {/* 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Movement Route + Media + Steps */}
                <div className="space-y-3">
                  {/* Movement Route Card */}
                  <div className="bg-[#1e1e22] rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                      <span className="font-bold text-amber-300 flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-amber-400" />
                        <span>선택과목 이동 경로 안내</span>
                      </span>
                      <span className="text-[11px] text-emerald-400 font-mono tabular-nums">
                        도보 2분
                      </span>
                    </div>

                    <div className="p-3 bg-black/40 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">출발:</span>
                        <span className="font-semibold text-white">{homebaseRoom}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">경로:</span>
                        <span className="text-slate-200">본관 2층 중앙연결통로 ➔ 과학관</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="text-amber-300 font-bold">도착:</span>
                        <span className="font-bold text-emerald-300">{destinationRoom}</span>
                      </div>
                    </div>

                    {onOpenCampusMap && (
                      <button
                        onClick={() => onOpenCampusMap(destinationRoom)}
                        className="w-full mt-2.5 py-1.5 bg-[#28282b] hover:bg-[#343438] text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5 text-rose-400" />
                        <span>캠퍼스 맵에서 위치 확인하기</span>
                      </button>
                    )}
                  </div>


                  {/* Health Steps & Weather */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-[#1e1e22] rounded-2xl p-3 border border-white/5">
                      <div className="flex items-center gap-1 text-emerald-400 font-bold text-xs font-mono tabular-nums">
                        <Footprints className="w-3.5 h-3.5" />
                        990걸음
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">목표: 10,000걸음</p>
                    </div>
                    <div className="bg-[#1e1e22] rounded-2xl p-3 border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white font-mono tabular-nums">11°</div>
                        <div className="text-[10px] text-slate-400">일원동 안개</div>
                      </div>
                      <Wind className="w-6 h-6 text-slate-300" />
                    </div>
                  </div>
                </div>

                {/* Right Column: Hero Assessment & Supplies */}
                <div className="space-y-3">
                  {closestAssessment ? (
                    <div className="bg-[#1e1e22] rounded-2xl border border-amber-400/40 p-4 shadow-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xs">
                            중산
                          </div>
                          <span className="text-xs font-bold text-amber-300">중산고 수행평가 알리미</span>
                        </div>
                        <span
                          className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg font-mono tabular-nums ${
                            timeInfo?.isToday
                              ? 'bg-rose-500 text-white animate-pulse'
                              : 'bg-amber-400 text-slate-950 font-bold'
                          }`}
                        >
                          {timeInfo?.humanBadge || 'D-Day'}
                        </span>
                      </div>

                      <div className="mt-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-amber-400 font-mono">
                            [{closestAssessment.block}블록]
                          </span>
                          <h4 className="text-sm font-bold text-white">
                            [{closestAssessment.subject}] {closestAssessment.title}
                          </h4>
                        </div>

                        <div className="mt-2.5 p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-amber-200 font-bold">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>남은시간:</span>
                            <span className="font-mono tabular-nums text-white text-xs underline decoration-amber-400">
                              {timeInfo?.detailedText}
                            </span>
                          </div>
                          <span className="text-xs font-mono tabular-nums text-slate-300">
                            {closestAssessment.calculatedPeriod}교시 ({timeInfo?.periodTime})
                          </span>
                        </div>

                        {/* Supplies */}
                        {closestAssessment.supplies.length > 0 && (
                          <div className="mt-3 p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-amber-300">지참 준비물</span>
                              <span className="text-slate-400 font-mono tabular-nums text-[11px]">
                                {checkedSupplies.length} / {closestAssessment.supplies.length} 완료
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {closestAssessment.supplies.map((item) => {
                                const isChecked = checkedSupplies.includes(item);
                                return (
                                  <button
                                    key={item}
                                    onClick={() => onToggleSupply && onToggleSupply(closestAssessment.id, item)}
                                    className={`px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 transition-colors ${
                                      isChecked
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                                    }`}
                                  >
                                    <CheckCircle2
                                      className={`w-3 h-3 ${isChecked ? 'text-emerald-400' : 'text-slate-500'}`}
                                    />
                                    <span>{item}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="mt-3.5 flex items-center justify-end gap-2 text-xs">
                          <button
                            onClick={() => onOpenDetailModal && onOpenDetailModal(closestAssessment)}
                            className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                          >
                            공지 및 평가 루브릭 전체보기
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#1e1e22] rounded-2xl p-5 text-center text-xs text-slate-400">
                      등록된 긴급 수행평가 일정이 없습니다.
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 px-2 pt-2">
                    <button className="hover:text-white font-medium">알림 설정</button>
                    <button className="hover:text-white font-medium">모두 지우기</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info explaining usage for the Solverthon pitch */}
        <div className="p-3.5 sm:p-4 bg-slate-900 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="text-slate-200 font-semibold">2026 중산 솔버톤 심사 포인트:</span>
            <span>선택과목 이동수업(2학년 A~D, 3학년 E~H) 교실 착오와 준비물 미지참을 상단 알림창으로 100% 예방</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs transition-colors self-end sm:self-auto"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
