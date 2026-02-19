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

// Store the report date extracted from uploaded filenames
let REPORT_DATE = null;

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
  'user id':      'userId',  'userid':      'userId',  'id':           'userId',
  'user_id':      'userId',  'associate id': 'userId',  'emp id':       'userId',
  'date':         'date',    'report date':  'date',    'shift date':   'date',
  'fpa':          'fpaMinutes', 'fpa minutes':  'fpaMinutes', 'fpa mins':  'fpaMinutes',
  'fpa min':      'fpaMinutes', 'fpa (min)':    'fpaMinutes', 'fpa (mins)':'fpaMinutes',
  'fpa_minutes':  'fpaMinutes', 'first pick':   'fpaMinutes',
  'lpa':          'lpaMinutes', 'lpa minutes':  'lpaMinutes', 'lpa mins':  'lpaMinutes',
  'lpa min':      'lpaMinutes', 'lpa (min)':    'lpaMinutes', 'lpa (mins)':'lpaMinutes',
  'lpa_minutes':  'lpaMinutes', 'last pick':    'lpaMinutes',
};
/* ============================================================
   Helpers
   ============================================================ */

/**
 * Extract a date from a filename like "FPAOF_2026-02-18.xlsx" or "report 2026-02-18.csv"
 * Returns a Date object if found, null otherwise.
 */
function extractDateFromFilename(filename) {
  if (!filename) return null;
  
  // Look for YYYY-MM-DD pattern in filename
  const match = filename.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year, month, day] = match;
    const d = new Date(`${year}-${month}-${day}T00:00:00`);
    if (!isNaN(d.getTime())) {
      console.log('Extracted date from filename:', filename, '→', d.toDateString());
      return d;
    }
  }
  
  // Also try MM-DD-YYYY or MM/DD/YYYY patterns
  const altMatch = filename.match(/(\d{2})[\-\/](\d{2})[\-\/](\d{4})/);
  if (altMatch) {
    const [, month, day, year] = altMatch;
    const d = new Date(`${year}-${month}-${day}T00:00:00`);
    if (!isNaN(d.getTime())) {
      console.log('Extracted date from filename (alt format):', filename, '→', d.toDateString());
      return d;
    }
  }
  
  return null;
}

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

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
    reader.readAsText(file);
  });
}

/** Parse CSV text into array of arrays (handles quoted fields) */
function parseCsvText(text) {
  const rows = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (line.trim() === '') continue;
    const cells = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { current += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else { current += ch; }
      } else {
        if (ch === '"') { inQuotes = true; }
        else if (ch === ',') { cells.push(current.trim()); current = ''; }
        else { current += ch; }
      }
    }
    cells.push(current.trim());
    rows.push(cells);
  }
  return rows;
}

