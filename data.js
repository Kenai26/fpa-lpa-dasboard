/**
 * DC 6084 — FPA / LPA Dashboard Data
 * Replace sample data with real feeds.
 *
 * FPA Goals (area-specific):
 *   - Dry: ≤ 14 minutes
 *   - FDD: ≤ 15 minutes
 *   - MP:  ≤ 14 minutes
 * LPA Goal: ≤ 14 minutes (all areas)
 */

const GOALS = Object.freeze({
  // Area-specific FPA goals
  FPA_MINUTES: {
    DRY: 14,
    FDD: 15,
    MP:  14,
    DEFAULT: 14,  // Fallback for unknown areas
  },
  LPA_MINUTES: 14,
  // Building-wide goals (unified targets)
  BUILDING: {
    FPA_MINUTES: 14,
    LPA_MINUTES: 14,
  },
});

/**
 * Get the FPA goal for a given area.
 * Areas like "Dry 1st", "FDD 2nd", "MP 4th" are matched by prefix.
 */
function getFpaGoal(area) {
  const areaUpper = String(area || '').toUpperCase();
  if (areaUpper.startsWith('DRY')) return GOALS.FPA_MINUTES.DRY;
  if (areaUpper.startsWith('FDD')) return GOALS.FPA_MINUTES.FDD;
  if (areaUpper.startsWith('MP'))  return GOALS.FPA_MINUTES.MP;
  return GOALS.FPA_MINUTES.DEFAULT;
}

/**
 * Associate Roster — DC 6084
 * This is the source of truth for names, areas, shifts, and roles.
 */
