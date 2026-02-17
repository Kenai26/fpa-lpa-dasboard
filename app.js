/**
 * DC 6084 — FPA / LPA Dashboard — Main Application Logic
 * Handles filtering, calculations, score cards, and DOM rendering.
 */

/* ============================================================
   DOM References
   ============================================================ */
const dom = {
  areaFilter:          () => document.getElementById('filter-area'),
  shiftFilter:         () => document.getElementById('filter-shift'),
  roleFilter:          () => document.getElementById('filter-role'),
  tabButtons:          () => document.querySelectorAll('.tab-btn'),
  tabPanels:           () => document.querySelectorAll('.tab-panel'),
  cardTotal:           () => document.getElementById('card-total'),
  cardFpaAbove:        () => document.getElementById('card-fpa-above'),
  cardLpaAbove:        () => document.getElementById('card-lpa-above'),
  cardBothAbove:       () => document.getElementById('card-both-above'),
  areaBreakdownBody:   () => document.getElementById('area-breakdown-tbody'),
  scorecardsContainer: () => document.getElementById('scorecards-container'),
  fpaLpaTableBody:     () => document.getElementById('fpa-lpa-tbody'),
  rosterTableBody:     () => document.getElementById('roster-tbody'),
  rosterCount:         () => document.getElementById('roster-count'),
};

/* ============================================================
   Helpers
   ============================================================ */

/**
 * Normalize a User ID for matching — trim whitespace, uppercase.
 * This way 'd6-1001', 'D6-1001', ' D6-1001 ' all match.
 */
function normalizeId(id) {
  return String(id || '').trim().toUpperCase();
}

/**
 * Build a lookup map from the current roster, keyed by normalized User ID.
 * Called fresh each render so it always uses the latest uploaded roster.
 */
function buildRosterMap() {
  const map = new Map();
  ASSOCIATE_ROSTER.forEach(a => map.set(normalizeId(a.userId), a));
  return map;
}

/**
 * Join FPA/LPA records with the uploaded roster by User ID.
 * All display fields (name, area, shift, role) come from the roster.
 * Unmatched IDs still appear with "Unknown" so nothing is silently dropped.
 */
function getEnrichedData() {
  const rosterMap = buildRosterMap();

  const enriched = FPA_LPA_DATA.map(d => {
    const key   = normalizeId(d.userId);
    const match = rosterMap.get(key);

    // Pull first/last name from roster — support both split and combined
    let firstName = '';
    let lastName  = '';
    if (match) {
      if (match.firstName) {
        firstName = match.firstName;
        lastName  = match.lastName || '';
      } else if (match.name) {
        const parts = String(match.name).trim().split(/\s+/);
        firstName = parts[0] || '';
        lastName  = parts.slice(1).join(' ') || '';
      }
    }

    return {
      userId:     d.userId,
      date:       d.date        || '',
      fpaMinutes: d.fpaMinutes  || 0,
      lpaMinutes: d.lpaMinutes  || 0,
      // Everything below comes from the ROSTER
      firstName,
      lastName,
      area:       match ? match.area     : 'Unknown',
      shift:      match ? match.shift    : '',
      role:       match ? match.role     : (d.role || ''),
    };
  });

  // Log for debugging — open DevTools (F12) to verify
  const matched   = enriched.filter(r => r.name !== 'Unknown').length;
  const unmatched = enriched.length - matched;
  console.log(`Enrichment: ${matched} matched, ${unmatched} unmatched out of ${enriched.length} records`);
  if (enriched.length > 0) console.log('First enriched record:', enriched[0]);

  return enriched;
}

function getFilterValues() {
  return {
    area:  dom.areaFilter().value,
    shift: dom.shiftFilter().value,
    role:  dom.roleFilter().value,
  };
}

function applyFilters(records) {
  const { area, shift, role } = getFilterValues();
  return records.filter(r =>
    (area  === 'All' || r.area  === area) &&
    (shift === 'All' || r.shift === shift) &&
    (role  === 'All' || r.role  === role)
  );
}

function fpaPasses(min) { return min <= GOALS.FPA_MINUTES; }
function lpaPasses(min) { return min <= GOALS.LPA_MINUTES; }

