/**
 * DC 6084 — Excel Import Module
 *
 * Roster:   Separate upload, saved to localStorage. Persists until replaced.
 * FPA/LPA:  FPAOF (Orderfillers) + FPALD (Lift Drivers), loaded per session.
 */

/* Check if SheetJS loaded */
if (typeof XLSX === 'undefined') {
  console.warn('SheetJS (XLSX) not loaded. File import will prompt for CSV paste instead.');
}

const STORAGE_KEY_ROSTER = 'dc6084_roster';
const STORAGE_KEY_ROSTER_DATE = 'dc6084_roster_date';

/* ============================================================
   Column Mappings
   ============================================================ */

const ROSTER_COL_MAP = {
  'user id':      'userId',    'userid':      'userId',    'id':          'userId',
  'name':         'name',      'associate':   'name',      'full name':   'name',
  'first name':   'firstName', 'firstname':   'firstName', 'first':       'firstName',
  'last name':    'lastName',  'lastname':    'lastName',  'last':        'lastName',
  'area':         'area',      'dept':        'area',      'department':  'area',
  'shift':        'shift',
  'role':         'role',      'job':         'role',      'job title':   'role',
};

const FPA_COL_MAP = {
  'user id':     'userId',  'userid':     'userId', 'id':         'userId',
  'date':        'date',
  'fpa':         'fpaMinutes', 'fpa minutes':'fpaMinutes', 'fpa mins':'fpaMinutes', 'fpa min':'fpaMinutes',
  'lpa':         'lpaMinutes', 'lpa minutes':'lpaMinutes', 'lpa mins':'lpaMinutes', 'lpa min':'lpaMinutes',
};

/* ============================================================
   Helpers
   ============================================================ */

function mapHeaders(rawHeaders, colMap) {
  return rawHeaders.map(h => colMap[String(h).trim().toLowerCase()] || null);
}

function rowToObject(row, mappedHeaders) {
  const obj = {};
  mappedHeaders.forEach((field, i) => {
    if (field && i < row.length) obj[field] = row[i] != null ? String(row[i]).trim() : '';
  });
  return obj;
}

function normalizeArea(raw) {
  if (!raw) return raw;
  return String(raw).trim();
}

function normalizeShift(raw) {
  if (!raw) return raw;
  const num = String(raw).replace(/\D/g, '');
  return { '1':'1st', '2':'2nd', '4':'4th', '5':'5th' }[num] || raw;
}

function normalizeDate(raw) {
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const d = new Date(raw);
  return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : raw;
}

function readFileAsArray(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(new Uint8Array(e.target.result));
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}

function getFirstSheetRows(data) {
  if (typeof XLSX === 'undefined') {
    throw new Error('SheetJS library not loaded. The CDN may be blocked. Try refreshing or contact IT.');
  }
  const wb = XLSX.read(data, { type: 'array', cellDates: true });
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
}

/* ============================================================
   Parsers
   ============================================================ */

function parseRoster(rows) {
  if (rows.length < 2) return [];
  const mapped = mapHeaders(rows[0], ROSTER_COL_MAP);
  return rows.slice(1)
    .filter(r => r.length > 0 && r.some(c => c != null && c !== ''))
    .map(r => {
      const obj = rowToObject(r, mapped);
      obj.userId = String(obj.userId || '').trim();

      // Support both "Name" (single col) and "First Name" + "Last Name" (two cols)
      const first = String(obj.firstName || '').trim();
      const last  = String(obj.lastName  || '').trim();
      const full  = String(obj.name      || '').trim();

      if (first || last) {
        obj.name = `${first} ${last}`.trim();
      } else {
        obj.name = full;
      }

      // Store split names directly so we never have to re-split
      if (first) {
        obj.firstName = first;
        obj.lastName  = last;
      } else if (full) {
        const parts   = full.split(/\s+/);
        obj.firstName = parts[0] || '';
        obj.lastName  = parts.slice(1).join(' ') || '';
      } else {
        obj.firstName = '';
        obj.lastName  = '';
      }

      obj.area  = normalizeArea(obj.area || '');
      obj.shift = normalizeShift(obj.shift || '');
      obj.role  = String(obj.role || '').trim();
      return obj;
    })
    .filter(o => o.userId);
}

