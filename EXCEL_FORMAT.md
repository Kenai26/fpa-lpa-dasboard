# DC 6084 — Weekly Report Import Format

## Roster (upload via 👥 Upload Roster — saved until replaced)

| User ID | Name          | Area    | Shift | Role         |
|---------|---------------|---------|-------|--------------|
| D6-1001 | John Smith    | Dry 1st | 1     | Orderfiller  |
| D6-1002 | Jane Doe      | FDD 2nd | 2     | Lift Driver  |
| D6-1003 | Mike Johnson  | MP 4th  | 4     | Orderfiller  |

**Valid Areas:** `Dry 1st`, `Dry 2nd`, `Dry 4th`, `Dry 5th`, `FDD 1st`, `FDD 2nd`, `FDD 4th`, `FDD 5th`, `MP 1st`, `MP 2nd`, `MP 4th`, `MP 5th`

**Valid Shifts:** `1`, `2`, `4`, `5`

---

## FPAOF (Orderfiller FPA/LPA) — via 📂 Load FPA / LPA

| User ID | Date       | FPA Minutes | LPA Minutes |
|---------|------------|-------------|-------------|
| D6-1001 | 2026-02-11 | 8           | 10          |

## FPALD (Lift Driver FPA/LPA) — via 📂 Load FPA / LPA

| User ID | Date       | FPA Minutes | LPA Minutes |
|---------|------------|-------------|-------------|
| D6-1002 | 2026-02-11 | 14          | 12          |

**FPA Goals (area-specific):** Dry ≤ 14 min | FDD ≤ 15 min | MP ≤ 14 min | **LPA Goal:** ≤ 14 min
