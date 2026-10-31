import React, { useEffect, useState } from 'react';

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

  const toggle = (name: string) => {
    onChange(value.includes(name) ? value.filter((item) => item !== name) : [...value, name]);
  };

  if (isLoading) return <p className="text-sm text-slate-500">과목 목록을 불러오는 중입니다.</p>;
  if (error) return <p className="text-sm font-semibold text-rose-700">{error}</p>;

  return (
    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
      {[1, 2, 3].map((grade) => {
        const gradeSubjects = subjects.filter((subject) => subject.grades.includes(grade));
        if (gradeSubjects.length === 0) return null;
        return (
          <fieldset key={grade}>
            <legend className="mb-1 text-xs font-semibold text-slate-500">{grade}학년</legend>
            <div className="flex flex-wrap gap-1.5">
              {gradeSubjects.map((subject) => {
                const isSelected = value.includes(subject.name);
                return (
                  <button
                    key={subject.name}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => toggle(subject.name)}
                    className={`min-h-9 px-2.5 py-1 rounded-lg border text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {subject.name}
                  </button>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
};