function badge(passes) {
  const cls  = passes ? 'badge--pass' : 'badge--fail';
  const text = passes ? 'On Goal' : 'Off Goal';
  return `<span class="badge ${cls}" aria-label="${text}">${text}</span>`;
}

/** Strip the shift suffix from area name — 'Dry 1st' → 'Dry' */
function baseArea(area) {
  return area.replace(/\s+(1st|2nd|4th|5th)$/i, '');
}

/** Extract just the number from shift — '1st' → '1' */
function shiftNum(shift) {
  return shift.replace(/\D/g, '');
}

/** Split full name into first and last — 'John Smith' → ['John', 'Smith'] */
function splitName(name) {
  if (!name) return { first: '', last: '' };
  const parts = name.trim().split(/\s+/);
  return {
    first: parts[0] || '',
    last:  parts.slice(1).join(' ') || '',
  };
}

function emptyRow(cols, msg) {
  return `<tr><td colspan="${cols}" style="text-align:center;padding:20px;">${msg}</td></tr>`;
}

function calcStats(records) {
  const total     = records.length;
  const fpaGood   = records.filter(r => fpaPasses(r.fpaMinutes)).length;
  const lpaGood   = records.filter(r => lpaPasses(r.lpaMinutes)).length;
  const bothGood  = records.filter(r => fpaPasses(r.fpaMinutes) && lpaPasses(r.lpaMinutes)).length;
  return { total, fpaGood, lpaGood, bothGood };
}

/* ============================================================
   Renderers
   ============================================================ */

function renderSummaryCards(filtered) {
  const { total, fpaGood, lpaGood, bothGood } = calcStats(filtered);
  dom.cardTotal().textContent     = total;
  dom.cardFpaAbove().textContent  = `${fpaGood} / ${total}`;
  dom.cardLpaAbove().textContent  = `${lpaGood} / ${total}`;
  dom.cardBothAbove().textContent = `${bothGood} / ${total}`;
}

function renderAreaBreakdown(filtered) {
  const tbody = dom.areaBreakdownBody();

  // Group by base area (Dry, FDD, MP), then by shift suffix (1, 2, 4, 5)
  const depts = [...new Set(AREAS.map(a => baseArea(a)))];
  const shiftSuffixes = ['1st', '2nd', '4th', '5th'];

  const rows = [];
  for (const dept of depts) {
    for (const suffix of shiftSuffixes) {
      const fullArea = `${dept} ${suffix}`;
      if (!AREAS.includes(fullArea)) continue;

      const records = filtered.filter(r => r.area === fullArea);
      if (records.length === 0) continue;

      const { total, fpaGood, lpaGood } = calcStats(records);
      const fpaPct = Math.round((fpaGood / total) * 100);
      const lpaPct = Math.round((lpaGood / total) * 100);

      rows.push(`
        <tr>
          <td><strong>${dept}</strong></td>
          <td>${shiftNum(suffix)}</td>
          <td>${total}</td>
          <td>${fpaGood} / ${total}</td>
          <td><span class="badge ${fpaPct >= 80 ? 'badge--pass' : 'badge--fail'}">${fpaPct}%</span></td>
          <td>${lpaGood} / ${total}</td>
          <td><span class="badge ${lpaPct >= 80 ? 'badge--pass' : 'badge--fail'}">${lpaPct}%</span></td>
        </tr>
      `);
    }
  }

  tbody.innerHTML = rows.length > 0 ? rows.join('') : emptyRow(7, 'No data for selected filters.');
}

/* ============================================================
   SCORE CARDS — per Area
   ============================================================ */

