// 나이스 그리드 셀 이름(aria-label) 합성 규칙.
// 2026년 7월 14일과 9월 11일 교육용 서버(edu.neis.go.kr) DOM 실측 문자열을 재현한다.
// 예: "1행 순번 1", "1행 마지막 열 비고 퇴직", "50행 마지막 열 마지막 행 비고",
//     "1행 신청기간 2026.09.07 ~ 2026.09.11 link", "1행 서답형(0.0) 편집창"

export function currentCellName({ rowIndex, rowCount, isLastCol, header, value = '', suffix = '' }) {
  const parts = [`${rowIndex}행`];
  if (isLastCol) parts.push('마지막 열');
  if (rowIndex === rowCount) parts.push('마지막 행');
  parts.push(header);
  if (value !== '') parts.push(value);
  if (suffix) parts.push(suffix);
  return parts.join(' ');
}

// 행선택 체크박스. 열 이름 자리는 비어 있어도 공백을 남긴다.
// 실측: 결재자지정 "1행  행선택 체크박스"(공백 두 칸), 유연근무 "1행 선택 행선택 체크박스",
//       성적 "1행 체크박스 행선택 체크박스", 마지막 행 "2행 마지막 행 선택 행선택 체크박스"
export function currentCheckboxName({ rowIndex, rowCount, header }) {
  const parts = [`${rowIndex}행`];
  if (rowIndex === rowCount) parts.push('마지막 행');
  parts.push(header);
  parts.push('행선택 체크박스');
  return parts.join(' ');
}

// 개선안: 이름은 값 그 자체. 좌표는 aria-rowindex와 aria-colindex, 열 이름은 columnheader, 위젯 종류는 role이 맡는다.
export function improvedCellName({ value = '' }) {
  return value;
}

export function improvedCheckboxName() {
  return '행선택';
}
