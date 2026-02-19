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
  dateBadge:           () => document.querySelector('.date-badge'),
  cardTotal:           () => document.getElementById('card-total'),
  cardFpaAbove:        () => document.getElementById('card-fpa-above'),
  cardFpaOff:           () => document.getElementById('card-fpa-off'),
  cardLpaAbove:        () => document.getElementById('card-lpa-above'),
  cardLpaOff:           () => document.getElementById('card-lpa-off'),
  cardBothAbove:       () => document.getElementById('card-both-above'),
  areaBreakdownBody:   () => document.getElementById('area-breakdown-tbody'),
  scorecardsContainer: () => document.getElementById('scorecards-container'),
  fpaLpaTableBody:     () => document.getElementById('fpa-lpa-tbody'),
  rosterTableBody:     () => document.getElementById('roster-tbody'),
  rosterCount:         () => document.getElementById('roster-count'),
  // Building Goal elements
  buildingFpaPct:      () => document.getElementById('building-fpa-pct'),
  buildingFpaCount:    () => document.getElementById('building-fpa-count'),
  buildingLpaPct:      () => document.getElementById('building-lpa-pct'),
  buildingLpaCount:    () => document.getElementById('building-lpa-count'),
  buildingBothPct:     () => document.getElementById('building-both-pct'),
  buildingBothCount:   () => document.getElementById('building-both-count'),
  buildingHoursLost:   () => document.getElementById('building-hours-lost'),
  hoursLostFpa:        () => document.getElementById('hours-lost-fpa'),
  hoursLostLpa:        () => document.getElementById('hours-lost-lpa'),
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
 * Records with no roster match are silently skipped.
 */
