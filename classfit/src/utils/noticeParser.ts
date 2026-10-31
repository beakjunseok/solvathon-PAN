import { AssessmentType, BlockId } from '../types';

export interface ParsedNotice {
  grade: number | null;
  block: BlockId | null;
  subject: string;
  title: string;
  type: AssessmentType;
  date: string;
  room: string;
  supplies: string[];
  missing: string[];
}

function normalize(text: string): string {
  return text.replace(/\s/g, '').toLowerCase();
}

function toDateString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function parseDate(text: string, today: Date): string {
  const match = text.match(/(?:(\d{4})\s*년\s*)?(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (!match) return '';
  const month = Number(match[2]);
  const day = Number(match[3]);
  let year = match[1] ? Number(match[1]) : today.getFullYear();
  // 연도 없는 12월 공지의 1월 날짜처럼 반년 넘게 지난 날짜는 내년으로 본다.
  if (!match[1] && today.getTime() - new Date(year, month - 1, day).getTime() > 180 * 86400000) {
    year += 1;
  }
  const date = new Date(year, month - 1, day);
  return date.getMonth() === month - 1 && date.getDate() === day ? toDateString(date) : '';
}

function parseSubject(text: string, knownSubjects: string[]): string {
  const target = normalize(text);
  const longestFirst = [...knownSubjects].sort((a, b) => b.length - a.length);
  return longestFirst.find((subject) => target.includes(normalize(subject))) || '';
}

function parseSupplies(text: string): string[] {
  const match = text.match(/준비물\s*(?:은|는|:|：)?\s*([^.\n]+)/);
  if (!match) return [];
  return match[1]
    .replace(/\s*(?:입니다|이에요|예요|[을를]?\s*지참.*|[을를]?\s*챙겨.*)$/, '')
    .split(/\s*(?:,|·|、|\/|및)\s*|(?<=[가-힣])(?:와|과)\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseRoom(text: string): string {
  const match = text.match(/(?:신관|본관|별관)\s*\d+\s*층\s*[^\s,.]*/);
  return match ? match[0].replace(/(?:으로|로|에서|에)$/, '').trim() : '';
}

function parseType(text: string): AssessmentType {
  if (/실험|탐구/.test(text)) return '실험/탐구';
  if (/발표|구술/.test(text)) return '구술/발표';
  if (/논술|서술/.test(text)) return '논술/서술';
  if (/포트폴리오/.test(text)) return '포트폴리오';
  if (/프로젝트/.test(text)) return '프로젝트';
  return '단원평가';
}

function parseTitle(text: string): string {
  const match = text.match(/시간에\s+(.+?)[을를]\s*(?:실시|진행|봅니다)/);
  return match ? match[1].trim() : '';
}

// 공지 글에서 찾은 항목과 찾지 못한 항목을 함께 돌려준다.
export function parseNotice(text: string, today: Date, knownSubjects: string[]): ParsedNotice {
  const gradeMatch = text.match(/([123])\s*학년/);
  const blockMatch = text.match(/([A-Ha-h])\s*블록/);
  const block = blockMatch ? (blockMatch[1].toUpperCase() as BlockId) : null;
  let grade = gradeMatch ? Number(gradeMatch[1]) : null;
  if (!grade && block && 'EFGH'.includes(block)) grade = 3;

  const subject = parseSubject(text, knownSubjects);
  const date = parseDate(text, today);
  const title = parseTitle(text);

  const missing: string[] = [];
  if (!grade) missing.push('학년');
  if (!block) missing.push('블록');
  if (!subject) missing.push('과목');
  if (!date) missing.push('날짜');
  if (!title) missing.push('평가명');

  return {
    grade,
    block,
    subject,
    title,
    type: parseType(text),
    date,
    room: parseRoom(text),
    supplies: parseSupplies(text),
    missing,
  };
}
