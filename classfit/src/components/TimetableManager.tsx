import React, { useMemo, useState } from 'react';
import { BlockId, DayOfWeek, getBlocksForGrade } from '../types';
import { BlockLayouts } from '../data/blockLayouts';
import { getSchoolSettings, saveSchoolSettings, SchoolSettings } from '../utils/schoolSettings';
import { toCompactDate } from '../utils/textbookList';
import { useNeisTimetable } from '../utils/useNeisTimetable';
import { RotateCcw, Save, X } from 'lucide-react';

interface TimetableManagerProps {
  onClose: () => void;
  onSaved: () => void;
}

const DAYS: Array<{ key: DayOfWeek; label: string }> = [
  { key: 'MON', label: '월' },
  { key: 'TUE', label: '화' },
  { key: 'WED', label: '수' },
  { key: 'THU', label: '목' },
  { key: 'FRI', label: '금' },
];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];
const MAX_CLASS = 15;

function findBlock(layouts: BlockLayouts, grade: number, cell: string): string {
  const entry = Object.entries(layouts[grade] || {}).find(([, slots]) => slots?.includes(cell));
  return entry ? entry[0] : '';
}

export const TimetableManager: React.FC<TimetableManagerProps> = ({ onClose, onSaved }) => {
  const [grade, setGrade] = useState(2);
  const [classNum, setClassNum] = useState(1);
  const [draft, setDraft] = useState<SchoolSettings>(() => JSON.parse(JSON.stringify(getSchoolSettings())));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { rows, days, isLoading } = useNeisTimetable(grade, classNum);
  const classKey = `${grade}-${classNum}`;
  const blocks = getBlocksForGrade(grade);
  const classOverrides = draft.overrides[classKey] || {};

  const blockCounts = useMemo(() => {
    return blocks.map((block) => `${block} ${draft.layouts[grade]?.[block]?.length || 0}칸`).join(' · ');
  }, [blocks, draft.layouts, grade]);

  const getCellSubject = (dayIndex: number, cell: string, period: number) => {
    if (cell in classOverrides) return classOverrides[cell];
    const date = toCompactDate(days[dayIndex]);
    return rows.find((row) => row.date === date && row.period === period)?.subject || '';
  };

  const handleChangeBlock = (cell: string, block: string) => {
    setMessage('');
    setDraft((current) => {
      const gradeLayout = { ...current.layouts[grade] };
      Object.keys(gradeLayout).forEach((key) => {
        const blockKey = key as BlockId;
        gradeLayout[blockKey] = (gradeLayout[blockKey] || []).filter((slot) => slot !== cell);
      });
      if (block) {
        const blockKey = block as BlockId;
        gradeLayout[blockKey] = [...(gradeLayout[blockKey] || []), cell];
      }
      return { ...current, layouts: { ...current.layouts, [grade]: gradeLayout } };
    });
  };

  const handleChangeSubject = (cell: string, subject: string) => {
    setMessage('');
    setDraft((current) => ({
      ...current,
      overrides: {
        ...current.overrides,
        [classKey]: { ...current.overrides[classKey], [cell]: subject },
      },
    }));
  };

  const handleResetClass = () => {
    setMessage('');
    setDraft((current) => {
      const overrides = { ...current.overrides };
      delete overrides[classKey];
      return { ...current, overrides };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setMessage('');
    try {
      await saveSchoolSettings(draft);
      onSaved();
      setMessage('저장했습니다. 학생 화면에 반영됩니다.');
    } catch {
      setError('저장하지 못했습니다. Supabase에 school_settings 테이블이 있는지 확인해 주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col max-h-[94vh]">
        <div className="p-4 border-b border-slate-200 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">시간표 관리</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              칸의 글자를 고치면 이 반의 시간표가 바뀌고, 블록을 고르면 같은 학년 모든 반에 적용됩니다.
            </p>
          </div>
          <button onClick={onClose} title="닫기" className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto space-y-3 text-xs">
          <div className="flex items-end gap-3 flex-wrap">
            <label className="font-semibold text-slate-700">
              학년
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="block mt-1 px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value={1}>1학년</option>
                <option value={2}>2학년</option>
                <option value={3}>3학년</option>
              </select>
            </label>
            <label className="font-semibold text-slate-700">
              반
              <select
                value={classNum}
                onChange={(e) => setClassNum(Number(e.target.value))}
                className="block mt-1 px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {Array.from({ length: MAX_CLASS }, (_, index) => index + 1).map((value) => (
                  <option key={value} value={value}>
                    {value}반
                  </option>
                ))}
              </select>
            </label>
            {blocks.length > 0 && <span className="pb-2 text-slate-600 tabular-nums">{blockCounts}</span>}
            {isLoading && <span className="pb-2 text-slate-500">불러오는 중입니다.</span>}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="p-2 border border-slate-200 w-12">교시</th>
                  {DAYS.map((day, index) => (
                    <th key={day.key} className="p-2 border border-slate-200">
                      {day.label} ({days[index].getMonth() + 1}/{days[index].getDate()})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERIODS.map((period) => (
                  <tr key={period}>
                    <td className="p-2 border border-slate-200 text-center font-bold tabular-nums">{period}</td>
                    {DAYS.map((day, dayIndex) => {
                      const cell = `${day.key}-${period}`;
                      const block = findBlock(draft.layouts, grade, cell);
                      return (
                        <td
                          key={cell}
                          className={`p-1.5 border border-slate-200 align-top ${block ? 'bg-indigo-50' : ''}`}
                        >
                          {blocks.length > 0 && (
                            <select
                              aria-label={`${day.label}요일 ${period}교시 블록`}
                              value={block}
                              onChange={(e) => handleChangeBlock(cell, e.target.value)}
                              className="w-full mb-1 px-1.5 py-1 border border-slate-300 rounded bg-white"
                            >
                              <option value="">일반</option>
                              {blocks.map((item) => (
                                <option key={item} value={item}>
                                  {item}블록
                                </option>
                              ))}
                            </select>
                          )}
                          {block ? (
                            <p className="px-1 py-1 text-slate-500">학생 선택과목</p>
                          ) : (
                            <input
                              type="text"
                              aria-label={`${day.label}요일 ${period}교시 과목`}
                              value={getCellSubject(dayIndex, cell, period)}
                              onChange={(e) => handleChangeSubject(cell, e.target.value)}
                              placeholder="수업 없음"
                              className="w-full px-1.5 py-1 border border-slate-200 rounded"
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && <p className="font-semibold text-rose-700">{error}</p>}
          {message && <p className="font-semibold text-emerald-700">{message}</p>}
        </div>

        <div className="p-4 border-t border-slate-200 flex items-center justify-between gap-2">
          <button
            onClick={handleResetClass}
            className="px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            이 반을 NEIS로 되돌리기
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            {isSaving ? '저장 중입니다' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};
