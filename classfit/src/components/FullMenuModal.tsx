import React from 'react';
import { StudentProfile } from '../types';
import {
  X,
  User,
  Flame,
  MapPin,
  Backpack,
  Bell,
  FileText,
  Calendar,
  SlidersHorizontal,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';

interface FullMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  urgentCount?: number;
  onOpenCampusMap?: (room?: string) => void;
  onOpenMorningRoutine?: () => void;
  onOpenLockScreen?: () => void;
  onOpenScheduleEditor?: () => void;
  onOpenMyPage?: () => void;
  onSelectTab?: (tab: 'home' | 'schedule' | 'matrix' | 'mypage') => void;
}

interface MenuItem {
  title: string;
  icon: LucideIcon;
  badge?: string;
  action?: () => void;
}

export const FullMenuModal: React.FC<FullMenuModalProps> = ({
  isOpen,
  onClose,
  student,
  urgentCount = 0,
  onOpenCampusMap,
  onOpenMorningRoutine,
  onOpenLockScreen,
  onOpenScheduleEditor,
  onOpenMyPage,
  onSelectTab,
}) => {
  if (!isOpen) return null;

  const run = (action?: () => void) => {
    if (action) action();
    onClose();
  };

  const goHome = () => onSelectTab && onSelectTab('home');
  const goMatrix = () => onSelectTab && onSelectTab('matrix');
  const goMyPage = () => {
    if (onOpenMyPage) onOpenMyPage();
    else if (onSelectTab) onSelectTab('mypage');
  };

  const quickActions: MenuItem[] = [
    { title: '내 수행평가', icon: FileText, action: goHome },
    { title: '등교 준비물', icon: Backpack, action: onOpenMorningRoutine },
    { title: '시간표', icon: Calendar, action: goMatrix },
  ];

  const groups: Array<{ label: string; items: MenuItem[] }> = [
    {
      label: '수행평가',
      items: [
        { title: '전체 수행평가', icon: FileText, action: goHome },
        {
          title: '마감 임박',
          icon: Flame,
          badge: urgentCount > 0 ? `${urgentCount}건` : undefined,
          action: goHome,
        },
        { title: '등교 준비물 점검', icon: Backpack, action: onOpenMorningRoutine },
      ],
    },
    {
      label: '시간표와 교실',
      items: [
        { title: '주간 시간표', icon: Calendar, action: goMatrix },
        { title: '내 수강 과목 설정', icon: SlidersHorizontal, action: onOpenScheduleEditor },
        { title: '캠퍼스 맵', icon: MapPin, action: () => onOpenCampusMap && onOpenCampusMap() },
      ],
    },
    {
      label: '내 정보',
      items: [
        { title: 'D-Day 알림 설정', icon: Bell, action: onOpenLockScreen },
        { title: '마이페이지', icon: User, action: goMyPage },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
      <button
        type="button"
        aria-label="메뉴 닫기"
        onClick={onClose}
        className="absolute inset-0 w-full h-full bg-slate-900/50 cursor-default"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="전체 메뉴"
        className="relative w-full max-w-sm h-full bg-slate-50 flex flex-col shadow-2xl"
      >
        <div className="bg-white px-5 pt-4 pb-5 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-500">전체 메뉴</h2>
            <button
              onClick={onClose}
              title="닫기"
              className="-mr-2 w-10 h-10 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => run(goMyPage)}
            className="w-full flex items-center gap-3 text-left cursor-pointer group"
          >
            <span className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0">
              {student.name.charAt(0)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold text-slate-900 truncate">{student.name}</span>
              <span className="block text-sm text-slate-500">
                {student.grade}학년 {student.classNum}반 {student.studentNum}번
              </span>
            </span>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </button>

          {urgentCount > 0 && (
            <button
              onClick={() => run(goHome)}
              className="mt-4 w-full flex items-center justify-between gap-2 px-3.5 py-3 rounded-xl bg-rose-50 text-rose-800 text-sm font-semibold hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Flame className="w-4 h-4" />
                이틀 안에 있는 수행평가 {urgentCount}건
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  onClick={() => run(item.action)}
                  className="min-h-20 p-2 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Icon className="w-5 h-5 text-indigo-600" />
                  <span className="text-xs font-semibold text-slate-800">{item.title}</span>
                </button>
              );
            })}
          </div>

          {groups.map((group) => (
            <section key={group.label}>
              <h3 className="px-1 mb-1.5 text-xs font-semibold text-slate-500">{group.label}</h3>
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.title}
                      onClick={() => run(item.action)}
                      className="w-full min-h-12 px-3.5 py-2.5 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <Icon className="w-5 h-5 text-slate-500 shrink-0" />
                      <span className="flex-1 text-sm font-medium text-slate-800">{item.title}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-xs font-bold">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </aside>
    </div>
  );
};
