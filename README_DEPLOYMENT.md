# 🚀 PFSN Management System - Setup Complete

## For Employees (How to Use)

### First Time Setup
1. **Double-click**: `Launch PFSN App.vbs`
2. Browser opens automatically
3. App loads!

### Subsequent Times
- Just double-click `Launch PFSN App.vbs` anytime you want to use the app
- The server automatically starts in the background
- It closes when you close your browser

---

## What's Included

- ✅ `PFSN MANAGEMENT SYSTEM.html` - Main app file (you can rename this if needed)
- ✅ `Launch PFSN App.vbs` - One-click launcher (employees use this)
- ✅ `server.ps1` - Background server (runs automatically)
- ✅ `js/` folder - App logic (modular, easy to maintain)
- ✅ `css/` folder - Styling

---

## How It Works

1. Employee double-clicks `Launch PFSN App.vbs`
2. PowerShell starts a local HTTP server silently in background
3. Browser automatically opens to `http://localhost:8000`
4. App loads with full functionality

### If Browser Doesn't Open
- HTML file detects `file://` protocol and shows setup instructions
- Just run `START_SERVER.bat` manually or use PowerShell to start server

---

## For IT / SharePoint Admins

This app is **SharePoint-friendly**:
- ✅ All local files, no external dependencies (except Firebase)
- ✅ No installation required
- ✅ Works from any folder (local, OneDrive, SharePoint sync)
- ✅ No elevated permissions needed
- ✅ Can be deployed to shared folder and synced to desktops

**Requirements:**
- Windows with Python 3.x installed (most modern Windows has this)
- Browser (Edge, Chrome, Firefox - any will work)

**Optional: If Python isn't available on employee machines:**
- Use `START_SERVER.bat` instead (batch file version)
- Or pre-install Python via your deployment system

---

## Architecture

```
PFSN MANAGEMENT SYSTEM.html (main entry point)
├── Launch PFSN App.vbs (employee launcher)
├── server.ps1 (background HTTP server)
├── START_SERVER.bat (manual server start)
├── js/ (modular app code - easy to develop)
│   ├── app.js
│   ├── config.js
│   ├── ui.js
│   ├── db.js
│   └── ... 8 more modules
└── css/
    └── styles.css
```

---

## Troubleshooting

### App opens but shows spinning circle
- ✅ Normal - loading Firebase data (2-5 seconds)
- ✅ If it takes >10 seconds, check internet connection

### "Port already in use" error
- Server automatically tries port 8001, 8002, etc.
- Or: Close browser and re-run launcher

### Python not found
- Run `START_SERVER.bat` instead
- Or install Python from python.org

### Still issues?
- Press F12 in browser
- Check Console tab for error messages
- Share those messages for debugging

---

## Development Notes

The modular structure (`js/` folder) makes it easy to:
- Add new features
- Fix bugs
- Maintain code
- Test individual modules

Don't merge into a single file unless absolutely necessary - this architecture is optimal.

---

**Ready to deploy!** 🎉
