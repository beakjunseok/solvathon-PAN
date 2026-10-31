import React, { useEffect, useMemo, useState } from 'react';
import { Assessment, StudentProfile, Submission } from '../types';
import { getFileUrl } from '../utils/remoteStore';
import {
  buildSubmissionCsv,
  countCharacters,
  findSimilarPairs,
  getStudentNumber,
  getTargetStudents,
  loadSubmissions,
  saveSubmission,
} from '../utils/submissionStore';
import { ClipboardList, Copy, Download, RefreshCw, X } from 'lucide-react';

interface SubmissionStatusModalProps {
  assessment: Assessment;
  students: StudentProfile[];
  onClose: () => void;
}

export const SubmissionStatusModal: React.FC<SubmissionStatusModalProps> = ({ assessment, students, onClose }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  const refresh = async () => {
    setIsLoading(true);
    setError('');
    try {
      const rows = await loadSubmissions(assessment.id);
      setSubmissions(rows.sort((a, b) => a.studentNumber.localeCompare(b.studentNumber)));
    } catch {
      setError('제출 현황을 불러오지 못했습니다. Supabase 설정을 확인해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [assessment.id]);

  const targets = useMemo(() => getTargetStudents(assessment, students), [assessment, students]);
  const missing = targets.filter((t) => !submissions.some((s) => s.studentId === t.id));
  const similarPairs = useMemo(() => findSimilarPairs(submissions), [submissions]);

  const handleCopyMissing = async () => {
    const list = missing.map((s) => `${getStudentNumber(s)} ${s.name}`).join('\n');
    try {
      await navigator.clipboard.writeText(`[${assessment.subject}] ${assessment.title} 미제출자\n${list}`);
      setNotice('미제출자 명단을 복사했습니다.');
    } catch {
      setNotice('복사하지 못했습니다. 명단을 직접 선택해 복사해 주세요.');
    }
  };

  const handleDownloadCsv = () => {
    const header = ['학번', '이름', '상태', '제출 시각', '글자 수', '첨부 수', '점수', '피드백', '내용'];
    const rows = [
      ...submissions.map((s) => [
        s.studentNumber,
        s.studentName,
        s.isLate ? '지각 제출' : '제출',
        new Date(s.submittedAt).toLocaleString('ko-KR'),
        countCharacters(s.content),
        s.files.length,
        s.score ?? '',
        s.feedback,
        s.content,
      ]),
      ...missing.map((s) => [getStudentNumber(s), s.name, '미제출', '', '', '', '', '', '']),
    ];
    const blob = new Blob([buildSubmissionCsv([header, ...rows])], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${assessment.subject}_${assessment.title}_제출현황.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleOpen = (submission: Submission) => {
    if (openId === submission.id) {
      setOpenId(null);
      return;
    }
    setOpenId(submission.id);
    setScoreInput(submission.score === null ? '' : String(submission.score));
    setFeedbackInput(submission.feedback);
  };

  const handleSaveGrade = async (submission: Submission) => {
    const trimmed = scoreInput.trim();
    const score = trimmed === '' ? null : Number(trimmed);
    if (score !== null && Number.isNaN(score)) {
      setError('점수는 숫자로 입력해 주세요.');
      return;
    }
    const updated = { ...submission, score, feedback: feedbackInput.trim() };
    setError('');
    try {
      await saveSubmission(updated);
      setSubmissions((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
      setNotice(`${updated.studentName} 학생의 평가를 저장했습니다.`);
    } catch {
      setError('평가를 저장하지 못했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-indigo-600">
              {assessment.targetGrade}학년 {assessment.block === 'COMMON' ? '공통' : `${assessment.block}블록`} · {assessment.subject}
            </p>
            <h2 className="text-base font-bold text-slate-900 truncate">{assessment.title}</h2>
            {assessment.submission && (
              <p className="text-xs text-slate-500 mt-0.5">마감: {assessment.submission.deadline.replace('T', ' ')}</p>
            )}
          </div>
          <button onClick={onClose} title="닫기" className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-slate-500">대상</div>
              <div className="text-lg font-bold text-slate-900 tabular-nums">{targets.length}명</div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-emerald-700">제출</div>
              <div className="text-lg font-bold text-emerald-800 tabular-nums">{submissions.length}명</div>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <div className="text-rose-700">미제출</div>
              <div className="text-lg font-bold text-rose-800 tabular-nums">{missing.length}명</div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={refresh} className="px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold flex items-center gap-1.5 hover:bg-slate-50">
              <RefreshCw className="w-3.5 h-3.5" />
              새로고침
            </button>
            <button onClick={handleDownloadCsv} className="px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold flex items-center gap-1.5 hover:bg-slate-50">
              <Download className="w-3.5 h-3.5" />
              엑셀용 CSV 저장
            </button>
            <button
              onClick={handleCopyMissing}
              disabled={missing.length === 0}
              className="px-3 py-2 bg-white border border-slate-300 rounded-lg font-semibold flex items-center gap-1.5 hover:bg-slate-50 disabled:opacity-50"
            >
              <Copy className="w-3.5 h-3.5" />
              미제출자 복사
            </button>
          </div>

          {error && <p className="font-semibold text-rose-700">{error}</p>}
          {notice && <p className="font-semibold text-emerald-700">{notice}</p>}

          {similarPairs.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <p className="font-bold text-amber-900">내용이 비슷한 제출물</p>
              {similarPairs.map((pair) => (
                <p key={`${pair.first.id}-${pair.second.id}`} className="text-amber-900">
                  {pair.first.studentName} · {pair.second.studentName}: {pair.percent}% 일치
                </p>
              ))}
              <p className="text-amber-700">자동 비교 결과이므로 원문을 직접 확인해 주세요.</p>
            </div>
          )}

          {isLoading ? (
            <p className="text-slate-500">제출 현황을 불러오는 중입니다.</p>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-300 rounded-xl">
              <ClipboardList className="w-7 h-7 text-slate-400 mx-auto mb-2" />
              <p className="font-semibold">아직 제출한 학생이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {submissions.map((submission) => (
                <div key={submission.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => handleToggleOpen(submission)}
                    className="w-full p-3 flex items-center justify-between gap-3 text-left hover:bg-slate-50"
                  >
                    <span className="font-bold text-slate-900">
                      {submission.studentNumber} {submission.studentName}
                      {submission.isLate && <span className="ml-1.5 text-rose-600">지각</span>}
                    </span>
                    <span className="text-slate-500 tabular-nums shrink-0">
                      {countCharacters(submission.content).toLocaleString()}자 · 첨부 {submission.files.length} ·{' '}
                      {submission.score === null ? '미채점' : `${submission.score}점`}
                    </span>
                  </button>

                  {openId === submission.id && (
                    <div className="p-3 border-t border-slate-100 bg-slate-50 space-y-2">
                      <p className="text-slate-500">제출: {new Date(submission.submittedAt).toLocaleString('ko-KR')}</p>
                      {submission.content && (
                        <p className="p-3 bg-white rounded-lg border border-slate-200 whitespace-pre-line leading-relaxed">
                          {submission.content}
                        </p>
                      )}
                      {submission.files.map((file) => (
                        <a key={file.path} href={getFileUrl(file)} className="block text-indigo-700 underline truncate">
                          {file.name}
                        </a>
                      ))}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <input
                          type="number"
                          value={scoreInput}
                          onChange={(e) => setScoreInput(e.target.value)}
                          placeholder="점수"
                          className="px-3 py-2 bg-white border border-slate-300 rounded-lg"
                        />
                        <input
                          type="text"
                          value={feedbackInput}
                          onChange={(e) => setFeedbackInput(e.target.value)}
                          placeholder="학생에게 보여 줄 피드백"
                          className="sm:col-span-2 px-3 py-2 bg-white border border-slate-300 rounded-lg"
                        />
                        <button
                          onClick={() => handleSaveGrade(submission)}
                          className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
                        >
                          평가 저장
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {missing.length > 0 && (
            <div>
              <p className="font-bold text-slate-800 mb-1">미제출자</p>
              <p className="text-slate-600">
                {missing.map((s) => `${getStudentNumber(s)} ${s.name}`).join(', ')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
