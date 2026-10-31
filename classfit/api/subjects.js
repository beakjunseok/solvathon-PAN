// 학교 전 학년의 현재 개설 과목을 NEIS 시간표에서 모은다.
const NEIS_URL = 'https://open.neis.go.kr/hub/hisTimetable';
const OFFICE_CODE = 'B10';
const SCHOOL_CODE = '7010239';
const RANGE_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const NON_SUBJECT_PATTERN = /자율|자치|동아리|진로활동|봉사|휴업|방학|보강|고사|시험/;

function toCompactDate(time) {
  return new Date(time).toISOString().slice(0, 10).replace(/-/g, '');
}

function getTerm(date) {
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(4, 6));
  return {
    year: month <= 2 ? String(year - 1) : String(year),
    semester: month >= 3 && month <= 7 ? '1' : '2',
  };
}

async function fetchGradeSubjects(grade, from, to) {
  const { year, semester } = getTerm(to);
  const params = new URLSearchParams({
    Type: 'json',
    pIndex: '1',
    pSize: '1000',
    ATPT_OFCDC_SC_CODE: OFFICE_CODE,
    SD_SCHUL_CODE: SCHOOL_CODE,
    AY: year,
    SEM: semester,
    GRADE: String(grade),
    TI_FROM_YMD: from,
    TI_TO_YMD: to,
  });
  if (process.env.NEIS_API_KEY) params.set('KEY', process.env.NEIS_API_KEY);

  const response = await fetch(`${NEIS_URL}?${params}`);
  const data = await response.json();
  const rows = data.hisTimetable?.[1]?.row || [];
  return Array.from(new Set(rows.map((row) => row.ITRT_CNTNT))).filter(
    (name) => !NON_SUBJECT_PATTERN.test(name)
  );
}

export default async function handler(req, res) {
  try {
    const now = Date.now();
    const from = toCompactDate(now - RANGE_DAYS * MS_PER_DAY);
    const to = toCompactDate(now + RANGE_DAYS * MS_PER_DAY);
    const lists = await Promise.all([1, 2, 3].map((grade) => fetchGradeSubjects(grade, from, to)));

    const subjects = {};
    lists.forEach((names, index) => {
      names.forEach((name) => {
        subjects[name] = [...(subjects[name] || []), index + 1];
      });
    });

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({
      subjects: Object.entries(subjects)
        .map(([name, grades]) => ({ name, grades }))
        .sort((a, b) => a.name.localeCompare(b.name, 'ko')),
    });
  } catch {
    res.status(502).json({ error: '과목 목록을 불러오지 못했습니다.' });
  }
}
