import { screens } from './data.js';
import { currentCellName, currentCheckboxName, improvedCellName, improvedCheckboxName } from './compose.js';

const SUFFIX = { link: 'link', edit: '편집창' };
const VERSION_LABEL = { current: '현재 나이스', improved: '개선안' };

const state = {
  screen: screens[0],
  version: 'current',
  focus: null,          // { r, c } 데이터 행 1부터, 열 0부터. 마지막으로 다녀간 칸
  at: null,             // 'grid' 컨테이너에 포커스 | 'cell' 칸에 포커스 | null 표 밖
  checked: new Set(),   // 선택된 데이터 행 번호
  suppressEntry: false, // 버전 전환 재포커스는 표 진입으로 치지 않는다
};

const el = {
  screenSelect: document.getElementById('screen'),
  toggle: document.getElementById('toggle'),
  status: document.getElementById('status'),
  heading: document.getElementById('grid-heading'),
  note: document.getElementById('screen-note'),
  host: document.getElementById('grid-host'),
  pName: document.getElementById('p-name'),
  pRole: document.getElementById('p-role'),
  pPos: document.getElementById('p-pos'),
  pEntry: document.getElementById('p-entry'),
  pMarkup: document.getElementById('p-markup'),
  pRow: document.getElementById('p-row'),
  speak: document.getElementById('speak'),
  autoSpeak: document.getElementById('auto-speak'),
};

// 이름 계산 -----------------------------------------------------------------

function cellName(screen, version, r, c) {
  const col = screen.columns[c];
  const rowCount = screen.rows.length;
  const value = col.type === 'checkbox' ? '' : (screen.rows[r - 1][col.key] ?? '');
  if (version === 'current') {
    if (col.type === 'checkbox') {
      return currentCheckboxName({ rowIndex: r, rowCount, header: screen.checkboxHeader });
    }
    return currentCellName({
      rowIndex: r,
      rowCount,
      isLastCol: c === screen.columns.length - 1,
      header: col.currentHeader ?? col.header,
      value,
      suffix: SUFFIX[col.type] ?? '',
    });
  }
  if (col.type === 'checkbox') return improvedCheckboxName();
  return improvedCellName({ value });
}

// 표에 들어갈 때 센스리더가 읽는 문구(2026.09.11 실측). 「false」의 출처는 확인되지 않았다.
function entryPhrase(screen, version) {
  const name = screen.gridName[version];
  const head = !name ? '그리드' : (name.endsWith('그리드') ? name : `${name} 그리드`);
  return `${head} false 시작 그리고 알트키 + 방향키로 이동이 가능합니다`;
}

function entryLabel(screen, version) {
  const basis = version === 'current' ? '센스리더 실측' : '예상, false의 출처는 미확인';
  return `표에 들어갈 때 (${basis}): 「${entryPhrase(screen, version)}」`;
}

// 렌더 -----------------------------------------------------------------------

