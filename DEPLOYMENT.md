# 🚀 Deployment Guide

This guide covers multiple ways to publish and share the FPA/LPA Dashboard.

## Option 1: Walmart Puppy Pages Dashboard

If publishing to the Code Puppy marketplace or Walmart's internal dashboard portal:

1. **Ensure all files are committed to git**:
   ```bash
   git status
   git add .
   git commit -m "Ready for publication"
   ```

2. **Verify requirements**:
   - ✅ All HTML/CSS/JS files present
   - ✅ README.md with usage instructions
   - ✅ WCAG 2.2 AA compliance verified
   - ✅ No sensitive data in git history
   - ✅ .gitignore excludes data files (xlsx, csv)

3. **Submit to Code Puppy Marketplace**:
   - Visit: https://puppy.walmart.com/marketplace
   - Follow submission instructions
   - Your repo will be indexed automatically

## Option 2: Static Hosting (SharePoint, Teams)

### Deploy to SharePoint

1. **Prepare files for upload**:
   - Ensure all relative paths are correct
   - Test locally first with `python -m http.server 8000`

2. **Upload to SharePoint**:
   - Create a Document Library in your Team site
   - Upload all files maintaining folder structure
   - Set `index.html` as the default document

3. **Access via Teams**:
   - Pin the site to Teams channel
   - Share the link in channel description

### Deploy to Teams File Storage

```bash
# Via msgraph agent (if available)
msgraph upload-to-teams --channel "Your Channel" --files ./
```

## Option 3: SSP/APM Process (Recommended)

For official Walmart hosting:

1. **Contact Global Tech Partner**:
   - Reach out to your SSP (Shared Services Partner) or APM (Application Portfolio Manager)
   - Provide this repository link
   - Request deployment to Walmart hosting infrastructure

2. **They will handle**:
   - Infrastructure setup
   - SSL/TLS certificates
   - Backups and monitoring
   - Access control

3. **You maintain**:
   - Source code in this repository
   - Documentation
   - User support

## Option 4: Self-Hosted (Internal Network)

### Using Python

```bash
# Simple HTTP server (development only)
python -m http.server 8080
```

### Using Node.js

```bash
# Install http-server
npm install -g http-server

# Run server
http-server -p 8080
```

### Using Docker

Create `Dockerfile`:

```dockerfile
FROM nginx:latest
COPY . /usr/share/nginx/html/
EXPOSE 80
```

Build and run:

```bash
docker build -t fpa-dashboard .
docker run -p 8080:80 fpa-dashboard
```

Access at `http://localhost:8080`

## Security Checklist

- [ ] No hardcoded credentials in code
- [ ] No sensitive data (SSNs, passwords) in sample data
- [ ] HTTPS enabled (if publicly accessible)
- [ ] Access controls configured (if behind login)
- [ ] Data handling complies with Walmart InfoSec policies
- [ ] No PII retention after session ends (confirmed in code)

## Performance Optimization

### For Puppy Pages Dashboard

1. **Minimize CSS**:
   ```bash
   # Using UglifyCSS or similar
   npx cleancss -o styles.min.css styles.css
   ```

2. **Minimize JavaScript**:
   ```bash
   # Using Terser
   npx terser app.js -o app.min.js
   npx terser import.js -o import.min.js
   ```

3. **Update HTML references**:
   ```html
   <link rel="stylesheet" href="styles.min.css?v=4">
   <script src="app.min.js?v=4"></script>
   <script src="import.min.js?v=3"></script>
   ```

### Lazy Load SheetJS

The dashboard already handles SheetJS CDN failure gracefully:

```javascript
<script src="https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js" 
        onerror="console.warn('SheetJS CDN blocked - import will use fallback');"></script>
```

## Monitoring & Maintenance

### Track Usage

Add analytics (optional):

```html
<!-- Google Analytics (if allowed by InfoSec) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### Update History

Maintain version tags:

```bash
git tag -a v3.0 -m "Released: Building Goal tracking"
git push origin v3.0
```

### Regular Updates

1. **Test file uploads** monthly with latest Office formats
2. **Verify accessibility** with screen readers (NVDA, JAWS)
3. **Check browser compatibility** (Chrome, Edge, Firefox, Safari)
4. **Update dependencies** (SheetJS library)

## Rollback Procedure

If an issue occurs:

```bash
# List releases
git tag

# Rollback to previous version
git checkout v2.0

# Or revert specific commit
git revert <commit-hash>

# Push changes
git push
```

## Support & Handoff

When handing off to another team:

1. **Provide**:
   - This deployment guide
   - README.md
   - EXCEL_FORMAT.md for data prep
   - Contact info for questions

2. **Document**:
   - Known limitations
   - Areas that need enhancement
   - Common issues and solutions

3. **Train**:
   - How to upload new reports
   - Troubleshooting steps
   - Accessing git repo for updates

---

**Next Steps**: Choose your deployment option and contact your Global Tech Partner or Code Puppy team for support.