function parseFpaLpa(rows, role) {
  if (rows.length < 2) return [];
  const mapped = mapHeaders(rows[0], FPA_COL_MAP);
  return rows.slice(1)
    .filter(r => r.length > 0 && r.some(c => c != null && c !== ''))
    .map(r => {
      const obj = rowToObject(r, mapped);
      obj.userId     = String(obj.userId || '').trim();
      obj.date       = normalizeDate(obj.date || '');
      obj.fpaMinutes = parseInt(obj.fpaMinutes, 10) || 0;
      obj.lpaMinutes = parseInt(obj.lpaMinutes, 10) || 0;
      obj.role       = role;
      return obj;
    })
    .filter(o => o.userId);
}

/* ============================================================
   Roster — Upload & Persist to localStorage
   ============================================================ */

function saveRosterToStorage(rosterArray) {
  try {
    localStorage.setItem(STORAGE_KEY_ROSTER, JSON.stringify(rosterArray));
    localStorage.setItem(STORAGE_KEY_ROSTER_DATE, new Date().toLocaleString());
  } catch (e) {
    console.warn('Could not save roster to localStorage:', e);
  }
}

function loadRosterFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ROSTER);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Only use saved roster if entries actually have names
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].name) {
        ASSOCIATE_ROSTER.length = 0;
        parsed.forEach(r => ASSOCIATE_ROSTER.push(r));
        console.log('Loaded roster from localStorage:', parsed.length, 'associates');
        console.log('Sample entry:', parsed[0]);
        return true;
      } else {
        // Bad data in storage — clear it
        console.warn('Clearing bad roster from localStorage');
        localStorage.removeItem(STORAGE_KEY_ROSTER);
        localStorage.removeItem(STORAGE_KEY_ROSTER_DATE);
      }
    }
  } catch (e) {
    console.warn('Could not load roster from localStorage:', e);
    localStorage.removeItem(STORAGE_KEY_ROSTER);
    localStorage.removeItem(STORAGE_KEY_ROSTER_DATE);
  }
  return false;
}

function getRosterStatusText() {
  const date = localStorage.getItem(STORAGE_KEY_ROSTER_DATE);
  if (date) {
    return `\u2705 Roster loaded (uploaded ${date}) \u2014 ${ASSOCIATE_ROSTER.length} associates`;
  }
  return '\u26a0\ufe0f Using sample roster. Upload a real roster to get started.';
}

function updateRosterStatus() {
  const el = document.getElementById('roster-status');
  const date = localStorage.getItem(STORAGE_KEY_ROSTER_DATE);
  el.innerHTML = getRosterStatusText();
  el.className = `roster-status ${date ? 'roster-ok' : 'roster-warn'}`;
}

async function handleRosterUpload(file) {
  try {
    const data = await readFileAsArray(file);
    const rows = getFirstSheetRows(data);
    const parsed = parseRoster(rows);

    if (parsed.length === 0) {
      showImportStatus('\u274c Roster: no valid rows found. Check column headers.', false);
      return;
    }

    ASSOCIATE_ROSTER.length = 0;
    parsed.forEach(r => ASSOCIATE_ROSTER.push(r));
    saveRosterToStorage(parsed);
    updateRosterStatus();
    populateFilters();
    showImportStatus(`\u2705 Roster saved! ${parsed.length} associates loaded. This will persist until you upload a new one.`, true);
    renderAll();
  } catch (err) {
    showImportStatus(`\u274c Roster upload failed: ${err.message}`, false);
  }
}

/* ============================================================
   FPA/LPA — Load FPAOF + FPALD
   ============================================================ */