function getFirstSheetRows(data, file) {
  // If it's a CSV file, parse directly without SheetJS
  if (file && /\.csv$/i.test(file.name)) {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
    return parseCsvText(text);
  }
  // For Excel files, need SheetJS
  if (typeof XLSX === 'undefined') {
    throw new Error('SheetJS library not loaded (CDN may be blocked). Try using .csv files instead, or contact IT.');
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

/**
 * Convert a time value to whole minutes.
 * Handles multiple formats from Excel/CSV reports:
 *   - "00:12:23" (HH:MM:SS) → 12 min
 *   - "12:23"    (MM:SS)    → 12 min
 *   - "16"       (plain)    → 16 min
 *   - 0.00860... (Excel serial time, e.g. 12m23s ≈ 0.00859) → 12 min
 *   - Date object from SheetJS (cellDates:true) → extract minutes
 *   - "16.5"     (decimal minutes) → 17 min (rounded)
 */
function parseTimeToMinutes(raw) {
  if (raw == null || raw === '') return 0;

  // If it's a Date object (SheetJS cellDates:true), extract HH:MM:SS
  if (raw instanceof Date) {
    const h = raw.getUTCHours();
    const m = raw.getUTCMinutes();
    const s = raw.getUTCSeconds();
    return Math.round(h * 60 + m + s / 60);
  }

  const str = String(raw).trim();

  // HH:MM:SS format — "00:12:23" → 12 minutes (rounded with seconds)
  const hmsMatch = str.match(/^(\d{1,2}):(\d{2}):(\d{2})$/);
  if (hmsMatch) {
    const h = parseInt(hmsMatch[1], 10);
    const m = parseInt(hmsMatch[2], 10);
    const s = parseInt(hmsMatch[3], 10);
    return Math.round(h * 60 + m + s / 60);
  }

  // MM:SS format — "12:23" → 12 minutes (rounded with seconds)
  const msMatch = str.match(/^(\d{1,3}):(\d{2})$/);
  if (msMatch) {
    const m = parseInt(msMatch[1], 10);
    const s = parseInt(msMatch[2], 10);
    return Math.round(m + s / 60);
  }

  // Plain number or decimal — could be minutes or Excel serial time
  const num = parseFloat(str);
  if (isNaN(num)) return 0;

  // Excel serial time: 1.0 = 24 hours, so values < 1.0 are fractions of a day
  // 12 minutes = 12/(24*60) ≈ 0.00833
  // If the number is less than 1, treat as Excel serial time
  if (num > 0 && num < 1) {
    const totalMinutes = num * 24 * 60;
    return Math.round(totalMinutes);
  }

  // Otherwise it's already in minutes
  return Math.round(num);
}

function parseFpaLpa(rows, role) {
  if (rows.length < 2) return [];
  const mapped = mapHeaders(rows[0], FPA_COL_MAP);
  console.log('FPA/LPA column mapping:', rows[0].map((h, i) => `"${h}" → ${mapped[i] || 'UNMAPPED'}`));

  // Warn if critical columns are missing
  if (!mapped.includes('userId'))     console.warn('⚠️ No User ID column found!');
  if (!mapped.includes('fpaMinutes')) console.warn('⚠️ No FPA column found!');
  if (!mapped.includes('lpaMinutes')) console.warn('⚠️ No LPA column found!');

  return rows.slice(1)
    .filter(r => r.length > 0 && r.some(c => c != null && c !== ''))
    .map(r => {
      const obj = rowToObject(r, mapped);
      obj.userId     = String(obj.userId || '').trim();
      obj.date       = normalizeDate(obj.date || '');

      // Get raw cell values for FPA/LPA (could be Date objects from SheetJS)
      const fpaIdx = mapped.indexOf('fpaMinutes');
      const lpaIdx = mapped.indexOf('lpaMinutes');
      const rawFpa = fpaIdx >= 0 && fpaIdx < r.length ? r[fpaIdx] : obj.fpaMinutes;
      const rawLpa = lpaIdx >= 0 && lpaIdx < r.length ? r[lpaIdx] : obj.lpaMinutes;

      // Handle time formats: "00:12:23", "12:23", "16", Excel serial time, Date objects
      obj.fpaMinutes = parseTimeToMinutes(rawFpa);
      obj.lpaMinutes = parseTimeToMinutes(rawLpa);
      console.log(`Parsed ${obj.userId}: FPA raw="${rawFpa}" → ${obj.fpaMinutes}min, LPA raw="${rawLpa}" → ${obj.lpaMinutes}min`);
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
    const rows = getFirstSheetRows(data, file);
    console.log('Roster headers:', rows[0]);
    console.log('Roster row count:', rows.length - 1);
    const parsed = parseRoster(rows);

    if (parsed.length === 0) {
      showImportStatus('\u274c Roster: no valid rows found. Check column headers (need: User ID, Name or First Name/Last Name, Area, Shift, Role).', false);
      return;
    }

    console.log('Parsed roster sample:', parsed[0]);
    ASSOCIATE_ROSTER.length = 0;
    parsed.forEach(r => ASSOCIATE_ROSTER.push(r));
    saveRosterToStorage(parsed);
    updateRosterStatus();
    populateFilters();
    showImportStatus(`\u2705 Roster saved! ${parsed.length} associates loaded. This will persist until you upload a new one.`, true);
    renderAll();
  } catch (err) {
    console.error('Roster upload error:', err);
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
  let extractedDate = null;

  try {
    if (fpaofInput.files.length > 0) {
      const file = fpaofInput.files[0];
      console.log('FPAOF file:', file.name, file.type, file.size, 'bytes');
      
      // Extract date from filename
      const fileDate = extractDateFromFilename(file.name);
      if (fileDate && !extractedDate) extractedDate = fileDate;
      
      const data = await readFileAsArray(file);
      const rows = getFirstSheetRows(data, file);
      console.log('FPAOF headers found:', rows[0]);
      console.log('FPAOF data rows:', rows.length - 1);
      if (rows.length > 1) console.log('FPAOF first data row:', rows[1]);
      const parsed = parseFpaLpa(rows, 'Orderfiller');
      console.log('FPAOF parsed records:', parsed.length);
      if (parsed.length > 0) console.log('FPAOF sample:', parsed[0]);
      fpaRecords.push(...parsed);
      msgs.push(`\u2705 FPAOF: ${parsed.length} orderfiller records loaded`);
      ok = true;
    }

    if (fpaldInput.files.length > 0) {
      const file = fpaldInput.files[0];
      console.log('FPALD file:', file.name, file.type, file.size, 'bytes');
      
      // Extract date from filename
      const fileDate = extractDateFromFilename(file.name);
      if (fileDate && !extractedDate) extractedDate = fileDate;
      
      const data = await readFileAsArray(file);
      const rows = getFirstSheetRows(data, file);
      console.log('FPALD headers found:', rows[0]);
      console.log('FPALD data rows:', rows.length - 1);
      if (rows.length > 1) console.log('FPALD first data row:', rows[1]);
      const parsed = parseFpaLpa(rows, 'Lift Driver');
      console.log('FPALD parsed records:', parsed.length);
      if (parsed.length > 0) console.log('FPALD sample:', parsed[0]);
      fpaRecords.push(...parsed);
      msgs.push(`\u2705 FPALD: ${parsed.length} lift driver records loaded`);
      ok = true;
    }

    // Store the extracted report date
    if (extractedDate) {
      REPORT_DATE = extractedDate;
      console.log('Report date set from filename:', REPORT_DATE.toDateString());
    }

    if (fpaRecords.length > 0) {
      FPA_LPA_DATA.length = 0;
      fpaRecords.forEach(r => FPA_LPA_DATA.push(r));
      console.log('FPA_LPA_DATA populated:', FPA_LPA_DATA.length, 'total records');

      // Check roster matching
      const rosterIds = new Set(ASSOCIATE_ROSTER.map(r => String(r.userId).trim().toUpperCase()));
      const matchedIds = fpaRecords.filter(r => rosterIds.has(String(r.userId).trim().toUpperCase()));
      const unmatchedIds = [...new Set(
        fpaRecords
          .filter(r => !rosterIds.has(String(r.userId).trim().toUpperCase()))
          .map(r => r.userId)
      )];

      msgs.push(`\ud83d\udd17 ${matchedIds.length} of ${fpaRecords.length} records matched to roster`);

      if (unmatchedIds.length > 0) {
        msgs.push(`\u26a0\ufe0f ${unmatchedIds.length} User ID(s) not in Roster: ${unmatchedIds.slice(0, 5).join(', ')}${unmatchedIds.length > 5 ? '...' : ''}`);
      }
    }

    if (msgs.length === 0) msgs.push('\u26a0\ufe0f No files selected.');
    showImportStatus(msgs.join('<br>'), ok);
    if (ok) renderAll();

  } catch (err) {
    console.error('Import error:', err);
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
  // Keep errors visible until next action; auto-hide success after 15s
  if (success) {
    setTimeout(() => { el.style.display = 'none'; }, 15000);
  }
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