function render() {
  const { screen, version } = state;
  el.heading.textContent = `${screen.title}, ${VERSION_LABEL[version]}`;
  el.note.textContent = `${screen.menu}. ${screen.note}`;
  el.toggle.textContent = version === 'current' ? '개선안으로 전환' : '현재 나이스로 전환';

  const grid = document.createElement('div');
  grid.setAttribute('role', 'grid');
  grid.setAttribute('aria-rowcount', String(screen.rows.length + 1));
  grid.setAttribute('aria-colcount', String(screen.columns.length));
  const name = screen.gridName[version];
  if (name) grid.setAttribute('aria-label', name);
  grid.style.minWidth = `${screen.columns.length * 7}em`;
  grid.dataset.version = version;
  // 나이스와 같이 Tab은 표 컨테이너에 먼저 앉고, 방향키로 칸에 들어간다. 칸은 Tab 순서에 들지 않는다.
  grid.tabIndex = 0;

  const head = document.createElement('div');
  head.setAttribute('role', 'row');
  head.setAttribute('aria-rowindex', '1');
  screen.columns.forEach((col, c) => {
    const h = document.createElement('div');
    h.setAttribute('role', 'columnheader');
    h.textContent = col.header;
    if (version === 'current') h.setAttribute('aria-label', col.header);
    else h.setAttribute('aria-colindex', String(c + 1));
    if (col.type === 'checkbox') h.classList.add('col-checkbox');
    head.appendChild(h);
  });
  grid.appendChild(head);

  screen.rows.forEach((row, i) => {
    const r = i + 1;
    const tr = document.createElement('div');
    tr.setAttribute('role', 'row');
    tr.setAttribute('aria-rowindex', String(r + 1));
    if (state.checked.has(r)) tr.setAttribute('aria-selected', 'true');
    screen.columns.forEach((col, c) => {
      const td = document.createElement('div');
      td.setAttribute('role', 'gridcell');
      td.dataset.r = String(r);
      td.dataset.c = String(c);
      if (version === 'improved') td.setAttribute('aria-colindex', String(c + 1));
      const nameText = cellName(screen, version, r, c);
      if (col.type === 'checkbox') {
        td.classList.add('col-checkbox');
        const cb = document.createElement('span');
        cb.className = 'cb';
        cb.setAttribute('role', 'checkbox');
        cb.setAttribute('aria-checked', state.checked.has(r) ? 'true' : 'false');
        cb.setAttribute('aria-label', nameText);
        cb.tabIndex = -1;
        cb.dataset.r = String(r);
        cb.dataset.c = String(c);
        td.appendChild(cb);
      } else {
        td.tabIndex = -1;
        const value = row[col.key] ?? '';
        if (version === 'current') {
          td.setAttribute('aria-label', nameText);
          td.textContent = value;
        } else if (col.type === 'link') {
          const a = document.createElement('a');
          a.href = '#';
          a.tabIndex = -1;
          a.textContent = value;
          a.addEventListener('click', (e) => e.preventDefault());
          td.appendChild(a);
        } else {
          td.textContent = value;
        }
      }
      tr.appendChild(td);
    });
    grid.appendChild(tr);
  });

  grid.addEventListener('keydown', onGridKeydown);
  grid.addEventListener('focusin', onGridFocusin);
  grid.addEventListener('focusout', onGridFocusout);
  grid.addEventListener('click', onGridClick);

  el.host.replaceChildren(grid);
}

function focusTarget(r, c) {
  const grid = el.host.firstElementChild;
  const cell = grid.querySelector(`[role="gridcell"][data-r="${r}"][data-c="${c}"]`);
  if (!cell) return null;
  return cell.querySelector('[role="checkbox"]') ?? cell;
}

function moveFocus(r, c) {
  const { screen } = state;
  const rr = Math.min(Math.max(r, 1), screen.rows.length);
  const cc = Math.min(Math.max(c, 0), screen.columns.length - 1);
  focusTarget(rr, cc)?.focus();
}

// 이벤트 ---------------------------------------------------------------------

function onGridKeydown(e) {
  if (e.target === e.currentTarget) {
    // 표 컨테이너에서: 방향키로 마지막에 다녀간 칸(처음이면 첫 행 첫 칸)에 들어간다
    if (['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      const f = state.focus ?? { r: 1, c: 0 };
      moveFocus(f.r, f.c);
    } else if ((e.key === 'v' || e.key === 'V') && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault(); toggleVersion();
    } else if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.altKey && !e.metaKey) {
      e.preventDefault(); speak();
    }
    return;
  }
  const t = e.target.closest('[data-r]');
  if (!t) return;
  const r = Number(t.dataset.r);
  const c = Number(t.dataset.c);
  const cols = state.screen.columns.length;
  const rows = state.screen.rows.length;
  switch (e.key) {
    case 'ArrowRight': e.preventDefault(); moveFocus(r, c + 1); break;
    case 'ArrowLeft': e.preventDefault(); moveFocus(r, c - 1); break;
    case 'ArrowDown': e.preventDefault(); moveFocus(r + 1, c); break;
    case 'ArrowUp': e.preventDefault(); moveFocus(r - 1, c); break;
    case 'Home': e.preventDefault(); moveFocus(e.ctrlKey ? 1 : r, 0); break;
    case 'End': e.preventDefault(); moveFocus(e.ctrlKey ? rows : r, cols - 1); break;
    case ' ':
      if (t.getAttribute('role') === 'checkbox') { e.preventDefault(); toggleChecked(r); }
      break;
    case 'v':
    case 'V':
      if (!e.ctrlKey && !e.altKey && !e.metaKey) { e.preventDefault(); toggleVersion(); }
      break;
    case 'r':
    case 'R':
      if (!e.ctrlKey && !e.altKey && !e.metaKey) { e.preventDefault(); speak(); }
      break;
    default:
  }
}

