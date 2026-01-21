# PFS Network Team Schedule - Code Refactoring Guide

## Overview
Your monolithic HTML file has been successfully refactored into a modular, maintainable project structure. This guide explains the new organization and how to use it.

## New Project Structure

```
NEW DEVELOPMENT/
├── index.html                    # Main HTML file (replaces Gemini Test_2409.html)
├── css/
│   └── styles.css               # All CSS styles
├── js/
│   ├── app.js                   # Main application orchestrator
│   ├── config.js                # Configuration & constants
│   ├── utils.js                 # Utility functions (date, colors, etc.)
│   ├── db.js                    # Database operations & Firebase setup
│   ├── ui.js                    # DOM utilities & modal handling
│   ├── schedule.js              # Schedule rendering logic
│   ├── dragdrop.js              # Drag and drop functionality
│   ├── landing.js               # Landing page rendering
│   ├── forecast.js              # Forecast chart rendering
│   ├── clientinfo.js            # Client info page rendering
│   └── settings.js              # Settings management
```

## File Descriptions

### `index.html`
- Clean HTML structure with all modals and containers
- Only external script: `./js/app.js` (module)
- Stylesheet reference: `./css/styles.css`
- No embedded JavaScript or styles

### `css/styles.css`
- All CSS from the original `<style>` tag
- Custom scrollbar styling
- Job card animations
- Modal transitions
- Forecast table styles
- Calendar day highlighting

### `js/config.js`
- Firebase configuration
- Category colors mapping
- Default categories and specialisations
- Specialisation order
- Application state object
- Excluded categories list

### `js/utils.js`
- `formatDate()` - Format dates as YYYY-MM-DD
- `parseDate()` - Parse date strings to Date objects
- `diffDays()` - Calculate difference between dates
- `dateOnly()` - Get date without time
- `getWeekNumber()` - Get ISO week number
- `getDateOfISOWeek()` - Get date from week number
- `getColourByCategory()` - Generate colors for jobs
- `fetchBankHolidays()` - Fetch UK bank holidays
- `getSortedSpecialisations()` - Sort specialisations

### `js/db.js`
- `initializeDatabase()` - Setup Firebase references
- `listenForJobs()` - Real-time jobs listener
- `listenForEngineers()` - Real-time engineers listener
- `listenForSettings()` - Real-time settings listener
- `addJob()`, `updateJob()`, `deleteJob()` - Job operations
- `addEngineer()`, `updateEngineer()` - Engineer operations
- `updateSettings()` - Settings operations

### `js/ui.js`
- `getDOMElements()` - Cache all DOM elements
- `openModal()`, `closeModal()` - Modal handling
- `showAlert()` - Show alert dialogs
- `populateEngineerOptions()` - Populate engineer dropdown
- `populateCategoryOptions()` - Populate category dropdown
- `populateSpecialisationOptions()` - Populate specialisation dropdown
- `renderNotes()` - Render job notes

### `js/schedule.js`
- `renderSchedule()` - Main schedule rendering
- `createJobCard()` - Create individual job card elements
- Date range calculation for week/month views
- Engineer and specialisation grouping

### `js/dragdrop.js`
- `addDragAndDropListeners()` - Setup drag and drop
- Job card drag handlers
- Drop zone handlers
- Job rescheduling logic

### `js/landing.js`
- `renderLandingPage()` - Landing page with WIP and unscheduled jobs
- Financial calculations for invoiced and expected months
- Job card rendering for unscheduled items

### `js/forecast.js`
- `renderForecastChart()` - Forecast table and chart
- Weekly totals calculation
- Monthly forecasting
- Chart.js integration

### `js/clientinfo.js`
- `renderClientInfoPage()` - Client financial overview
- `updateClientInfoView()` - Handle client filters
- Client jobs table rendering
- Monthly totals chart

### `js/settings.js`
- `renderSettingsLists()` - Settings UI rendering
- `switchSettingsTab()` - Tab navigation in settings
- `renderEditableList()` - Editable list items
- `renderEngineersInSettings()` - Engineer management

### `js/app.js`
- Main application entry point
- Firebase initialization
- Event listener setup
- View switching logic
- Form handling
- Data listener coordination

## How to Use

### 1. Replace the Original File
- Delete `Gemini Test_2409.html`
- Use `index.html` as your main file

### 2. File Structure Setup
- Create the following directories in `NEW DEVELOPMENT`:
  - `css/`
  - `js/`
- Place files in their respective directories as shown above

### 3. Running the Application
- Open `index.html` in a web browser
- The application loads all modules automatically
- Firebase connection is established on load

## Module Dependencies

```
app.js (main)
├── config.js (constants, state)
├── utils.js (date, color utilities)
├── db.js (Firebase operations)
├── ui.js (DOM utilities)
├── schedule.js (calendar rendering)
├── dragdrop.js (drag operations)
├── landing.js (dashboard)
├── forecast.js (forecasting)
├── clientinfo.js (client view)
└── settings.js (settings management)
```

## Key Improvements

### 1. **Maintainability**
- Each module has a single responsibility
- Easier to locate and fix bugs
- Clear separation of concerns

### 2. **Scalability**
- Easy to add new features
- Modules can be tested independently
- Code reuse across modules

### 3. **Readability**
- Smaller, focused files
- Better code organization
- Clear function purposes

### 4. **Development Workflow**
- Easier for multiple developers
- Better version control diffs
- Simpler debugging

### 5. **Performance**
- Modules load independently
- Tree-shaking possible with build tools
- Better browser caching opportunities

## Adding New Features

### Example: Add a new view
1. Create `js/newview.js`
2. Export render function: `export const renderNewView = (dom, state) => {}`
3. Import in `app.js`: `import { renderNewView } from './newview.js'`
4. Add case to `renderCurrentView()` function
5. Add navigation button listener

### Example: Add a utility function
1. Add to appropriate module (utils.js, db.js, etc.)
2. Export the function: `export const myFunction = () => {}`
3. Import where needed: `import { myFunction } from './module.js'`

## Debugging

### Check browser console
- Open Developer Tools (F12)
- Check Console tab for errors
- Check Network tab for Firebase issues

### Common Issues
- **Module not found**: Check file paths are correct
- **Firebase error**: Verify configuration in `config.js`
- **Functions undefined**: Ensure proper exports/imports

## Future Improvements

Consider these enhancements:
1. Add build process (Webpack, Vite, Parcel)
2. Implement unit testing (Jest, Vitest)
3. Add TypeScript for type safety
4. Create component library for reusable UI elements
5. Implement state management (Redux, Zustand)
6. Add error boundary for better error handling
7. Implement analytics tracking

## Migration Notes

- All original functionality is preserved
- Firebase configuration remains the same
- HTML structure is identical
- CSS styling is unchanged
- Database operations are equivalent
- No breaking changes to user interface

## Support

If you encounter any issues:
1. Check file paths are correct
2. Verify Firebase configuration
3. Check browser console for errors
4. Ensure all files are in correct directories
5. Verify module imports/exports match file names