async function runImport() {
  const fpaofInput = document.getElementById('file-fpaof');
  const fpaldInput = document.getElementById('file-fpald');
  const msgs = [];
  let ok = false;
  const fpaRecords = [];

  try {
    if (fpaofInput.files.length > 0) {
      const data = await readFileAsArray(fpaofInput.files[0]);
      const parsed = parseFpaLpa(getFirstSheetRows(data), 'Orderfiller');
      fpaRecords.push(...parsed);
      msgs.push(`\u2705 FPAOF: ${parsed.length} orderfiller records loaded`);
      ok = true;
    }

    if (fpaldInput.files.length > 0) {
      const data = await readFileAsArray(fpaldInput.files[0]);
      const parsed = parseFpaLpa(getFirstSheetRows(data), 'Lift Driver');
      fpaRecords.push(...parsed);
      msgs.push(`\u2705 FPALD: ${parsed.length} lift driver records loaded`);
      ok = true;
    }

    if (fpaRecords.length > 0) {
      FPA_LPA_DATA.length = 0;
      fpaRecords.forEach(r => FPA_LPA_DATA.push(r));

      // Check roster matching
      const rosterIds = new Set(ASSOCIATE_ROSTER.map(r => String(r.userId).trim().toUpperCase()));
      const matchedIds = fpaRecords.filter(r => rosterIds.has(String(r.userId).trim().toUpperCase()));
      const unmatchedIds = [...new Set(
        fpaRecords
          .filter(r => !rosterIds.has(String(r.userId).trim().toUpperCase()))
          .map(r => r.userId)
      )];

      msgs.push(`\ud83d\udd17 ${matchedIds.length} of ${fpaRecords.length} records matched to roster (names, area, shift, role populated)`);

      if (unmatchedIds.length > 0) {
        msgs.push(`\u26a0\ufe0f ${unmatchedIds.length} User ID(s) not in Roster: ${unmatchedIds.slice(0, 5).join(', ')}${unmatchedIds.length > 5 ? '...' : ''}`);
      }
    }

    if (msgs.length === 0) msgs.push('\u26a0\ufe0f No files selected.');
    showImportStatus(msgs.join('<br>'), ok);
    if (ok) renderAll();

  } catch (err) {
    showImportStatus(`\u274c Import failed: ${err.message}`, false);
  }
}

/* ============================================================
   UI Helpers
   ============================================================ */

function showImportStatus(html, success) {
  const el = document.getElementById('import-status');
  el.innerHTML = html;
  el.className = `import-status ${success ? 'import-ok' : 'import-err'}`;
  el.style.display = 'block';
  setTimeout(() => { el.style.display = 'none'; }, 8000);
}

function openImportModal() {
  document.getElementById('import-modal').setAttribute('aria-hidden', 'false');
  document.getElementById('import-modal-overlay').style.display = 'block';
  document.getElementById('file-fpaof').value = '';
  document.getElementById('file-fpald').value = '';
}

function closeImportModal() {
  document.getElementById('import-modal').setAttribute('aria-hidden', 'true');
  document.getElementById('import-modal-overlay').style.display = 'none';
}

/* ============================================================
   Init
   ============================================================ */

function initImportUI() {
  // Load saved roster from localStorage on startup
  loadRosterFromStorage();
  updateRosterStatus();
  populateFilters();

  // Clear roster button
  document.getElementById('btn-clear-roster').addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY_ROSTER);
    localStorage.removeItem(STORAGE_KEY_ROSTER_DATE);
    ASSOCIATE_ROSTER.length = 0;
    SAMPLE_ROSTER.forEach(r => ASSOCIATE_ROSTER.push(r));
    updateRosterStatus();
    populateFilters();
    showImportStatus('\u2705 Reset to sample roster. Upload a real roster when ready.', true);
    renderAll();
  });

  // Roster upload button
  const rosterBtn   = document.getElementById('btn-upload-roster');
  const rosterInput = document.getElementById('file-roster');

  rosterBtn.addEventListener('click', () => rosterInput.click());
  rosterInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) handleRosterUpload(e.target.files[0]);
    e.target.value = '';
  });

  // FPA/LPA modal
  document.getElementById('btn-open-import').addEventListener('click', openImportModal);
  document.getElementById('btn-close-modal').addEventListener('click', closeImportModal);
  document.getElementById('btn-run-import').addEventListener('click', async () => {
    await runImport();
    closeImportModal();
  });

  document.getElementById('import-modal-overlay').addEventListener('click', closeImportModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeImportModal(); });
}
