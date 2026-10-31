import React from 'react';
import { ShieldAlert, Lock, ArrowRight, X, GraduationCap, BookOpen } from 'lucide-react';
import { JungsanLogo } from './JungsanLogo';

interface TeacherAccessDeniedModalProps {
  studentName: string;
  onClose: () => void;
  onOpenTeacherLogin: () => void;
}

export const TeacherAccessDeniedModal: React.FC<TeacherAccessDeniedModalProps> = ({
  studentName,
  onClose,
  onOpenTeacherLogin,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden relative">
        {/* Top Accent Header */}
        <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 px-6 py-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="닫기"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
              <ShieldAlert className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                <span>접근 제한 · 교원 전용 권한 보호</span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white">
                선생님 모드 전환 불가
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-slate-700 text-xs sm:text-sm">
          {/* Current Auth Status Pill */}
          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-indigo-950 text-xs">
                  현재 로그인: <span className="text-indigo-600">{studentName} 학생</span>
                </div>
                <div className="text-[11px] text-indigo-600">학생 권한 (학습자 모드)</div>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-indigo-200 text-indigo-900 px-2 py-0.5 rounded-full">
              학생 세션
            </span>
          </div>

          <div className="space-y-2 text-slate-600 leading-relaxed text-xs sm:text-sm">
            <p className="font-medium text-slate-900">
              학생 계정으로 로그인 중일 때는 보안을 위해 선생님 모드로 직접 전환할 수 없습니다.
            </p>
            <p className="text-slate-500 text-xs">
              선생님 모드는 <strong>수행평가 일정 등록, 평가 루브릭 설정, 준비물 안내 공지서 발행</strong> 등
              교원 전용 권한을 다루므로 교직원 인증이 완료된 교사 계정에서만 접속할 수 있습니다.
            </p>
          </div>

          {/* Guide Box */}
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-tight">
              선생님 모드를 이용하시려면 <strong>교원 계정으로 전환</strong>하여 로그인해 주세요.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
          >
            학생 모드 계속 이용하기
          </button>
          <button
            onClick={onOpenTeacherLogin}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>교사 계정으로 로그인</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
