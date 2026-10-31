import React, { useState } from 'react';
import { Home, ArrowLeft, ArrowRight, RotateCw, User } from 'lucide-react';

interface RiroBottomBarProps {
  activeTab: 'home' | 'schedule' | 'matrix' | 'mypage';
  onSelectTab: (tab: 'home' | 'schedule' | 'matrix' | 'mypage') => void;
  onRefresh?: () => void;
  onGoBack?: () => void;
  onGoForward?: () => void;
}

export const RiroBottomBar: React.FC<RiroBottomBarProps> = ({
  activeTab,
  onSelectTab,
  onRefresh,
  onGoBack,
  onGoForward,
}) => {
  const [isRotating, setIsRotating] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleRefreshClick = () => {
    setIsRotating(true);
    setShowToast(true);
    if (onRefresh) onRefresh();

    setTimeout(() => {
      setIsRotating(false);
    }, 800);

    setTimeout(() => {
      setShowToast(false);
    }, 2200);
  };

  const handleBack = () => {
    if (onGoBack) {
      onGoBack();
    } else {
      if (activeTab === 'mypage' || activeTab === 'matrix') {
        onSelectTab('home');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleForward = () => {
    if (onGoForward) {
      onGoForward();
    } else {
      if (activeTab === 'home') {
        onSelectTab('mypage');
      } else if (activeTab === 'mypage') {
        onSelectTab('matrix');
      } else {
        onSelectTab('home');
      }
    }
  };

  return (
    <>
      {/* Toast Notification when refreshed */}
      {showToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl backdrop-blur-xs flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>동기화 완료되었습니다</span>
        </div>
      )}

      {/* Persistent Bottom App Navigation Bar (Replicating exact 5-button bar from screenshot) */}
      <nav
        aria-label="하단 리로서쿨 내비게이션 바"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] select-none"
      >
        <div className="max-w-md md:max-w-xl mx-auto h-16 grid grid-cols-5 items-center px-1 text-center">
          {/* 1. 스쿨 홈 */}
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors cursor-pointer group ${
              activeTab === 'home'
                ? 'text-[#0284c7] font-bold'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <Home
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                activeTab === 'home' ? 'stroke-[2.4] text-[#0284c7]' : 'stroke-[1.8]'
              }`}
            />
            <span
              className={`text-[10px] tracking-tight ${
                activeTab === 'home' ? 'font-black text-[#0284c7]' : 'font-medium'
              }`}
            >
              스쿨 홈
            </span>
          </button>

          {/* 2. 이전 */}
          <button
            type="button"
            onClick={handleBack}
            className="flex flex-col items-center justify-center gap-0.5 py-1.5 text-slate-700 hover:text-slate-950 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.8] group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[10px] font-medium tracking-tight">이전</span>
          </button>

          {/* 3. 다음 */}
          <button
            type="button"
            onClick={handleForward}
            className="flex flex-col items-center justify-center gap-0.5 py-1.5 text-slate-700 hover:text-slate-950 transition-colors cursor-pointer group"
          >
            <ArrowRight className="w-5 h-5 stroke-[1.8] group-hover:translate-x-0.5 transition-transform" />
            <span className="text-[10px] font-medium tracking-tight">다음</span>
          </button>

          {/* 4. 새로고침 */}
          <button
            type="button"
            onClick={handleRefreshClick}
            className="flex flex-col items-center justify-center gap-0.5 py-1.5 text-slate-700 hover:text-slate-950 transition-colors cursor-pointer group"
          >
            <RotateCw
              className={`w-5 h-5 stroke-[1.8] transition-transform ${
                isRotating ? 'animate-spin text-sky-600' : 'group-hover:rotate-45'
              }`}
            />
            <span className="text-[10px] font-medium tracking-tight">새로고침</span>
          </button>

          {/* 5. 마이페이지 */}
          <button
            type="button"
            onClick={() => onSelectTab('mypage')}
            className={`flex flex-col items-center justify-center gap-0.5 py-1.5 transition-colors cursor-pointer group ${
              activeTab === 'mypage'
                ? 'text-[#0284c7] font-bold'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            <User
              className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                activeTab === 'mypage' ? 'stroke-[2.4] text-[#0284c7]' : 'stroke-[1.8]'
              }`}
            />
            <span
              className={`text-[10px] tracking-tight ${
                activeTab === 'mypage' ? 'font-black text-[#0284c7]' : 'font-medium'
              }`}
            >
              마이페이지
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
