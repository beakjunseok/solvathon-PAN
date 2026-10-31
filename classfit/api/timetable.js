// NEIS 키를 브라우저에 노출하지 않도록 서버에서 대신 호출한다.
const NEIS_URL = 'https://open.neis.go.kr/hub/hisTimetable';
const OFFICE_CODE = 'B10';
const SCHOOL_CODE = '7010239';

function getSemester(from) {
  return Number(from.slice(4, 6)) >= 3 && Number(from.slice(4, 6)) <= 7 ? '1' : '2';
}

function getAcademicYear(from) {
  const year = Number(from.slice(0, 4));
  return Number(from.slice(4, 6)) <= 2 ? String(year - 1) : String(year);
}

export default async function handler(req, res) {
  const { grade, classNum, from, to } = req.query;
  const isValid =
    /^[123]$/.test(grade || '') &&
    /^\d{1,2}$/.test(classNum || '') &&
    /^\d{8}$/.test(from || '') &&
    /^\d{8}$/.test(to || '');

  if (!isValid) {
    res.status(400).json({ error: '조회 조건이 올바르지 않습니다.' });
    return;
  }

  const key = process.env.NEIS_API_KEY;
  const params = new URLSearchParams({
    Type: 'json',
    pIndex: '1',
    pSize: '1000',
    ATPT_OFCDC_SC_CODE: OFFICE_CODE,
    SD_SCHUL_CODE: SCHOOL_CODE,
    AY: getAcademicYear(from),
    SEM: getSemester(from),
    GRADE: grade,
    CLASS_NM: classNum,
    TI_FROM_YMD: from,
    TI_TO_YMD: to,
  });
  if (key) params.set('KEY', key);

  try {
    const response = await fetch(`${NEIS_URL}?${params}`);
    const data = await response.json();
    const sections = data.hisTimetable;
    const code = data.RESULT?.CODE;

    if (!sections && code !== 'INFO-200') {
      res.status(502).json({ error: 'NEIS에서 시간표를 받지 못했습니다.' });
      return;
    }

    const rows = (sections?.[1]?.row || []).map((row) => ({
      date: row.ALL_TI_YMD,
      period: Number(row.PERIO),
      subject: row.ITRT_CNTNT,
    }));

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ rows, limited: !key });
  } catch {
    res.status(502).json({ error: 'NEIS에 연결하지 못했습니다.' });
  }
}