function onGridClick(e) {
  const t = e.target.closest('[data-r]');
  if (!t) return;
  const r = Number(t.dataset.r);
  const c = Number(t.dataset.c);
  if (t.getAttribute('role') === 'checkbox') toggleChecked(r);
  moveFocus(r, c);
}

function onGridFocusin(e) {
  const grid = e.currentTarget;
  const entering = !state.suppressEntry && !(e.relatedTarget && grid.contains(e.relatedTarget));
  state.suppressEntry = false;
  if (e.target === grid) {
    state.at = 'grid';
    updatePanel();
    if (el.autoSpeak.checked && entering) speak();
    return;
  }
  const t = e.target.closest('[data-r]');
  if (!t) return;
  // 칸에 들어오면 컨테이너는 Tab 순서에서 빠져, 칸에서 Shift+Tab을 누르면 나이스처럼 표 밖 이전 컨트롤로 나간다
  grid.tabIndex = -1;
  state.at = 'cell';
  state.focus = { r: Number(t.dataset.r), c: Number(t.dataset.c) };
  updatePanel();
  if (el.autoSpeak.checked) speak(entering);
}

function onGridFocusout(e) {
  const grid = e.currentTarget;
  if (e.relatedTarget && grid.contains(e.relatedTarget)) return;
  grid.tabIndex = 0;
  state.at = null;
}

function toggleChecked(r) {
  if (state.checked.has(r)) state.checked.delete(r); else state.checked.add(r);
  const grid = el.host.firstElementChild;
  const row = grid.querySelector(`[role="row"][aria-rowindex="${r + 1}"]`);
  const cb = row.querySelector('[role="checkbox"]');
  const on = state.checked.has(r);
  cb.setAttribute('aria-checked', on ? 'true' : 'false');
  if (on) row.setAttribute('aria-selected', 'true'); else row.removeAttribute('aria-selected');
  updatePanel();
}

function toggleVersion() {
  state.version = state.version === 'current' ? 'improved' : 'current';
  const at = state.at;
  render();
  el.status.textContent = `${VERSION_LABEL[state.version]} 버전`;
  if (at === 'cell' && state.focus) {
    state.suppressEntry = true;
    focusTarget(state.focus.r, state.focus.c)?.focus();
  } else if (at === 'grid') {
    state.suppressEntry = true;
    el.host.firstElementChild.focus();
  }
}

el.toggle.addEventListener('click', toggleVersion);

el.screenSelect.addEventListener('change', () => {
  state.screen = screens.find((s) => s.id === el.screenSelect.value);
  state.focus = null;
  state.checked = new Set();
  render();
  clearPanel();
  el.status.textContent = `${state.screen.title} 표`;
});

// 낭독 패널 -----------------------------------------------------------------

function focusedInfo() {
  if (!state.focus) return null;
  const { r, c } = state.focus;
  const { screen, version } = state;
  const col = screen.columns[c];
  const node = focusTarget(r, c);
  if (!node) return null;
  const isCb = col.type === 'checkbox';
  const name = isCb ? node.getAttribute('aria-label') : (node.getAttribute('aria-label') ?? node.textContent);
  const checked = isCb && node.getAttribute('aria-checked') === 'true';
  return { r, c, col, node, isCb, name, checked, version, screen };
}