function getEnrichedData() {
  const rosterMap = buildRosterMap();

  const enriched = FPA_LPA_DATA
    .filter(d => rosterMap.has(normalizeId(d.userId)))
    .map(d => {
      const match = rosterMap.get(normalizeId(d.userId));

      // Pull first/last name from roster — support both split and combined
      let firstName = '';
      let lastName  = '';
      if (match.firstName) {
        firstName = match.firstName;
        lastName  = match.lastName || '';
      } else if (match.name) {
        const parts = String(match.name).trim().split(/\s+/);
        firstName = parts[0] || '';
        lastName  = parts.slice(1).join(' ') || '';
      }

      return {
        userId:     d.userId,
        date:       d.date        || '',
        fpaMinutes: d.fpaMinutes  || 0,
        lpaMinutes: d.lpaMinutes  || 0,
        firstName,
        lastName,
        area:       match.area  || '',
        shift:      match.shift || '',
        // Use the role from the FPA/LPA import (determined by file: FPAOF=Orderfiller, FPALD=Lift Driver)
        // This ensures score card bottom-5 tables work regardless of roster role naming
        role:       d.role || match.role || '',
      };
    });

  // Log for debugging — open DevTools (F12) to verify
  const skipped = FPA_LPA_DATA.length - enriched.length;
  console.log(`Enrichment: ${enriched.length} matched, ${skipped} skipped (no roster match) out of ${FPA_LPA_DATA.length} records`);
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

/**
 * Check if FPA minutes pass the goal for a given area.
 * Uses area-specific goals: Dry=14, FDD=15, MP=14
 */
function fpaPasses(min, area) { return min <= getFpaGoal(area); }
function lpaPasses(min) { return min <= GOALS.LPA_MINUTES; }

function badge(passes) {
  const cls  = passes ? 'badge--pass' : 'badge--fail';
  const text = passes ? 'On Goal' : 'Off Goal';
  return `<span class="badge ${cls}" aria-label="${text}">${text}</span>`;
}

/** Sort order for shifts — 1st, 2nd, 4th, 5th */
function shiftSortKey(shift) {
  const s = String(shift || '').replace(/\D/g, '');
  return parseInt(s, 10) || 999;
}

/** Compare two records: shift first, then area alphabetically, then role */
function compareShiftAreaRole(a, b) {
  const shiftA = shiftSortKey(a.shift);
  const shiftB = shiftSortKey(b.shift);
  if (shiftA !== shiftB) return shiftA - shiftB;
  const areaComp = String(a.area || '').localeCompare(String(b.area || ''));
  if (areaComp !== 0) return areaComp;
  return String(a.role || '').localeCompare(String(b.role || ''));
}

function emptyRow(cols, msg) {
  return `<tr><td colspan="${cols}" style="text-align:center;padding:20px;">${msg}</td></tr>`;
}

function calcStats(records) {
  const total     = records.length;
  const fpaGood   = records.filter(r => fpaPasses(r.fpaMinutes, r.area)).length;
  const lpaGood   = records.filter(r => lpaPasses(r.lpaMinutes)).length;
  const bothGood  = records.filter(r => fpaPasses(r.fpaMinutes, r.area) && lpaPasses(r.lpaMinutes)).length;
  return { total, fpaGood, lpaGood, bothGood };
}

/**
 * Update the header date badge with the report date from uploaded filenames.
 * REPORT_DATE is set in import.js when FPA/LPA files are uploaded.
 */
function updateReportDateBadge() {
  const badge = dom.dateBadge();
  if (!badge) return;

  // REPORT_DATE is set in import.js from the uploaded filename (e.g., "FPAOF_2026-02-18.xlsx")
  if (typeof REPORT_DATE !== 'undefined' && REPORT_DATE instanceof Date && !isNaN(REPORT_DATE.getTime())) {
    const formatted = REPORT_DATE.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    badge.textContent = formatted;
    console.log('Report date badge updated from filename:', formatted);
    return;
  }

  // Fallback: check if any FPA/LPA data is loaded
  if (!FPA_LPA_DATA || FPA_LPA_DATA.length === 0) {
    badge.textContent = 'No Data Loaded';
    return;
  }

  // If we have data but no REPORT_DATE, show "Date Unknown"
  badge.textContent = 'Date Unknown';
}

/* ============================================================
   Renderers
   ============================================================ */

/**
 * Check if FPA minutes pass the BUILDING goal (unified 14 min target).
 */
function fpaPassesBuilding(min) { return min <= GOALS.BUILDING.FPA_MINUTES; }
function lpaPassesBuilding(min) { return min <= GOALS.BUILDING.LPA_MINUTES; }

/**
 * Render the Building Goal section with unified targets.
 * Uses GOALS.BUILDING for building-wide goals (14 min for both FPA & LPA).
 */
function renderBuildingGoal(filtered) {
  const total = filtered.length;
  
  // Calculate against BUILDING goals (not area-specific)
  const fpaGood = filtered.filter(r => fpaPassesBuilding(r.fpaMinutes)).length;
  const lpaGood = filtered.filter(r => lpaPassesBuilding(r.lpaMinutes)).length;
  const bothGood = filtered.filter(r => fpaPassesBuilding(r.fpaMinutes) && lpaPassesBuilding(r.lpaMinutes)).length;
  
  const fpaPct = total > 0 ? Math.round((fpaGood / total) * 100) : 0;
  const lpaPct = total > 0 ? Math.round((lpaGood / total) * 100) : 0;
  const bothPct = total > 0 ? Math.round((bothGood / total) * 100) : 0;
  
  // Calculate Hours Lost (minutes over goal for all associates)
  let fpaMinutesLost = 0;
  let lpaMinutesLost = 0;
  
  filtered.forEach(r => {
    // Use AREA-SPECIFIC goals for calculating time lost
    const fpaGoal = getFpaGoal(r.area);
    const lpaGoal = GOALS.LPA_MINUTES;
    
    if (r.fpaMinutes > fpaGoal) {
      fpaMinutesLost += (r.fpaMinutes - fpaGoal);
    }
    if (r.lpaMinutes > lpaGoal) {
      lpaMinutesLost += (r.lpaMinutes - lpaGoal);
    }
  });
  
  const totalMinutesLost = fpaMinutesLost + lpaMinutesLost;
  const hoursLost = (totalMinutesLost / 60).toFixed(1);
  
  // Update DOM
  const fpaEl = dom.buildingFpaPct();
  const lpaEl = dom.buildingLpaPct();
  const bothEl = dom.buildingBothPct();
  
  if (fpaEl) {
    fpaEl.textContent = `${fpaPct}%`;
    fpaEl.className = `building-big-number ${getStatusClass(fpaPct)}`;
  }
  if (dom.buildingFpaCount()) {
    dom.buildingFpaCount().textContent = `${fpaGood} / ${total}`;
  }
  
  if (lpaEl) {
    lpaEl.textContent = `${lpaPct}%`;
    lpaEl.className = `building-big-number ${getStatusClass(lpaPct)}`;
  }
  if (dom.buildingLpaCount()) {
    dom.buildingLpaCount().textContent = `${lpaGood} / ${total}`;
  }
  
  if (bothEl) {
    bothEl.textContent = `${bothPct}%`;
    bothEl.className = `building-big-number ${getStatusClass(bothPct)}`;
  }
  if (dom.buildingBothCount()) {
    dom.buildingBothCount().textContent = `${bothGood} / ${total}`;
  }
  
  // Update Hours Lost
  if (dom.buildingHoursLost()) {
    dom.buildingHoursLost().textContent = hoursLost;
    // Color code based on hours lost
    const hoursNum = parseFloat(hoursLost);
    let hoursClass = 'status-great';
    if (hoursNum > 2) hoursClass = 'status-poor';
    else if (hoursNum > 0.5) hoursClass = 'status-good';
    dom.buildingHoursLost().className = `building-big-number ${hoursClass}`;
  }
  if (dom.hoursLostFpa()) {
    dom.hoursLostFpa().textContent = `FPA: ${fpaMinutesLost} min`;
  }
  if (dom.hoursLostLpa()) {
    dom.hoursLostLpa().textContent = `LPA: ${lpaMinutesLost} min`;
  }
}

/**
 * Get CSS class based on percentage for color coding.
 */
function getStatusClass(pct) {
  if (pct >= 80) return 'status-great';
  if (pct >= 60) return 'status-good';
  return 'status-poor';
}

function renderSummaryCards(filtered) {
  const { total, fpaGood, lpaGood, bothGood } = calcStats(filtered);
  const fpaOff = total - fpaGood;
  const lpaOff = total - lpaGood;
  dom.cardTotal().textContent     = total;
  dom.cardFpaAbove().textContent  = `${fpaGood} / ${total}`;
  dom.cardFpaOff().textContent    = `${fpaOff} / ${total}`;
  dom.cardLpaAbove().textContent  = `${lpaGood} / ${total}`;
  dom.cardLpaOff().textContent    = `${lpaOff} / ${total}`;
  dom.cardBothAbove().textContent = `${bothGood} / ${total}`;
}

function renderAreaBreakdown(filtered) {
  const tbody = dom.areaBreakdownBody();

  // Group by shift + area
  const groupKey = (r) => `${r.shift}|||${r.area}`;
  const groups = new Map();
  filtered.forEach(r => {
    const key = groupKey(r);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(r);
  });

  // Sort group keys by shift → area
  const sortedKeys = [...groups.keys()].sort((a, b) => {
    const [shiftA, areaA] = a.split('|||');
    const [shiftB, areaB] = b.split('|||');
    return compareShiftAreaRole(
      { shift: shiftA, area: areaA, role: '' },
      { shift: shiftB, area: areaB, role: '' }
    );
  });

  const rows = [];
  for (const key of sortedKeys) {
    const records = groups.get(key);
    const [shift, area] = key.split('|||');
    const { total, fpaGood, lpaGood } = calcStats(records);
    const fpaPct = Math.round((fpaGood / total) * 100);
    const lpaPct = Math.round((lpaGood / total) * 100);

    rows.push(`
      <tr>
        <td><strong>${shift}</strong></td>
        <td>${area}</td>
        <td>${total}</td>
        <td>${fpaGood} / ${total}</td>
        <td><span class="badge ${fpaPct >= 80 ? 'badge--pass' : 'badge--fail'}">${fpaPct}%</span></td>
        <td>${lpaGood} / ${total}</td>
        <td><span class="badge ${lpaPct >= 80 ? 'badge--pass' : 'badge--fail'}">${lpaPct}%</span></td>
      </tr>
    `);
  }

  tbody.innerHTML = rows.length > 0 ? rows.join('') : emptyRow(7, '📂 No FPA/LPA data loaded. Click <strong>Load FPA / LPA</strong> above to import reports.');
}

/* ============================================================
   SCORE CARDS — per Area
   ============================================================ */

function buildBottom5Html(records, metric, label, role) {
  const key = metric === 'fpa' ? 'fpaMinutes' : 'lpaMinutes';
  const byRole = records.filter(r => r.role === role);
  
  // Only include associates who are OFF goal
  const offGoal = byRole.filter(r => {
    if (metric === 'fpa') {
      return !fpaPasses(r.fpaMinutes, r.area);  // Area-specific FPA goal
    } else {
      return !lpaPasses(r.lpaMinutes);  // LPA goal (14 min for all)
    }
  });
  
  // Sort by worst (highest minutes) first, take top 5
  const sorted = [...offGoal].sort((a, b) => b[key] - a[key]).slice(0, 5);

  if (sorted.length === 0) {
    return `<div class="table-container">
      <table aria-label="${label}"><caption class="table-caption">${label}</caption>
      <tbody>${emptyRow(5, '✅ All on goal!')}</tbody></table></div>`;
  }

  const rows = sorted.map((r, i) => {
    const goal = metric === 'fpa' ? getFpaGoal(r.area) : GOALS.LPA_MINUTES;
    const overBy = r[key] - goal;
    return `
      <tr class="bottom-five">
        <td>${i + 1}</td>
        <td>${r.userId}</td>
        <td>${r.firstName}</td>
        <td>${r.lastName}</td>
        <td>${r[key]} min <span class="over-goal">(+${overBy})</span></td>
      </tr>
    `;
  }).join('');

  return `
    <div class="table-container">
      <table aria-label="${label}">
        <caption class="table-caption">${label} <span class="off-goal-count">(${offGoal.length} off goal)</span></caption>
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

  // Group by shift + area dynamically from the data
  const groupKey = (r) => `${r.shift}|||${r.area}`;
  const grouped = new Map();
  filtered.forEach(r => {
    const key = groupKey(r);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(r);
  });

  // Sort groups: shift → area
  const sortedKeys = [...grouped.keys()].sort((a, b) => {
    const [shiftA, areaA] = a.split('|||');
    const [shiftB, areaB] = b.split('|||');
    return compareShiftAreaRole(
      { shift: shiftA, area: areaA, role: '' },
      { shift: shiftB, area: areaB, role: '' }
    );
  });

  let html = '';

  for (const key of sortedKeys) {
    const records = grouped.get(key);
    const [shift, area] = key.split('|||');
    if (records.length === 0) continue;

    const { total, fpaGood, lpaGood, bothGood } = calcStats(records);
    const cardId = `sc-${area}-${shift}`.replace(/[^a-zA-Z0-9]/g, '-');

      html += `
        <div class="scorecard" id="${cardId}" aria-expanded="false">
          <button class="scorecard-header" aria-controls="${cardId}-body"
                  onclick="toggleScorecard('${cardId}')">
            <span class="scorecard-title">
              <span>🏢 ${shift} Shift — ${area}</span>
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
                <div class="mini-lbl">FPA ≤ ${getFpaGoal(area)}m</div>
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

  container.innerHTML = html || '<p style="padding:16px;color:#555;">📂 No FPA/LPA data loaded. Click <strong>Load FPA / LPA</strong> above to import reports.</p>';
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

const tableSort = { col: '_shift', asc: true };

const SORT_COLUMNS = [
  { key: 'userId',     label: 'User ID',    type: 'string' },
  { key: '_firstName', label: 'First Name', type: 'string' },
  { key: '_lastName',  label: 'Last Name',  type: 'string' },
  { key: '_shift',     label: 'Shift',      type: 'string' },
  { key: '_baseArea',  label: 'Area',       type: 'string' },
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
    tbody.innerHTML = emptyRow(9, '📂 No FPA/LPA data loaded. Click <strong>Load FPA / LPA</strong> above to import reports.');
    return;
  }

  // Enrich with computed sort fields
  const enriched = filtered.map(r => {
    return {
      ...r,
      _firstName: r.firstName,
      _lastName:  r.lastName,
      _baseArea:  r.area,
      _shift:     r.shift,
      _overall:   (fpaPasses(r.fpaMinutes, r.area) && lpaPasses(r.lpaMinutes)) ? 'On Goal' : 'Off Goal',
    };
  });

  // Sort — always tie-break with shift → area → role
  const col = SORT_COLUMNS.find(c => c.key === tableSort.col);
  const sorted = [...enriched].sort((a, b) => {
    let va = a[tableSort.col], vb = b[tableSort.col];
    if (col && col.type === 'string') {
      va = String(va).toLowerCase();
      vb = String(vb).toLowerCase();
    }
    let result = 0;
    if (va < vb) result = -1;
    else if (va > vb) result = 1;
    if (!tableSort.asc) result = -result;
    // Tiebreaker: shift → area → role
    if (result === 0) result = compareShiftAreaRole(a, b);
    return result;
  });

  tbody.innerHTML = sorted.map(r => {
    const onGoal = fpaPasses(r.fpaMinutes, r.area) && lpaPasses(r.lpaMinutes);
    return `
    <tr class="${onGoal ? '' : 'row--off-goal'}">
      <td>${r.userId}</td>
      <td>${r._firstName}</td>
      <td>${r._lastName}</td>
      <td>${r._shift}</td>
      <td>${r._baseArea}</td>
      <td>${r.role}</td>
      <td>${r.fpaMinutes} min ${badge(fpaPasses(r.fpaMinutes, r.area))}</td>
      <td>${r.lpaMinutes} min ${badge(lpaPasses(r.lpaMinutes))}</td>
      <td>${badge(onGoal)}</td>
    </tr>
  `;
  }).join('');
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

  // Sort roster: shift → area → role
  const sorted = [...filtered].sort(compareShiftAreaRole);

  if (sorted.length === 0) {
    tbody.innerHTML = emptyRow(6, 'No associates match selected filters.');
    return;
  }

  tbody.innerHTML = sorted.map(r => {
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
        <td>${r.area}</td>
        <td>${r.shift}</td>
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

  updateReportDateBadge();
  renderBuildingGoal(filtered);
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

/**
 * Dynamically populate filter dropdowns from the current roster.
 * Called on init and again after every roster upload so options
 * always reflect whatever areas/shifts/roles are in the data.
 */
function populateFilters() {
  const areaSelect  = dom.areaFilter();
  const shiftSelect = dom.shiftFilter();
  const roleSelect  = dom.roleFilter();

  // Remember current selections so we can restore them after rebuild
  const prevArea  = areaSelect.value;
  const prevShift = shiftSelect.value;
  const prevRole  = roleSelect.value;

  // Clear existing options (keep the "All" default)
  areaSelect.innerHTML  = '<option value="All">All Areas</option>';
  shiftSelect.innerHTML = '<option value="All">All Shifts</option>';
  roleSelect.innerHTML  = '<option value="All">All Roles</option>';

  // Extract unique values from the live roster
  const areas  = [...new Set(ASSOCIATE_ROSTER.map(r => String(r.area || '').trim()).filter(Boolean))].sort();
  const shifts = [...new Set(ASSOCIATE_ROSTER.map(r => String(r.shift || '').trim()).filter(Boolean))].sort();
  const roles  = [...new Set(ASSOCIATE_ROSTER.map(r => String(r.role || '').trim()).filter(Boolean))].sort();

  areas.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a; opt.textContent = a;
    areaSelect.appendChild(opt);
  });
  shifts.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s; opt.textContent = `${s} Shift`;
    shiftSelect.appendChild(opt);
  });
  roles.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r; opt.textContent = r;
    roleSelect.appendChild(opt);
  });

  // Restore previous selections if they still exist
  if (areas.includes(prevArea))   areaSelect.value  = prevArea;
  if (shifts.includes(prevShift)) shiftSelect.value = prevShift;
  if (roles.includes(prevRole))   roleSelect.value  = prevRole;
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
