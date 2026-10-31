import React, { useEffect, useState } from 'react';
import { FileRef, MatchedAssessment, StudentProfile, Submission } from '../types';
import { FILE_ACCEPT, getFileUrl, isRemoteConfigured, uploadFile, validateFile } from '../utils/remoteStore';
import {
  countCharacters,
  getStudentNumber,
  getSubmissionId,
  loadSubmissions,
  saveSubmission,
} from '../utils/submissionStore';
import { CheckCircle2, Paperclip, Send, Tablet, X } from 'lucide-react';

interface SubmissionPanelProps {
  assessment: MatchedAssessment;
  student: StudentProfile;
  onSubmitted: () => void;
}

function formatDeadline(deadline: string): string {
  return deadline.replace('T', ' ');
}

function getRemainingText(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return '마감되었습니다. 지금 제출하면 지각으로 기록됩니다.';
  const hours = Math.floor(diff / 3600000);
  if (hours >= 24) return `마감까지 ${Math.floor(hours / 24)}일 남았습니다.`;
  if (hours >= 1) return `마감까지 ${hours}시간 남았습니다.`;
  return `마감까지 ${Math.max(1, Math.floor(diff / 60000))}분 남았습니다.`;
}

export const SubmissionPanel: React.FC<SubmissionPanelProps> = ({ assessment, student, onSubmitted }) => {
  const settings = assessment.submission;
  const submissionId = getSubmissionId(assessment.id, student.id);
  const draftKey = `classfit_draft_${submissionId}`;
  const allowsText = settings?.mode !== 'file';
  const allowsFile = settings?.mode !== 'text';

  const [existing, setExisting] = useState<Submission | null>(null);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<FileRef[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isActive = true;
    loadSubmissions(assessment.id)
      .then((rows) => {
        if (!isActive) return;
        const mine = rows.find((row) => row.id === submissionId) || null;
        setExisting(mine);
        setFiles(mine?.files || []);
        setContent(localStorage.getItem(draftKey) ?? mine?.content ?? '');
      })
      .catch(() => {
        if (!isActive) return;
        setError('제출 내역을 불러오지 못했습니다. 네트워크 연결을 확인해 주세요.');
        setContent(localStorage.getItem(draftKey) ?? '');
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [assessment.id, submissionId, draftKey]);

  if (!settings?.enabled) return null;

  const handleContentChange = (value: string) => {
    setContent(value);
    setNotice('');
    try {
      localStorage.setItem(draftKey, value);
    } catch {
      // 임시 저장 실패는 제출에 영향을 주지 않는다.
    }
  };

  const handleSelectFiles = async (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;
    setError('');
    setIsBusy(true);
    try {
      const uploaded: FileRef[] = [];
      for (const file of Array.from(selected)) {
        const invalid = validateFile(file);
        if (invalid) {
          setError(invalid);
          continue;
        }
        const displayName = `${getStudentNumber(student)}_${student.name}_${file.name}`;
        uploaded.push(await uploadFile(`submissions/${assessment.id}/${student.id}`, file, displayName));
      }
      setFiles((current) => [...current, ...uploaded]);
    } catch {
      setError('파일을 올리지 못했습니다. 다시 시도해 주세요.');
    } finally {
      setIsBusy(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setNotice('');
    if (!content.trim() && files.length === 0) {
      setError(settings.mode === 'file' ? '파일을 첨부해 주세요.' : '내용을 입력하거나 파일을 첨부해 주세요.');
      return;
    }

    const now = new Date();
    const submission: Submission = {
      id: submissionId,
      assessmentId: assessment.id,
      studentId: student.id,
      studentName: student.name,
      studentNumber: getStudentNumber(student),
      content: allowsText ? content : '',
      files,
      submittedAt: now.toISOString(),
      isLate: now.getTime() > new Date(settings.deadline).getTime(),
      score: existing?.score ?? null,
      feedback: existing?.feedback ?? '',
    };

    setIsBusy(true);
    try {
      await saveSubmission(submission);
      setExisting(submission);
      try {
        localStorage.removeItem(draftKey);
      } catch {
        // 임시 글이 남아도 제출은 끝난 상태다.
      }
      setNotice(isRemoteConfigured ? '제출을 완료했습니다.' : '이 기기에만 저장했습니다. 선생님께 전달되지 않습니다.');
      onSubmitted();
    } catch {
      setError('제출하지 못했습니다. 작성한 글은 임시 저장되어 있으니 다시 시도해 주세요.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
          <Tablet className="w-4 h-4 text-indigo-600" />
          디벗으로 제출하기
        </h3>
        {existing && (
          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            제출됨{existing.isLate ? ' (지각)' : ''}
          </span>
        )}
      </div>

      <div className="text-xs text-slate-600">
        <p>마감: <strong>{formatDeadline(settings.deadline)}</strong></p>
        <p>{getRemainingText(settings.deadline)}</p>
        {existing && (
          <p>최종 제출: {new Date(existing.submittedAt).toLocaleString('ko-KR')} · 다시 제출하면 덮어씁니다.</p>
        )}
      </div>

      {existing && (existing.score !== null || existing.feedback) && (
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700">
          {existing.score !== null && <p className="font-bold">점수: {existing.score}점</p>}
          {existing.feedback && <p className="mt-1 whitespace-pre-line">{existing.feedback}</p>}
        </div>
      )}

      {isLoading ? (
        <p className="text-xs text-slate-500">제출 내역을 불러오는 중입니다.</p>
      ) : (
        <>
          {allowsText && (
            <div>
              <textarea
                rows={8}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="여기에 바로 작성하세요. 작성 중인 글은 이 기기에 자동 저장됩니다."
                className="w-full p-3 bg-white border border-slate-300 rounded-xl text-base sm:text-sm text-slate-900 leading-relaxed focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <div className="text-right text-xs text-slate-500 tabular-nums">
                공백 제외 {countCharacters(content).toLocaleString()}자
              </div>
            </div>
          )}

          {allowsFile && (
            <div className="space-y-2">
              {isRemoteConfigured ? (
                <label className="flex items-center justify-center gap-2 min-h-12 px-4 py-3 bg-white border border-dashed border-slate-400 rounded-xl text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-50">
                  <Paperclip className="w-4 h-4" />
                  {isBusy ? '처리 중입니다' : '파일 첨부 (20MB 이하)'}
                  <input
                    type="file"
                    multiple
                    accept={FILE_ACCEPT}
                    disabled={isBusy}
                    className="sr-only"
                    onChange={(e) => {
                      handleSelectFiles(e.target.files);
                      e.target.value = '';
                    }}
                  />
                </label>
              ) : (
                <p className="text-xs text-amber-700">서버가 연결되지 않아 파일을 올릴 수 없습니다.</p>
              )}

              {files.map((file) => (
                <div key={file.path} className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-200 text-xs">
                  <a href={getFileUrl(file)} className="truncate text-indigo-700 underline">
                    {file.name}
                  </a>
                  <button
                    type="button"
                    title="첨부 취소"
                    onClick={() => setFiles((current) => current.filter((f) => f.path !== file.path))}
                    className="p-1 text-slate-400 hover:text-rose-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && <p className="text-xs font-semibold text-rose-700">{error}</p>}
          {notice && <p className="text-xs font-semibold text-emerald-700">{notice}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isBusy}
            className="w-full min-h-12 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {existing ? '다시 제출하기' : '제출하기'}
          </button>
        </>
      )}
    </div>
  );
};
