// 공휴일, 방학, 휴업일처럼 수업이 없는 날을 NEIS 학사일정에서 찾는다.
const NEIS_URL = 'https://open.neis.go.kr/hub/SchoolSchedule';
const OFFICE_CODE = 'B10';
const SCHOOL_CODE = '7010239';
const GRADE_FIELDS = { 1: 'ONE_GRADE_EVENT_YN', 2: 'TW_GRADE_EVENT_YN', 3: 'THREE_GRADE_EVENT_YN' };

export default async function handler(req, res) {
  const { grade, from, to } = req.query;
  const isValid = /^[123]$/.test(grade || '') && /^\d{8}$/.test(from || '') && /^\d{8}$/.test(to || '');

  if (!isValid) {
    res.status(400).json({ error: '조회 조건이 올바르지 않습니다.' });
    return;
  }

  const params = new URLSearchParams({
    Type: 'json',
    pIndex: '1',
    pSize: '100',
    ATPT_OFCDC_SC_CODE: OFFICE_CODE,
    SD_SCHUL_CODE: SCHOOL_CODE,
    AA_FROM_YMD: from,
    AA_TO_YMD: to,
  });
  if (process.env.NEIS_API_KEY) params.set('KEY', process.env.NEIS_API_KEY);

  try {
    const response = await fetch(`${NEIS_URL}?${params}`);
    const data = await response.json();
    const rows = data.SchoolSchedule?.[1]?.row || [];
    const days = {};

    rows
      .filter((row) => ['공휴일', '휴업일'].includes(row.SBTR_DD_SC_NM))
      .filter((row) => row.EVENT_NM !== '토요휴업일')
      // 학년 표시가 있는 행사는 해당 학년에만 적용한다.
      .filter((row) => row[GRADE_FIELDS[grade]] !== 'N')
      .forEach((row) => {
        // 방학 중 공휴일은 공휴일 이름을 보여 준다.
        if (!days[row.AA_YMD] || row.SBTR_DD_SC_NM === '공휴일') {
          days[row.AA_YMD] = row.EVENT_NM;
        }
      });

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ days });
  } catch {
    res.status(502).json({ error: '학사일정을 불러오지 못했습니다.' });
  }
}
