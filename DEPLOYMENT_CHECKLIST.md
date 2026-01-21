# 📋 Deployment Checklist

## ✅ Files to KEEP (For Production)

Required for employees:
- ✅ `Launch PFSN App.vbs` - Launcher (ONLY FILE EMPLOYEES CLICK)
- ✅ `PFSN MANAGEMENT SYSTEM.html` - Main app
- ✅ `server.ps1` - Background server
- ✅ `START_SERVER.bat` - Manual fallback
- ✅ `js/` folder - All app modules
- ✅ `css/` folder - Styling

---

## ❌ Files to DELETE (Development/Debug Only)

These are not needed in production and can clutter SharePoint:

### Debug & Testing Files
- ❌ `DEBUG_HELPER.html` - Debug console (development only)
- ❌ `Gemini Test_2409.html` - Old test file (replaced by PFSN MANAGEMENT SYSTEM.html)

### Documentation & Scripts (Optional - can keep if helpful)
- ❌ `HOW_TO_RUN.md` - Already covered in deployment guide
- ❌ `QUICK_START.md` - Dev notes
- ❌ `QUICK_START_FIXED.md` - Dev notes
- ❌ `LOAD_FIX_SUMMARY.md` - Dev notes
- ❌ `SOLUTION_COMPLETE.md` - Dev notes
- ❌ `IMPLEMENTATION_SUMMARY.md` - Dev notes
- ❌ `MODULE_REFERENCE.md` - Dev notes
- ❌ `REFACTORING_GUIDE.md` - Dev notes
- ❌ `START_SERVER.ps1` - Use START_SERVER.bat instead
- ❌ `VERIFY_FILES.ps1` - Dev verification script

### Other Files (Usually Pre-Existing)
- ❌ `.firebaserc` - Firebase config (keep in Git only)
- ❌ `.git/` - Git history (don't sync to SharePoint)
- ❌ `.gitignore` - Git config
- ❌ `code.txt` - Unknown purpose
- ❌ `firebase.json` - Firebase config
- ❌ `404.html` - Not needed
- ❌ `index.html` - Old entry point
- ❌ `PAMS V150/` - Old project
- ❌ `WORKING DOCS/` - Temp folder
- ❌ `Azure Deployment Plan.docx` - Old planning doc

---

## 📁 Final Production Folder Structure

```
PFSN Team Schedule/
├── Launch PFSN App.vbs         ← EMPLOYEES CLICK THIS
├── PFSN MANAGEMENT SYSTEM.html
├── README_DEPLOYMENT.md         ← Help for IT
├── server.ps1
├── START_SERVER.bat
├── js/
│   ├── app.js
│   ├── config.js
│   ├── ui.js
│   ├── db.js
│   ├── schedule.js
│   ├── landing.js
│   ├── forecast.js
│   ├── clientinfo.js
│   ├── settings.js
│   ├── dragdrop.js
│   └── utils.js
└── css/
    └── styles.css
```

---

## 🚀 Deployment Steps

1. **Clean the folder**: Delete all ❌ files listed above
2. **Verify structure**: Should only have files listed in "Final Production"
3. **Upload to SharePoint**: Copy entire folder to shared location
4. **Sync to desktops**: Employees sync folder to their OneDrive
5. **Done!** - Employees just double-click `Launch PFSN App.vbs`

---

## ℹ️ Note for IT

If employees encounter issues:
- Most common: First run takes a few seconds to start server
- Solution: Wait 5 seconds or manually run `START_SERVER.bat`
- Requires: Python 3.x (usually pre-installed on modern Windows)

All app data syncs to Firebase, so no local data storage concerns.

---

**Ready for production!** 🎉