function updatePanel() {
  if (state.at === 'grid') { gridPanel(); return; }
  const info = focusedInfo();
  if (!info) { clearPanel(); return; }
  const { r, c, col, node, isCb, name, checked, version, screen } = info;
  el.pName.textContent = `이름: ${name === '' ? '(빈 문자열)' : name}`;
  el.pRole.textContent = isCb
    ? `역할과 상태: 체크상자, ${checked ? '선택' : '해제'} (aria-checked="${checked}")`
    : '역할: 표 칸 (gridcell)';
  const colindex = version === 'improved' ? `aria-colindex ${c + 1}` : 'aria-colindex 없음';
  const gridName = screen.gridName[version] ? `표 이름 「${screen.gridName[version]}」` : '표 이름 없음';
  el.pPos.textContent = `표준 속성: aria-rowindex ${r + 1} (전체 ${screen.rows.length + 1}행), ${colindex} (전체 ${screen.columns.length}열), 열 머리글 「${col.header}」, ${gridName}`;
  el.pEntry.textContent = entryLabel(screen, version);
  el.pMarkup.textContent = markupOf(node);
  const items = screen.columns.map((_, cc) => {
    const li = document.createElement('li');
    const n = cellName(screen, version, r, cc);
    li.textContent = n === '' ? '(빈 문자열)' : n;
    if (cc === c) li.setAttribute('aria-current', 'true');
    return li;
  });
  el.pRow.replaceChildren(...items);
}

function markupOf(node) {
  const cell = node.closest('[role="gridcell"]');
  const clone = cell.cloneNode(true);
  clone.querySelectorAll('[data-r]').forEach((n) => { delete n.dataset.r; delete n.dataset.c; n.removeAttribute('tabindex'); });
  delete clone.dataset.r; delete clone.dataset.c; clone.removeAttribute('tabindex');
  const html = clone.outerHTML;
  if (!html.includes('><')) return html;
  return html.replace(/></g, '>\n  <').replace(/\n  <\/div>$/, '\n</div>');
}

function gridPanel() {
  const { screen, version } = state;
  const grid = el.host.firstElementChild;
  const name = screen.gridName[version];
  el.pName.textContent = `이름: ${name || '(표 이름 없음)'}`;
  el.pRole.textContent = '역할: 표 (grid). Tab으로 들어와 컨테이너에 포커스가 있는 상태';
  el.pPos.textContent = `표준 속성: aria-rowcount ${screen.rows.length + 1}, aria-colcount ${screen.columns.length}`;
  el.pEntry.textContent = entryLabel(screen, version);
  el.pMarkup.textContent = grid.outerHTML.slice(0, grid.outerHTML.indexOf('>') + 1).replace(/ style="[^"]*"/, '').replace(/ data-version="[^"]*"/, '');
  el.pRow.replaceChildren();
}

function clearPanel() {
  el.pName.textContent = '이름: 표 안의 칸으로 이동하면 표시됩니다.';
  el.pRole.textContent = '';
  el.pPos.textContent = '';
  el.pEntry.textContent = entryLabel(state.screen, state.version);
  el.pMarkup.textContent = '';
  el.pRow.replaceChildren();
}

function speechText() {
  if (state.at === 'grid') return entryPhrase(state.screen, state.version);
  const info = focusedInfo();
  if (!info) return '';
  if (info.isCb) return `${info.checked ? '선택' : '해제'} ${info.name} 체크상자`;
  return info.name === '' ? '빈 칸' : info.name;
}

function speak(withEntry = false) {
  if (!('speechSynthesis' in window)) { el.status.textContent = '이 브라우저는 음성 합성을 지원하지 않습니다.'; return; }
  const text = speechText();
  if (!text) return;
  window.speechSynthesis.cancel();
  const voice = window.speechSynthesis.getVoices().find((v) => v.lang.startsWith('ko'));
  const parts = withEntry ? [entryPhrase(state.screen, state.version), text] : [text];
  parts.forEach((p) => {
    const u = new SpeechSynthesisUtterance(p);
    u.lang = 'ko-KR';
    if (voice) u.voice = voice;
    window.speechSynthesis.speak(u);
  });
}

el.speak.addEventListener('click', () => speak(false));

// 시작 -----------------------------------------------------------------------

screens.forEach((s) => {
  const o = document.createElement('option');
  o.value = s.id;
  o.textContent = s.title;
  el.screenSelect.appendChild(o);
});
render();
clearPanel();
