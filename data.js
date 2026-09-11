// 화면 데이터. 값은 교육용 서버(edu.neis.go.kr)의 테스트 데이터이며 사용자ID는 가린 값이다.
// columns[].type: 'checkbox' | 'text' | 'link' | 'edit'
// columns[].currentHeader: 현재 버전 이름 합성에 쓰이는 열 이름(실측 오기재 재현용)
// checkboxHeader: 현재 버전 체크박스 이름 합성에 들어가는 열 이름 슬롯(실측: 화면마다 다름)

const APPROVER_NAMES = [
  '김민준',
  '이서연',
  '박도윤',
  '최지우',
  '정예준',
  '강하은',
  '조시우',
  '윤서아',
  '장하준',
  '임지민',
  '한지호',
  '오수아',
  '서은우',
  '신다은',
  '권유준',
  '황채원',
  '안현우',
  '송지아',
  '류건우',
  '전서윤',
  '홍시온',
  '고예린',
  '문준서',
  '양하린',
  '손민재',
  '배소율',
  '백지훈',
  '허유나',
  '유태양',
  '남가은',
  '심승우',
  '노지원',
  '곽연우',
  '성서현',
  '차은호',
  '주아린',
  '우재원',
  '구나연',
  '민준혁',
  '라하율',
  '진시현',
  '엄지유',
  '원도현',
  '방수빈',
  '공하람',
  '석윤아',
  '탁지환',
  '변예나',
  '길준우',
  '반서준',
];

function approverRows() {
  const rows = [];
  for (let i = 1; i <= 50; i += 1) {
    const n = String(i).padStart(3, '0');
    const first = i === 1;
    const last = i === 50;
    rows.push({
      no: String(i),
      id: `user${n}`,
      name: APPROVER_NAMES[i - 1],
      pos: first ? '장학사' : (last ? '' : '교사'),
      org: '테스트교육청',
      note: first ? '퇴직' : '',
    });
  }
  return rows;
}

export const screens = [
  {
    id: 'approver',
    title: '결재자지정 사용자 목록',
    menu: '복무, 개인근무상황관리, 승인요청, 결재자지정',
    note: '이름 문자열의 규칙과 1행·50행의 직위·비고는 2026년 9월 11일 실측 원문이고, 성명은 가명, 2행부터 49행까지는 같은 규칙으로 채운 자리표시 데이터입니다.',
    gridName: { current: '사용자', improved: '사용자' },
    checkboxHeader: '',
    columns: [
      { key: 'sel', header: '선택', type: 'checkbox' },
      { key: 'no', header: '순번' },
      { key: 'id', header: '사용자ID' },
      { key: 'name', header: '사용자명' },
      { key: 'pos', header: '직위' },
      { key: 'org', header: '조직명' },
      { key: 'note', header: '비고' },
    ],
    rows: approverRows(),
  },
  {
    id: 'flexwork',
    title: '유연근무 목록',
    menu: '복무, 개인유연근무관리',
    note: '두 행 22칸 전부 2026년 9월 11일 센스리더 낭독과 DOM 실측이 일치한 원문입니다. 신청기간 칸은 임시저장 행이라 이름 끝에 「link」가 붙습니다.',
    gridName: { current: '유연근무목록', improved: '유연근무목록' },
    checkboxHeader: '선택',
    columns: [
      { key: 'sel', header: '선택', type: 'checkbox' },
      { key: 'no', header: '순번' },
      { key: 'name', header: '성명' },
      { key: 'dept', header: '부서명' },
      { key: 'dept0', header: '신청당시부서' },
      { key: 'rank0', header: '신청당시직급' },
      { key: 'kind', header: '신청유형' },
      { key: 'period', header: '신청기간', type: 'link' },
      { key: 'reason', header: '신청사유' },
      { key: 'status', header: '결재상태' },
      { key: 'div', header: '신청구분' },
    ],
    rows: [
      { no: '1', name: '오리온', dept: '테스트교육청', dept0: '테스트교육청', rank0: '지방전산주사보', kind: '근무시간선택형', period: '2026.09.07 ~ 2026.09.11', reason: '근무시간 선택', status: '임시저장', div: '신청' },
      { no: '2', name: '오리온', dept: '테스트교육청', dept0: '테스트교육청', rank0: '지방전산주사보', kind: '시차출퇴근형', period: '2026.08.31 ~ 2026.09.04', reason: '출퇴근', status: '임시저장', div: '신청' },
    ],
  },
  {
    id: 'score',
    title: '정기시험성적관리 점수 입력',
    menu: '성적, 지필평가, 정기시험성적관리',
    note: '2026년 7월 14일 실측에서 확인한 이름 「1행 성명 학생01」, 「1행 서답형(0.0) 편집창」, 「1행 체크박스 행선택 체크박스」의 규칙으로 재구성했습니다. 이름과 점수는 가상의 값입니다. 선택형 열의 칸 이름이 옆 열 이름인 「서답형」으로 잘못 합성된 실측 결함을 그대로 재현합니다. 현재 버전의 이 표는 표 이름(aria-label)이 없습니다.',
    gridName: { current: '', improved: '정기시험 점수 입력' },
    checkboxHeader: '체크박스',
    columns: [
      { key: 'sel', header: '선택', type: 'checkbox' },
      { key: 'no', header: '번호' },
      { key: 'name', header: '성명' },
      { key: 'choice', header: '선택형(60.0)', type: 'edit', currentHeader: '서답형(40.0)' },
      { key: 'essay', header: '서답형(40.0)', type: 'edit' },
      { key: 'sum', header: '합계(100.0)' },
    ],
    rows: [
      { no: '1', name: '김하늘', choice: '52.0', essay: '34.5', sum: '86.5' },
      { no: '2', name: '이서준', choice: '45.0', essay: '28.0', sum: '73.0' },
      { no: '3', name: '박지우', choice: '58.0', essay: '37.5', sum: '95.5' },
    ],
  },
];
