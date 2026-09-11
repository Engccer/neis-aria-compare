import test from 'node:test';
import assert from 'node:assert/strict';
import { currentCellName, currentCheckboxName, improvedCellName, improvedCheckboxName } from '../compose.js';

test('결재자지정 사용자 목록 실측 문자열(2026.09.11)', () => {
  assert.equal(currentCellName({ rowIndex: 1, rowCount: 50, isLastCol: false, header: '순번', value: '1' }), '1행 순번 1');
  assert.equal(currentCellName({ rowIndex: 1, rowCount: 50, isLastCol: false, header: '직위', value: '장학사' }), '1행 직위 장학사');
  assert.equal(currentCellName({ rowIndex: 1, rowCount: 50, isLastCol: true, header: '비고', value: '퇴직' }), '1행 마지막 열 비고 퇴직');
  assert.equal(currentCellName({ rowIndex: 50, rowCount: 50, isLastCol: false, header: '순번', value: '50' }), '50행 마지막 행 순번 50');
  assert.equal(currentCellName({ rowIndex: 50, rowCount: 50, isLastCol: true, header: '비고', value: '' }), '50행 마지막 열 마지막 행 비고');
  assert.equal(currentCheckboxName({ rowIndex: 1, rowCount: 50, header: '' }), '1행  행선택 체크박스');
});

test('유연근무 목록 실측 문자열(2026.09.11, 센스리더 전수 낭독)', () => {
  assert.equal(currentCellName({ rowIndex: 1, rowCount: 2, isLastCol: false, header: '신청기간', value: '2026.09.07 ~ 2026.09.11', suffix: 'link' }), '1행 신청기간 2026.09.07 ~ 2026.09.11 link');
  assert.equal(currentCellName({ rowIndex: 1, rowCount: 2, isLastCol: true, header: '신청구분', value: '신청' }), '1행 마지막 열 신청구분 신청');
  assert.equal(currentCellName({ rowIndex: 2, rowCount: 2, isLastCol: false, header: '신청유형', value: '시차출퇴근형' }), '2행 마지막 행 신청유형 시차출퇴근형');
  assert.equal(currentCellName({ rowIndex: 2, rowCount: 2, isLastCol: true, header: '신청구분', value: '신청' }), '2행 마지막 열 마지막 행 신청구분 신청');
  assert.equal(currentCheckboxName({ rowIndex: 1, rowCount: 2, header: '선택' }), '1행 선택 행선택 체크박스');
  assert.equal(currentCheckboxName({ rowIndex: 2, rowCount: 2, header: '선택' }), '2행 마지막 행 선택 행선택 체크박스');
});

test('정기시험성적관리 실측 문자열(2026.07.14)', () => {
  assert.equal(currentCellName({ rowIndex: 1, rowCount: 3, isLastCol: false, header: '성명', value: '학생01' }), '1행 성명 학생01');
  assert.equal(currentCellName({ rowIndex: 1, rowCount: 3, isLastCol: false, header: '서답형(0.0)', value: '', suffix: '편집창' }), '1행 서답형(0.0) 편집창');
  assert.equal(currentCheckboxName({ rowIndex: 1, rowCount: 3, header: '체크박스' }), '1행 체크박스 행선택 체크박스');
});

test('개선안은 값만 남긴다', () => {
  assert.equal(improvedCellName({ value: '장학사' }), '장학사');
  assert.equal(improvedCellName({ value: '' }), '');
  assert.equal(improvedCheckboxName(), '행선택');
});