function buildBottom5Html(records, metric, label, role) {
  const key = metric === 'fpa' ? 'fpaMinutes' : 'lpaMinutes';
  const byRole = records.filter(r => r.role === role);
  const sorted = [...byRole].sort((a, b) => b[key] - a[key]).slice(0, 5);

  if (sorted.length === 0) {
    return `<div class="table-container">
      <table aria-label="${label}"><caption class="table-caption">${label}</caption>
      <tbody>${emptyRow(5, 'No data')}</tbody></table></div>`;
  }

  const rows = sorted.map((r, i) => {
    return `
      <tr class="bottom-five">
        <td>${i + 1}</td>
        <td>${r.userId}</td>
        <td>${r.firstName}</td>
        <td>${r.lastName}</td>
        <td>${r[key]} min</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="table-container">
      <table aria-label="${label}">
        <caption class="table-caption">${label}</caption>
        <thead><tr>
          <th scope="col">#</th>
          <th scope="col">User ID</th>
          <th scope="col">First Name</th>
          <th scope="col">Last Name</th>
          <th scope="col">${metric === 'fpa' ? 'FPA' : 'LPA'} (min)</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderScoreCards(filtered) {
  const container = dom.scorecardsContainer();

  // Group by area only — area name already encodes the shift
  const grouped = new Map();
  AREAS.forEach(a => grouped.set(a, []));
  filtered.forEach(r => {
    if (grouped.has(r.area)) grouped.get(r.area).push(r);
  });

  let html = '';

  for (const [area, records] of grouped) {
    if (records.length === 0) continue;

    const { total, fpaGood, lpaGood, bothGood } = calcStats(records);
    const cardId = `sc-${area}`.replace(/[^a-zA-Z0-9]/g, '-');

      html += `
        <div class="scorecard" id="${cardId}" aria-expanded="false">
          <button class="scorecard-header" aria-controls="${cardId}-body"
                  onclick="toggleScorecard('${cardId}')">
            <span class="scorecard-title">
              <span>🏢 ${baseArea(area)} ${shiftNum(area)}</span>
            </span>
            <span class="scorecard-stats">
              <span class="stat">👥 ${total}</span>
              <span class="stat stat-good">FPA: ${fpaGood}/${total}</span>
              <span class="stat stat-${lpaGood === total ? 'good' : 'bad'}">LPA: ${lpaGood}/${total}</span>
              <span class="stat stat-${bothGood === total ? 'good' : 'bad'}">Both: ${bothGood}/${total}</span>
            </span>
            <span class="scorecard-chevron" aria-hidden="true">▼</span>
          </button>
          <div class="scorecard-body" id="${cardId}-body">
            <div class="scorecard-mini-cards">
              <div class="mini-card mini--blue">
                <div class="mini-val">${total}</div>
                <div class="mini-lbl">Total</div>
              </div>
              <div class="mini-card mini--green">
                <div class="mini-val">${fpaGood}/${total}</div>
                <div class="mini-lbl">FPA ≤ ${GOALS.FPA_MINUTES}m</div>
              </div>
              <div class="mini-card mini--green">
                <div class="mini-val">${lpaGood}/${total}</div>
                <div class="mini-lbl">LPA ≤ ${GOALS.LPA_MINUTES}m</div>
              </div>
              <div class="mini-card mini--yellow">
                <div class="mini-val">${bothGood}/${total}</div>
                <div class="mini-lbl">Both On Goal</div>
              </div>
            </div>
            <h3 class="scorecard-subtitle">Orderfillers</h3>
            <div class="bottom5-grid">
              ${buildBottom5Html(records, 'fpa', 'Bottom 5 FPA', 'Orderfiller')}
              ${buildBottom5Html(records, 'lpa', 'Bottom 5 LPA', 'Orderfiller')}
            </div>
            <h3 class="scorecard-subtitle">Lift Drivers</h3>
            <div class="bottom5-grid">
              ${buildBottom5Html(records, 'fpa', 'Bottom 5 FPA', 'Lift Driver')}
              ${buildBottom5Html(records, 'lpa', 'Bottom 5 LPA', 'Lift Driver')}
            </div>
          </div>
        </div>
      `;
  }

  container.innerHTML = html || '<p style="padding:16px;color:#555;">No score card data for selected filters.</p>';
}

/** Toggle a scorecard open/closed */
function toggleScorecard(id) {
  const card = document.getElementById(id);
  const isOpen = card.getAttribute('aria-expanded') === 'true';
  card.setAttribute('aria-expanded', !isOpen);
}

/* ============================================================
   Full Data Table — Sortable Columns
   ============================================================ */

const tableSort = { col: 'fpaMinutes', asc: false };

const SORT_COLUMNS = [
  { key: 'userId',     label: 'User ID',    type: 'string' },
  { key: '_firstName', label: 'First Name', type: 'string' },
  { key: '_lastName',  label: 'Last Name',  type: 'string' },
  { key: '_baseArea',  label: 'Area',       type: 'string' },
  { key: '_shiftNum',  label: 'Shift',      type: 'string' },
  { key: 'role',       label: 'Role',       type: 'string' },
  { key: 'fpaMinutes', label: 'FPA',        type: 'number' },
  { key: 'lpaMinutes', label: 'LPA',        type: 'number' },
  { key: '_overall',   label: 'Overall',    type: 'string' },
];

function sortArrow(colKey) {
  if (tableSort.col !== colKey) return '';
  return tableSort.asc ? ' \u25B2' : ' \u25BC';
}

function handleSort(colKey) {
  if (tableSort.col === colKey) {
    tableSort.asc = !tableSort.asc;
  } else {
    tableSort.col = colKey;
    tableSort.asc = true;
  }
  renderAll();
}

function renderFpaLpaTable(filtered) {
  const tbody = dom.fpaLpaTableBody();
  const thead = document.getElementById('fpa-lpa-thead');

  // Render sortable headers
  thead.innerHTML = `<tr>${SORT_COLUMNS.map(c =>
    `<th scope="col" class="sortable-th" data-col="${c.key}" 
        role="button" tabindex="0" aria-label="Sort by ${c.label}">
      ${c.label}${sortArrow(c.key)}
    </th>`
  ).join('')}</tr>`;

  // Attach click + keyboard handlers
  thead.querySelectorAll('.sortable-th').forEach(th => {
    const col = th.dataset.col;
    th.addEventListener('click', () => handleSort(col));
    th.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSort(col); }
    });
  });

  if (filtered.length === 0) {
    tbody.innerHTML = emptyRow(9, 'No data for selected filters.');
    return;
  }

  // Enrich with computed sort fields
  const enriched = filtered.map(r => {
    return {
      ...r,
      _firstName: r.firstName,
      _lastName:  r.lastName,
      _baseArea:  baseArea(r.area),
      _shiftNum:  shiftNum(r.shift),
      _overall:   (fpaPasses(r.fpaMinutes) && lpaPasses(r.lpaMinutes)) ? 'On Goal' : 'Off Goal',
    };
  });

  // Sort
  const col = SORT_COLUMNS.find(c => c.key === tableSort.col);
  const sorted = [...enriched].sort((a, b) => {
    let va = a[tableSort.col], vb = b[tableSort.col];
    if (col && col.type === 'string') {
      va = String(va).toLowerCase();
      vb = String(vb).toLowerCase();
    }
    if (va < vb) return tableSort.asc ? -1 : 1;
    if (va > vb) return tableSort.asc ? 1 : -1;
    return 0;
  });

  tbody.innerHTML = sorted.map(r => `
    <tr>
      <td>${r.userId}</td>
      <td>${r._firstName}</td>
      <td>${r._lastName}</td>
      <td>${r._baseArea}</td>
      <td>${r._shiftNum}</td>
      <td>${r.role}</td>
      <td>${r.fpaMinutes} min ${badge(fpaPasses(r.fpaMinutes))}</td>
      <td>${r.lpaMinutes} min ${badge(lpaPasses(r.lpaMinutes))}</td>
      <td>${badge(fpaPasses(r.fpaMinutes) && lpaPasses(r.lpaMinutes))}</td>
    </tr>
  `).join('');
}

/* ============================================================
   Roster
   ============================================================ */

function renderRoster() {
  const { area, shift, role } = getFilterValues();
  const filtered = ASSOCIATE_ROSTER.filter(r =>
    (area  === 'All' || r.area  === area) &&
    (shift === 'All' || r.shift === shift) &&
    (role  === 'All' || r.role  === role)
  );

  const total = ASSOCIATE_ROSTER.length;
  const isFiltered = area !== 'All' || shift !== 'All' || role !== 'All';
  dom.rosterCount().innerHTML = isFiltered
    ? `${filtered.length} <span style="font-size:0.9rem;font-weight:400;">of ${total}</span>`
    : `${total}`;

  // Update filter indicator
  const indicatorEl = document.getElementById('roster-filter-indicator');
  if (indicatorEl) {
    if (isFiltered) {
      const parts = [];
      if (area  !== 'All') parts.push(`Area: ${area}`);
      if (shift !== 'All') parts.push(`Shift: ${shift}`);
      if (role  !== 'All') parts.push(`Role: ${role}`);
      indicatorEl.innerHTML = `🔍 Filtered by ${parts.join(', ')} — showing ${filtered.length} of ${total} associates`;
      indicatorEl.style.display = 'block';
    } else {
      indicatorEl.style.display = 'none';
    }
  }

  const tbody = dom.rosterTableBody();

  if (filtered.length === 0) {
    tbody.innerHTML = emptyRow(6, 'No associates match selected filters.');
    return;
  }

  tbody.innerHTML = filtered.map(r => {
    // Use firstName/lastName if set (uploaded roster), otherwise split name
    let first = r.firstName || '';
    let last  = r.lastName  || '';
    if (!first && r.name) {
      const parts = String(r.name).trim().split(/\s+/);
      first = parts[0] || '';
      last  = parts.slice(1).join(' ') || '';
    }
    return `
      <tr>
        <td>${r.userId}</td>
        <td>${first}</td>
        <td>${last}</td>
        <td>${baseArea(r.area)}</td>
        <td>${shiftNum(r.shift)}</td>
        <td>${r.role}</td>
      </tr>
    `;
  }).join('');
}

/* ============================================================
   Master Render
   ============================================================ */

function renderAll() {
  console.log('renderAll: Roster has', ASSOCIATE_ROSTER.length, 'entries. FPA/LPA has', FPA_LPA_DATA.length, 'entries.');
  if (ASSOCIATE_ROSTER.length > 0) {
    console.log('Roster[0]:', JSON.stringify(ASSOCIATE_ROSTER[0]));
  }
  const enriched = getEnrichedData();
  if (enriched.length > 0) {
    console.log('Enriched[0]:', JSON.stringify(enriched[0]));
  }
  const filtered = applyFilters(enriched);

  renderSummaryCards(filtered);
  renderAreaBreakdown(filtered);
  renderScoreCards(filtered);
  renderFpaLpaTable(filtered);
  renderRoster();
}

/* ============================================================
   Tab Switching
   ============================================================ */

function switchTab(selectedBtn) {
  dom.tabButtons().forEach(btn => {
    const isSelected = btn === selectedBtn;
    btn.setAttribute('aria-selected', isSelected);
    btn.setAttribute('tabindex', isSelected ? '0' : '-1');
  });
  dom.tabPanels().forEach(panel => {
    const isActive = panel.id === selectedBtn.getAttribute('aria-controls');
    panel.setAttribute('aria-hidden', !isActive);
  });
}

/* ============================================================
   Populate Filters
   ============================================================ */

function populateFilters() {
  const areaSelect  = dom.areaFilter();
  const shiftSelect = dom.shiftFilter();
  const roleSelect  = dom.roleFilter();

  AREAS.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a; opt.textContent = a;
    areaSelect.appendChild(opt);
  });
  SHIFTS.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = `${s} Shift`;
    shiftSelect.appendChild(opt);
  });
  ROLES.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r; opt.textContent = r;
    roleSelect.appendChild(opt);
  });
}

/* ============================================================
   Init
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  populateFilters();
  // initImportUI is in import.js which loads after SheetJS CDN
  if (typeof initImportUI === 'function') {
    initImportUI();
  } else {
    // import.js hasn't loaded yet, wait for it
    window.addEventListener('load', () => {
      if (typeof initImportUI === 'function') initImportUI();
    });
  }
  renderAll();

  dom.areaFilter().addEventListener('change', renderAll);
  dom.shiftFilter().addEventListener('change', renderAll);
  dom.roleFilter().addEventListener('change', renderAll);

  dom.tabButtons().forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn));
    btn.addEventListener('keydown', (e) => {
      const buttons = [...dom.tabButtons()];
      const idx = buttons.indexOf(btn);
      let targetIdx = -1;
      if (e.key === 'ArrowRight') targetIdx = (idx + 1) % buttons.length;
      if (e.key === 'ArrowLeft')  targetIdx = (idx - 1 + buttons.length) % buttons.length;
      if (targetIdx >= 0) {
        e.preventDefault();
        buttons[targetIdx].focus();
        switchTab(buttons[targetIdx]);
      }
    });
  });
});
