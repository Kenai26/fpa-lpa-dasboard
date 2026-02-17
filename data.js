/**
 * DC 6084 — FPA / LPA Dashboard Data
 * Replace sample data with real feeds.
 *
 * FPA Goal: ≤ 16 minutes after shift start
 * LPA Goal: ≤ 14 minutes before shift end
 */

const GOALS = Object.freeze({
  FPA_MINUTES: 16,
  LPA_MINUTES: 14,
});

const AREAS = [
  'Dry 1st',  'Dry 2nd',  'Dry 4th',  'Dry 5th',
  'FDD 1st',  'FDD 2nd',  'FDD 4th',  'FDD 5th',
  'MP 1st',   'MP 2nd',   'MP 4th',   'MP 5th',
];

const BASE_AREAS = ['Dry', 'FDD', 'MP'];
const SHIFTS = ['1st', '2nd', '4th', '5th'];
const ROLES  = ['Orderfiller', 'Lift Driver'];

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
 * FPA/LPA records for today.
 * Only userId is needed — names, areas, shifts come from the Roster above.
 */
// Keep a copy of the sample roster so we can reset to it
const SAMPLE_ROSTER = ASSOCIATE_ROSTER.map(r => ({ ...r }));

const FPA_LPA_DATA = [
  // Dry 1st
  { userId: 'D6-1001', date: '2026-02-11', fpaMinutes: 8,  lpaMinutes: 10 },
  { userId: 'D6-1002', date: '2026-02-11', fpaMinutes: 22, lpaMinutes: 5  },
  { userId: 'D6-1003', date: '2026-02-11', fpaMinutes: 12, lpaMinutes: 18 },
  { userId: 'D6-1004', date: '2026-02-11', fpaMinutes: 30, lpaMinutes: 25 },
  { userId: 'D6-1005', date: '2026-02-11', fpaMinutes: 15, lpaMinutes: 12 },
  // Dry 2nd
  { userId: 'D6-1006', date: '2026-02-11', fpaMinutes: 5,  lpaMinutes: 8  },
  { userId: 'D6-1007', date: '2026-02-11', fpaMinutes: 10, lpaMinutes: 16 },
  { userId: 'D6-1008', date: '2026-02-11', fpaMinutes: 25, lpaMinutes: 20 },
  { userId: 'D6-1009', date: '2026-02-11', fpaMinutes: 18, lpaMinutes: 6  },
  { userId: 'D6-1010', date: '2026-02-11', fpaMinutes: 14, lpaMinutes: 11 },
  // Dry 4th
  { userId: 'D6-1011', date: '2026-02-11', fpaMinutes: 7,  lpaMinutes: 15 },
  { userId: 'D6-1012', date: '2026-02-11', fpaMinutes: 20, lpaMinutes: 3  },
  { userId: 'D6-1013', date: '2026-02-11', fpaMinutes: 35, lpaMinutes: 30 },
  { userId: 'D6-1014', date: '2026-02-11', fpaMinutes: 11, lpaMinutes: 9  },
  { userId: 'D6-1015', date: '2026-02-11', fpaMinutes: 16, lpaMinutes: 14 },
  // Dry 5th
  { userId: 'D6-1016', date: '2026-02-11', fpaMinutes: 6,  lpaMinutes: 11 },
  { userId: 'D6-1017', date: '2026-02-11', fpaMinutes: 28, lpaMinutes: 22 },
  { userId: 'D6-1018', date: '2026-02-11', fpaMinutes: 13, lpaMinutes: 7  },
  { userId: 'D6-1019', date: '2026-02-11', fpaMinutes: 9,  lpaMinutes: 13 },
  { userId: 'D6-1020', date: '2026-02-11', fpaMinutes: 4,  lpaMinutes: 16 },

  // FDD 1st
  { userId: 'D6-2001', date: '2026-02-11', fpaMinutes: 21, lpaMinutes: 19 },
  { userId: 'D6-2002', date: '2026-02-11', fpaMinutes: 33, lpaMinutes: 28 },
  { userId: 'D6-2003', date: '2026-02-11', fpaMinutes: 10, lpaMinutes: 4  },
  { userId: 'D6-2004', date: '2026-02-11', fpaMinutes: 8,  lpaMinutes: 10 },
  { userId: 'D6-2005', date: '2026-02-11', fpaMinutes: 17, lpaMinutes: 12 },
  // FDD 2nd
  { userId: 'D6-2006', date: '2026-02-11', fpaMinutes: 27, lpaMinutes: 17 },
  { userId: 'D6-2007', date: '2026-02-11', fpaMinutes: 12, lpaMinutes: 15 },
  { userId: 'D6-2008', date: '2026-02-11', fpaMinutes: 15, lpaMinutes: 9  },
  { userId: 'D6-2009', date: '2026-02-11', fpaMinutes: 6,  lpaMinutes: 13 },
  { userId: 'D6-2010', date: '2026-02-11', fpaMinutes: 19, lpaMinutes: 7  },
  // FDD 4th
  { userId: 'D6-2011', date: '2026-02-11', fpaMinutes: 11, lpaMinutes: 18 },
  { userId: 'D6-2012', date: '2026-02-11', fpaMinutes: 32, lpaMinutes: 26 },
  { userId: 'D6-2013', date: '2026-02-11', fpaMinutes: 14, lpaMinutes: 5  },
  { userId: 'D6-2014', date: '2026-02-11', fpaMinutes: 9,  lpaMinutes: 11 },
  { userId: 'D6-2015', date: '2026-02-11', fpaMinutes: 16, lpaMinutes: 14 },
  // FDD 5th
  { userId: 'D6-2016', date: '2026-02-11', fpaMinutes: 26, lpaMinutes: 23 },
  { userId: 'D6-2017', date: '2026-02-11', fpaMinutes: 7,  lpaMinutes: 8  },
  { userId: 'D6-2018', date: '2026-02-11', fpaMinutes: 20, lpaMinutes: 16 },
  { userId: 'D6-2019', date: '2026-02-11', fpaMinutes: 13, lpaMinutes: 10 },
  { userId: 'D6-2020', date: '2026-02-11', fpaMinutes: 5,  lpaMinutes: 14 },

  // MP 1st
  { userId: 'D6-3001', date: '2026-02-11', fpaMinutes: 16, lpaMinutes: 14 },
  { userId: 'D6-3002', date: '2026-02-11', fpaMinutes: 23, lpaMinutes: 21 },
  { userId: 'D6-3003', date: '2026-02-11', fpaMinutes: 7,  lpaMinutes: 9  },
  { userId: 'D6-3004', date: '2026-02-11', fpaMinutes: 29, lpaMinutes: 24 },
  { userId: 'D6-3005', date: '2026-02-11', fpaMinutes: 12, lpaMinutes: 6  },
  // MP 2nd
  { userId: 'D6-3006', date: '2026-02-11', fpaMinutes: 18, lpaMinutes: 13 },
  { userId: 'D6-3007', date: '2026-02-11', fpaMinutes: 34, lpaMinutes: 27 },
  { userId: 'D6-3008', date: '2026-02-11', fpaMinutes: 10, lpaMinutes: 11 },
  { userId: 'D6-3009', date: '2026-02-11', fpaMinutes: 4,  lpaMinutes: 15 },
  { userId: 'D6-3010', date: '2026-02-11', fpaMinutes: 19, lpaMinutes: 8  },
  // MP 4th
  { userId: 'D6-3011', date: '2026-02-11', fpaMinutes: 8,  lpaMinutes: 12 },
  { userId: 'D6-3012', date: '2026-02-11', fpaMinutes: 22, lpaMinutes: 19 },
  { userId: 'D6-3013', date: '2026-02-11', fpaMinutes: 15, lpaMinutes: 7  },
  { userId: 'D6-3014', date: '2026-02-11', fpaMinutes: 31, lpaMinutes: 25 },
  { userId: 'D6-3015', date: '2026-02-11', fpaMinutes: 11, lpaMinutes: 10 },
  // MP 5th
  { userId: 'D6-3016', date: '2026-02-11', fpaMinutes: 24, lpaMinutes: 20 },
  { userId: 'D6-3017', date: '2026-02-11', fpaMinutes: 6,  lpaMinutes: 13 },
  { userId: 'D6-3018', date: '2026-02-11', fpaMinutes: 17, lpaMinutes: 4  },
  { userId: 'D6-3019', date: '2026-02-11', fpaMinutes: 14, lpaMinutes: 16 },
  { userId: 'D6-3020', date: '2026-02-11', fpaMinutes: 9,  lpaMinutes: 11 },
];
