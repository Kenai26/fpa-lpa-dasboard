# 📊 DC 6084 — FPA / LPA Dashboard

A lightweight, accessibility-first dashboard for tracking Fastest Pick Area (FPA) and Lift Pick Area (LPA) performance metrics at DC 6084. Built with vanilla JavaScript, HTML, and CSS with WCAG 2.2 Level AA compliance and Walmart-inspired design.

## 🎯 Features

- **Two Main Reports**:
  - **FPA / LPA Report**: Building goals, area-specific performance, breakdowns by shift/area, and detailed scorecards
  - **Associate Roster**: Manage and view your team structure

- **Dynamic Filtering**: Filter by Area, Shift, and Role with real-time updates

- **Data Import**: Upload FPAOF (Orderfiller) and FPALD (Lift Driver) reports in Excel or CSV format

- **Roster Management**: Upload team roster to automatically match associates to their metrics

- **Building Goal Tracking**: 
  - Target FPA/LPA ≤ 14 minutes
  - View building-wide performance percentage
  - Track hours lost over goal

- **Accessibility**: WCAG 2.2 Level AA compliant with full keyboard navigation and screen reader support

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🚀 Quick Start

### Opening the Dashboard

1. Open `index.html` in your browser (double-click or drag into browser)
2. You'll see a sample roster pre-loaded
3. Click **"📂 Load FPA / LPA"** to upload your report files

### Uploading Roster Data

1. Click **"👥 Upload Roster"** button
2. Select your roster CSV/Excel file with columns:
   - `User ID` (required - must match report data)
   - `First Name`
   - `Last Name`
   - `Area` (e.g., "Dry", "FDD", "MP", "Ship", "Rec")
   - `Shift` (e.g., "A", "B", "C")
   - `Role` (e.g., "Orderfiller", "Lift Driver")

3. The dashboard will populate filter dropdowns based on your roster

### Uploading FPA/LPA Reports

1. Click **"📂 Load FPA / LPA"**
2. Select **FPAOF** file (Orderfiller metrics)
3. Select **FPALD** file (Lift Driver metrics)
4. Click **"✅ Import All"**

File format requirements:
- **Required columns**: `User ID`, `Date`, `FPA Minutes`, `LPA Minutes`
- **Supported formats**: `.xlsx`, `.xls`, `.csv`
- User IDs must match your roster for name lookup

## 📋 File Structure

```
.
├── index.html        # HTML structure & accessibility markup
├── styles.css        # Walmart-branded styles (WCAG 2.2 AA)
├── app.js           # Core dashboard logic, filtering, calculations
├── data.js          # Sample roster & FPA/LPA data
├── import.js        # File upload & parsing logic
├── EXCEL_FORMAT.md  # Guide for Excel file preparation
└── README.md        # This file
```

## 🎨 Design & Branding

The dashboard uses Walmart's official color palette:
- **Primary Blue**: #0053e2
- **Accent Yellow**: #ffc220
- **Success Green**: #2a8703
- **Danger Red**: #ea1100

All colors meet WCAG 2.2 Level AA contrast requirements (4.5:1 for text, 3:1 for UI).

## ♿ Accessibility

- Full keyboard navigation with visible focus indicators
- ARIA labels, roles, and live regions for screen readers
- Semantic HTML structure
- Color contrast > 4.5:1 for all text
- Tested with screen readers (NVDA, JAWS)

## 📊 Building Goal Metrics

### FPA Targets (varies by area)
- **Dry & MP**: ≤ 14 minutes
- **FDD**: ≤ 15 minutes

### LPA Target
- **All areas**: ≤ 14 minutes

### Building Goal
- Associates must meet **both** FPA and LPA targets to count as "On Building Goal"
- Hours Lost = sum of (actual - target) for all associates exceeding goals

## 🛠️ Development

### Local Server (optional)
For better file handling in some browsers, run a local server:

```bash
# Using Python 3
python -m http.server 8000

# Or using Node (if installed)
npx http-server
```

Then visit `http://localhost:8000`

### Modifying Styles
- Edit `styles.css` to update colors or layout
- CSS custom properties (variables) in `:root` for easy theme changes
- Keep contrast ratios ≥ 4.5:1 for text

### Extending Features
- Add new filter types in the filter section (HTML)
- Update filter logic in `app.js` → `applyFilters()`
- New calculations go in `calculateMetrics()`

## 📁 Sample Data

The dashboard includes sample data in `data.js` for testing:
- **10 sample associates** with various shifts and roles
- **30 sample FPA/LPA records** spanning multiple dates

To reset to sample data, click **"Reset to Sample Roster"** button.

## 🔒 Security & Privacy

- **No data is sent anywhere**: All processing happens locally in your browser
- **File uploads are temporary**: Data is cleared when you refresh the page
- **No persistent storage**: Add localStorage if needed (see `import.js`)

For sensitive PII data, be cautious about:
- Sharing browser logs
- Taking screenshots with data visible
- Storing files in shared cloud drives

## 📝 Excel Prep Guide

See `EXCEL_FORMAT.md` for detailed instructions on formatting your source Excel files before exporting to CSV for upload.

## 🐛 Troubleshooting

### Data not loading?
- Check file format (must be .xlsx, .xls, or .csv)
- Verify column names match: `User ID`, `Date`, `FPA Minutes`, `LPA Minutes`
- Check browser console (F12) for error messages

### Filters not appearing?
- Make sure roster is uploaded first
- Filter values come from the `Area`, `Shift`, and `Role` columns in your roster

### Names showing as "Unknown"?
- Check that User IDs in reports match your roster exactly (case-insensitive)
- Trim any extra whitespace in User ID columns

## 📞 Support

For questions or issues:
- Check the diagnostic logs in browser console (F12 → Console tab)
- Verify file formats match `EXCEL_FORMAT.md`
- Test with sample data first (click reset button)

## 📄 License

Internal Use Only — Walmart DC 6084

## ✨ Version History

- **v3.0** (Current): Area-specific FPA goals, Building Goal tracking, improved scorecard performance
- **v2.0**: Dynamic report dates, off-goal highlighting
- **v1.0**: Initial release with FPA/LPA and roster features
