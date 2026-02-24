# 📊 DC 6084 FPA/LPA Dashboard — Puppy Pages Edition

> **Status**: ✅ Production Ready | **Version**: 3.0.0 | **License**: Internal Use Only

Welcome to the **FPA/LPA Dashboard** — the go-to tool for tracking Fastest Pick Area and Lift Pick Area performance at Distribution Center 6084. This is a **zero-dependency, browser-based dashboard** that works offline with your data never leaving your computer.

## 🎯 What You Can Do

### 📈 Performance Tracking
- View **building-wide FPA/LPA goals** (target: ≤14 minutes)
- Track **hours lost over goal** for each associate
- See **area-specific performance** breakdowns
- Monitor **shift-by-shift metrics**
- Identify associates **off-goal** for coaching

### 📊 Detailed Reports
- **Score Cards**: Bottom performers by area and shift
- **Area Breakdown**: Quick view of performance by location
- **Associate Roster**: Full team visibility with filtering
- **Building Goal Metrics**: What % of your team is on target

### 🎛️ Smart Filtering
- Filter by **Area** (Dry, FDD, MP, Ship, Rec, etc.)
- Filter by **Shift** (A, B, C, etc.)
- Filter by **Role** (Orderfiller, Lift Driver, etc.)
- Real-time updates as you filter

### 📤 Easy Data Import
- Upload **FPAOF reports** (Orderfiller metrics)
- Upload **FPALD reports** (Lift Driver metrics)
- Upload **Roster data** for name lookup
- Supports Excel (.xlsx) and CSV formats

## ⚡ Quick Start (2 Minutes)

### Step 1: Open the Dashboard
```
Just click the link below and it opens instantly — no installation needed!
```

### Step 2: Upload Your Roster
1. Click **👥 Upload Roster**
2. Select your CSV/Excel file with these columns:
   ```
   User ID | First Name | Last Name | Area | Shift | Role
   ```

### Step 3: Load Your Reports
1. Click **📂 Load FPA / LPA**
2. Upload your **FPAOF** file (Orderfiller metrics)
3. Upload your **FPALD** file (Lift Driver metrics)
4. Click **✅ Import All**

### Step 4: Analyze
- Use dropdowns to filter by Area, Shift, Role
- Check **Score Cards** for off-goal associates
- Review **Building Goal** section for overall performance

**That's it!** Your data never leaves your computer — all processing happens in your browser.

## 📋 File Requirements

### Roster File
Required columns (case-insensitive):
- `User ID` — Must match your FPA/LPA reports
- `First Name`
- `Last Name`
- `Area` — Examples: Dry, FDD, MP, Ship, Rec
- `Shift` — Examples: A, B, C
- `Role` — Examples: Orderfiller, Lift Driver

### FPA/LPA Reports
Required columns for BOTH files:
- `User ID` — Matches roster
- `Date` — When the metric was recorded
- `FPA Minutes` — Fastest Pick Area time
- `LPA Minutes` — Lift Pick Area time

**Supported formats**: `.xlsx`, `.xls`, `.csv`

👉 Need help formatting Excel files? See **EXCEL_FORMAT.md**

## 🏆 Building Goal Targets

### FPA (Fastest Pick Area)
- **Dry & MP**: ≤ 14 minutes
- **FDD**: ≤ 15 minutes

### LPA (Lift Pick Area)
- **All areas**: ≤ 14 minutes

### Building Goal
An associate counts as "On Building Goal" when **BOTH** FPA and LPA are at or below their targets.

## 🎨 Features

✅ **WCAG 2.2 Level AA Accessible**
- Full keyboard navigation
- Screen reader compatible
- High contrast (4.5:1 text contrast ratio)
- Semantic HTML structure

✅ **Walmart Brand Design**
- Official Walmart blue (#0053e2) and yellow (#ffc220)
- Professional, modern UI
- Responsive — works on desktop, tablet, mobile

✅ **Zero External Dependencies**
- No server required
- No sign-up needed
- No internet dependency (mostly)
- Data stays on your computer

✅ **Built for Operations**
- Fast data import
- Real-time filtering
- Export-ready summaries
- Built-in sample data for testing

## 🔒 Security & Privacy

**Your data is yours:**
- ✅ All processing happens **locally in your browser**
- ✅ No data is sent to any server
- ✅ No tracking or analytics
- ✅ Clear on page refresh
- ✅ Complies with Walmart InfoSec policies

⚠️ **Important**: Do not store PII in shared locations. Use this dashboard on your personal computer or secure Walmart device.

## 📚 Documentation

- **README.md** — Full technical documentation
- **DEPLOYMENT.md** — How to host/deploy the dashboard
- **EXCEL_FORMAT.md** — Excel file preparation guide
- **puppy.config.json** — Dashboard metadata for Puppy Pages

## 🆘 Troubleshooting

### Files not loading?
- Check file format (must be .xlsx, .xls, or .csv)
- Verify column names exactly match
- Try the sample data first (click "Reset to Sample Roster")

### Names showing as "Unknown"?
- Make sure User IDs in your reports match your roster
- Check for extra spaces or different case formatting

### Filters not showing up?
- Upload your roster first
- Filters populate from the Area, Shift, and Role columns

### Performance issues with large files?
- The dashboard handles 1000+ records smoothly
- If slow, try filtering by a specific shift first

👉 **Open browser console (F12 → Console tab)** to see diagnostic messages

## 🚀 Deployment

### For Your Team
1. Share this Puppy Pages link with your team
2. Everyone can use it directly — no installation
3. Works on Windows, Mac, Linux

### For Your Facility
1. Host on SharePoint/Teams (see DEPLOYMENT.md)
2. Request SSP/APM deployment for enterprise hosting
3. Pin to Teams channels for easy access

## 🐶 Powered by Code Puppy

This dashboard was built with **Code Puppy** — Walmart's open-source AI code agent.

- Learn more: https://puppy.walmart.com
- Community: https://teams.microsoft.com/l/channel/19%3AGbP8DGJjrXq1sL3IlXErZc5U7hk-IEqsokmnImcKyP41%40thread.tacv2
- Support: #code-puppy-support on Slack

## 📞 Support

- **Questions?** Check README.md for detailed docs
- **Issues?** See DEPLOYMENT.md for deployment options
- **Feedback?** Join the Code Puppy community

---

**Version**: 3.0.0 | **Last Updated**: Feb 24, 2026 | **Status**: Production Ready ✅

**Made with ❤️ for DC 6084 operations teams**
