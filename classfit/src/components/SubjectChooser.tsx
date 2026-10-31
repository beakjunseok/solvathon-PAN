import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export interface SchoolSubject {
  name: string;
  grades: number[];
}

interface SubjectChooserProps {
  value: string[];
  onChange: (subjects: string[]) => void;
}

let cachedSubjects: Promise<SchoolSubject[]> | null = null;

export function fetchSchoolSubjects(): Promise<SchoolSubject[]> {
  if (!cachedSubjects) {
    cachedSubjects = fetch('/api/subjects')
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data.subjects as SchoolSubject[];
      })
      .catch((err) => {
        cachedSubjects = null;
        throw err;
      });
  }
  return cachedSubjects;
}

export const SubjectChooser: React.FC<SubjectChooserProps> = ({ value, onChange }) => {
  const [subjects, setSubjects] = useState<SchoolSubject[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;
    fetchSchoolSubjects()
      .then((list) => {
        if (isActive) setSubjects(list);
      })
      .catch(() => {
        if (isActive) setError('과목 목록을 불러오지 못했습니다. 다시 열어 주세요.');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, []);

  if (isLoading) return <p className="text-sm text-slate-500">과목 목록을 불러오는 중입니다.</p>;
  if (error) return <p className="text-sm font-semibold text-rose-700">{error}</p>;

  return (
    <div className="space-y-2">
      <select
        aria-label="담당 과목 추가"
        value=""
        onChange={(e) => {
          if (e.target.value && !value.includes(e.target.value)) onChange([...value, e.target.value]);
        }}
        className="w-full min-h-11 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-base sm:text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      >
        <option value="">{value.length > 0 ? '과목 더 추가하기' : '과목을 고르세요'}</option>
        {[1, 2, 3].map((grade) => (
          <optgroup key={grade} label={`${grade}학년`}>
            {subjects
              .filter((subject) => subject.grades.includes(grade))
              .map((subject) => (
                <option key={subject.name} value={subject.name} disabled={value.includes(subject.name)}>
                  {subject.name}
                </option>
              ))}
          </optgroup>
        ))}
      </select>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-sm font-medium text-indigo-900"
            >
              {name}
              <button
                type="button"
                title={`${name} 빼기`}
                onClick={() => onChange(value.filter((item) => item !== name))}
                className="text-indigo-400 hover:text-rose-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