const ASSOCIATE_ROSTER = [
  // --- Dry 1st ---
  { userId: 'D6-1001', name: 'John Smith',       area: 'Dry 1st', shift: '1st', role: 'Orderfiller' },
  { userId: 'D6-1002', name: 'Jane Doe',         area: 'Dry 1st', shift: '1st', role: 'Orderfiller' },
  { userId: 'D6-1003', name: 'Mike Johnson',     area: 'Dry 1st', shift: '1st', role: 'Lift Driver' },
  { userId: 'D6-1004', name: 'Sarah Williams',   area: 'Dry 1st', shift: '1st', role: 'Orderfiller' },
  { userId: 'D6-1005', name: 'Tom Brown',        area: 'Dry 1st', shift: '1st', role: 'Lift Driver' },
  // --- Dry 2nd ---
  { userId: 'D6-1006', name: 'Lisa Davis',       area: 'Dry 2nd', shift: '2nd', role: 'Orderfiller' },
  { userId: 'D6-1007', name: 'Chris Miller',     area: 'Dry 2nd', shift: '2nd', role: 'Lift Driver' },
  { userId: 'D6-1008', name: 'Amy Wilson',       area: 'Dry 2nd', shift: '2nd', role: 'Orderfiller' },
  { userId: 'D6-1009', name: 'David Moore',      area: 'Dry 2nd', shift: '2nd', role: 'Orderfiller' },
  { userId: 'D6-1010', name: 'Karen Taylor',     area: 'Dry 2nd', shift: '2nd', role: 'Lift Driver' },
  // --- Dry 4th ---
  { userId: 'D6-1011', name: 'James Anderson',   area: 'Dry 4th', shift: '4th', role: 'Orderfiller' },
  { userId: 'D6-1012', name: 'Emily Thomas',     area: 'Dry 4th', shift: '4th', role: 'Orderfiller' },
  { userId: 'D6-1013', name: 'Robert Jackson',   area: 'Dry 4th', shift: '4th', role: 'Lift Driver' },
  { userId: 'D6-1014', name: 'Maria Garcia',     area: 'Dry 4th', shift: '4th', role: 'Orderfiller' },
  { userId: 'D6-1015', name: 'Kevin White',      area: 'Dry 4th', shift: '4th', role: 'Lift Driver' },
  // --- Dry 5th ---
  { userId: 'D6-1016', name: 'Nancy Harris',     area: 'Dry 5th', shift: '5th', role: 'Orderfiller' },
  { userId: 'D6-1017', name: 'Steven Martin',    area: 'Dry 5th', shift: '5th', role: 'Lift Driver' },
  { userId: 'D6-1018', name: 'Laura Lee',        area: 'Dry 5th', shift: '5th', role: 'Orderfiller' },
  { userId: 'D6-1019', name: 'Brian Clark',      area: 'Dry 5th', shift: '5th', role: 'Orderfiller' },
  { userId: 'D6-1020', name: 'Sandra Lewis',     area: 'Dry 5th', shift: '5th', role: 'Lift Driver' },

  // --- FDD 1st ---
  { userId: 'D6-2001', name: 'Paul Robinson',    area: 'FDD 1st', shift: '1st', role: 'Orderfiller' },
  { userId: 'D6-2002', name: 'Donna Walker',     area: 'FDD 1st', shift: '1st', role: 'Lift Driver' },
  { userId: 'D6-2003', name: 'Mark Hall',        area: 'FDD 1st', shift: '1st', role: 'Orderfiller' },
  { userId: 'D6-2004', name: 'Patricia Adams',   area: 'FDD 1st', shift: '1st', role: 'Orderfiller' },
  { userId: 'D6-2005', name: 'Charles Nelson',   area: 'FDD 1st', shift: '1st', role: 'Lift Driver' },
  // --- FDD 2nd ---
  { userId: 'D6-2006', name: 'Margaret Hill',    area: 'FDD 2nd', shift: '2nd', role: 'Orderfiller' },
  { userId: 'D6-2007', name: 'Kenneth King',     area: 'FDD 2nd', shift: '2nd', role: 'Lift Driver' },
  { userId: 'D6-2008', name: 'Dorothy Wright',   area: 'FDD 2nd', shift: '2nd', role: 'Orderfiller' },
  { userId: 'D6-2009', name: 'Frank Lopez',      area: 'FDD 2nd', shift: '2nd', role: 'Orderfiller' },
  { userId: 'D6-2010', name: 'Ruth Gonzalez',    area: 'FDD 2nd', shift: '2nd', role: 'Lift Driver' },
  // --- FDD 4th ---
  { userId: 'D6-2011', name: 'Raymond Perez',    area: 'FDD 4th', shift: '4th', role: 'Orderfiller' },
  { userId: 'D6-2012', name: 'Helen Campbell',   area: 'FDD 4th', shift: '4th', role: 'Lift Driver' },
  { userId: 'D6-2013', name: 'Jerry Mitchell',   area: 'FDD 4th', shift: '4th', role: 'Orderfiller' },
  { userId: 'D6-2014', name: 'Debra Roberts',    area: 'FDD 4th', shift: '4th', role: 'Orderfiller' },
  { userId: 'D6-2015', name: 'Walter Carter',    area: 'FDD 4th', shift: '4th', role: 'Lift Driver' },
  // --- FDD 5th ---
  { userId: 'D6-2016', name: 'Carol Phillips',   area: 'FDD 5th', shift: '5th', role: 'Orderfiller' },
  { userId: 'D6-2017', name: 'Roger Evans',      area: 'FDD 5th', shift: '5th', role: 'Lift Driver' },
  { userId: 'D6-2018', name: 'Sharon Turner',    area: 'FDD 5th', shift: '5th', role: 'Orderfiller' },
  { userId: 'D6-2019', name: 'Dennis Scott',     area: 'FDD 5th', shift: '5th', role: 'Orderfiller' },
  { userId: 'D6-2020', name: 'Betty Allen',      area: 'FDD 5th', shift: '5th', role: 'Lift Driver' },

  // --- MP 1st ---
  { userId: 'D6-3001', name: 'George Young',     area: 'MP 1st',  shift: '1st', role: 'Orderfiller' },
  { userId: 'D6-3002', name: 'Angela Baker',     area: 'MP 1st',  shift: '1st', role: 'Lift Driver' },
  { userId: 'D6-3003', name: 'Timothy Green',    area: 'MP 1st',  shift: '1st', role: 'Orderfiller' },
  { userId: 'D6-3004', name: 'Kimberly Edwards', area: 'MP 1st',  shift: '1st', role: 'Orderfiller' },
  { userId: 'D6-3005', name: 'Jason Collins',    area: 'MP 1st',  shift: '1st', role: 'Lift Driver' },
  // --- MP 2nd ---
  { userId: 'D6-3006', name: 'Stephanie Stewart',area: 'MP 2nd',  shift: '2nd', role: 'Orderfiller' },
  { userId: 'D6-3007', name: 'Aaron Sanchez',    area: 'MP 2nd',  shift: '2nd', role: 'Lift Driver' },
  { userId: 'D6-3008', name: 'Michelle Morris',  area: 'MP 2nd',  shift: '2nd', role: 'Orderfiller' },
  { userId: 'D6-3009', name: 'Justin Rogers',    area: 'MP 2nd',  shift: '2nd', role: 'Orderfiller' },
  { userId: 'D6-3010', name: 'Rebecca Reed',     area: 'MP 2nd',  shift: '2nd', role: 'Lift Driver' },
  // --- MP 4th ---
  { userId: 'D6-3011', name: 'Ryan Cook',        area: 'MP 4th',  shift: '4th', role: 'Orderfiller' },
  { userId: 'D6-3012', name: 'Laura Morgan',     area: 'MP 4th',  shift: '4th', role: 'Lift Driver' },
  { userId: 'D6-3013', name: 'Brandon Bell',     area: 'MP 4th',  shift: '4th', role: 'Orderfiller' },
  { userId: 'D6-3014', name: 'Amanda Murphy',    area: 'MP 4th',  shift: '4th', role: 'Orderfiller' },
  { userId: 'D6-3015', name: 'Tyler Bailey',     area: 'MP 4th',  shift: '4th', role: 'Lift Driver' },
  // --- MP 5th ---
  { userId: 'D6-3016', name: 'Megan Rivera',     area: 'MP 5th',  shift: '5th', role: 'Orderfiller' },
  { userId: 'D6-3017', name: 'Nathan Cooper',    area: 'MP 5th',  shift: '5th', role: 'Lift Driver' },
  { userId: 'D6-3018', name: 'Samantha Cox',     area: 'MP 5th',  shift: '5th', role: 'Orderfiller' },
  { userId: 'D6-3019', name: 'Dylan Howard',     area: 'MP 5th',  shift: '5th', role: 'Orderfiller' },
  { userId: 'D6-3020', name: 'Kayla Ward',       area: 'MP 5th',  shift: '5th', role: 'Lift Driver' },
];

/**
 * FPA/LPA records — starts empty.
 * Populated when user uploads FPAOF / FPALD reports via the import modal.
 * Names, areas, shifts come from the Roster (matched by User ID).
 */
// Keep a copy of the sample roster so we can reset to it
const SAMPLE_ROSTER = ASSOCIATE_ROSTER.map(r => ({ ...r }));

const FPA_LPA_DATA = [];
