# Module Reference Guide

## Complete API Documentation for All Modules

---

## 📦 config.js

### FIREBASE_CONFIG
```javascript
{
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  measurementId: "..."
}
```

### CATEGORY_COLOURS
```javascript
{
  'Installation': 0,
  'Survey': 120,
  'Remedial': 30,
  'Maintenance': 200,
  'Holiday': 280,
  'Other': 50
}
```

### SPECIALISATION_ORDER
Array of 8 specialisation types in display order

### DEFAULT_CATEGORIES
Array: `['Installation', 'Survey', 'Remedial', 'Maintenance', 'Holiday', 'Other']`

### appState
```javascript
{
  currentDate: Date,
  engineers: Array,
  jobs: Array,
  categories: Array,
  specialisations: Array,
  draggedJobInfo: Object | null,
  currentJobNotes: Array,
  currentView: String,
  bankHolidays: Map,
  isInitialDataLoaded: Object,
  forecastChartInstance: Chart | null,
  clientChartInstance: Chart | null
}
```

---

## 🛠️ utils.js

### formatDate(date)
```javascript
formatDate(new Date('2025-11-13'))
// Returns: '2025-11-13'
```

### parseDate(dateString)
```javascript
parseDate('2025-11-13')
// Returns: Date object for 2025-11-13 00:00:00
```

### diffDays(date1, date2)
```javascript
diffDays(new Date('2025-11-13'), new Date('2025-11-20'))
// Returns: 7
```

### dateOnly(dt)
```javascript
dateOnly(new Date())
// Returns: Timestamp at 00:00:00
```

### getWeekNumber(d)
```javascript
getWeekNumber(new Date('2025-11-13'))
// Returns: 46 (ISO week number)
```

### getDateOfISOWeek(w, y)
```javascript
getDateOfISOWeek(46, 2025)
// Returns: Date object for week 46 of 2025
```

### getColourByCategory(category, jobId)
```javascript
getColourByCategory('Installation', 'job123')
// Returns: { bgColour: 'hsl(...)', borderColour: 'hsl(...)' }
```

### fetchBankHolidays()
```javascript
await fetchBankHolidays()
// Returns: Map of date -> holiday name
```

### getSortedSpecialisations(engineers)
```javascript
getSortedSpecialisations(appState.engineers)
// Returns: Array sorted by SPECIALISATION_ORDER
```

---

## 💾 db.js

### initializeDatabase(firebaseData)
```javascript
initializeDatabase({
  db,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  setDoc,
  writeBatch
})
```

### listenForJobs(callback, errorCallback)
```javascript
listenForJobs(
  (jobs) => { appState.jobs = jobs; },
  (error) => { console.error(error); }
)
```

### listenForEngineers(callback, errorCallback)
```javascript
listenForEngineers(
  (engineers) => { appState.engineers = engineers; }
)
```

### listenForSettings(callback, errorCallback)
```javascript
listenForSettings(
  (settings) => {
    appState.categories = settings.categories;
    appState.specialisations = settings.specialisations;
  }
)
```

### addJob(jobData)
```javascript
await addJob({
  company: 'ABC Corp',
  site: 'Main Street',
  category: 'Installation',
  engineerIds: ['eng1', 'eng2'],
  startDate: '2025-11-13',
  endDate: '2025-11-15',
  cost: '1500',
  jobNo: 'JOB001',
  po: 'PO123',
  notes: [],
  isScheduled: true,
  allowWeekendWork: false,
  isCompleted: false
})
```

### updateJob(jobId, jobData)
```javascript
await updateJob('job123', { isCompleted: true })
```

### deleteJob(jobId)
```javascript
await deleteJob('job123')
```

### addEngineer(engineerData)
```javascript
await addEngineer({
  name: 'John Smith',
  type: 'Fire Doors'
})
// Auto-sets: isActive: true
```

### updateEngineer(engineerId, engineerData)
```javascript
await updateEngineer('eng123', { name: 'Jane Doe' })
```

### updateSettings(field, value)
```javascript
await updateSettings('categories', ['Installation', 'Survey', ...])
await updateSettings('specialisations', ['Fire Doors', ...])
```

---

## 🎨 ui.js

### getDOMElements()
```javascript
const dom = getDOMElements()
// Returns: Object with all cached DOM elements
// Properties: loadingSpinner, landingPage, jobModal, etc.
```

### openModal(modal)
```javascript
openModal(dom.jobModal)
// Shows modal with fade-in animation
```

### closeModal(modal)
```javascript
closeModal(dom.jobModal)
// Hides modal with fade-out animation
```

### showAlert(dom, message, showCancel)
```javascript
const confirmed = await showAlert(
  dom,
  'Are you sure?',
  true  // show cancel button
)
// Returns: true if OK clicked, false if Cancel
```

### populateEngineerOptions(dom, engineers, selectedIds)
```javascript
populateEngineerOptions(dom, appState.engineers, ['eng1'])
// Populates #jobEngineers select element
```

### populateCategoryOptions(dom, categories, selected)
```javascript
populateCategoryOptions(dom, appState.categories, 'Installation')
// Populates #jobCategory select element
```

### populateSpecialisationOptions(dom, specialisations, selected)
```javascript
populateSpecialisationOptions(dom, appState.specialisations, 'Fire Doors')
// Populates #engineerType select element
```

### renderNotes(dom, notesArray)
```javascript
renderNotes(dom, [
  { text: 'Note 1', timestamp: '2025-11-13T10:00:00Z' },
  { text: 'Note 2', timestamp: '2025-11-13T11:00:00Z' }
])
// Renders notes to #notesList
```

---

## 📅 schedule.js

### renderSchedule(dom, state, bankHolidays)
```javascript
renderSchedule(dom, appState, appState.bankHolidays)
// Renders complete schedule grid
// Supports week and month views
```

### createJobCard(job)
```javascript
const card = createJobCard({
  id: 'job123',
  company: 'ABC Corp',
  site: 'Main Street',
  category: 'Installation',
  isScheduled: true,
  allowWeekendWork: false
})
// Returns: DOM element (div)
```

---

## 🎯 dragdrop.js

### addDragAndDropListeners(state)
```javascript
addDragAndDropListeners(appState)
// Sets up all drag and drop event handlers
// - Job cards become draggable
// - Drop zones accept jobs
// - Updates job schedule on drop
```

---

## 🏠 landing.js

### renderLandingPage(dom, state, dateOnlyFn, parseDate, openJobModal)
```javascript
renderLandingPage(
  dom,
  appState,
  dateOnly,
  parseDate,
  openJobModal
)
// Renders:
// - Financial summary (invoiced & expected)
// - Work in progress jobs
// - Unscheduled jobs
```

---

## 📊 forecast.js

### renderForecastChart(dom, state)
```javascript
renderForecastChart(dom, appState)
// Renders:
// - Forecast table (53 weeks)
// - Weekly totals row
// - Monthly totals bar chart
// - Auto-scrolls to current week
```

---

## 👥 clientinfo.js

### renderClientInfoPage(dom, state, parseDateFn, openJobModal)
```javascript
renderClientInfoPage(dom, appState, parseDate, openJobModal)
// Renders:
// - Client selector dropdown
// - Category filter dropdown
// - Date range filter
// - Jobs table
// - Monthly totals chart
```

### updateClientInfoView(dom, state, parseDateFn, openJobModal)
```javascript
updateClientInfoView(dom, appState, parseDate, openJobModal)
// Updates view based on current filter selections
// Called when filters change
```

---

## ⚙️ settings.js

### renderSettingsLists(dom, state, updateSettings, showAlert)
```javascript
renderSettingsLists(dom, appState, updateSettings, showAlert)
// Renders:
// - Categories list with edit/delete
// - Specialisations list with edit/delete
// - Engineers list with toggle active/inactive
```

### switchSettingsTab(dom, activeTab)
```javascript
switchSettingsTab(dom, clickedButton)
// Switches between:
// - Categories panel
// - Specialisations panel
// - Engineers panel
```

### renderEditableList(dom, key, dataArray, listElement, field, updateSettings, showAlert)
```javascript
renderEditableList(
  dom,
  'category',
  appState.categories,
  dom.categoryList,
  'categories',
  updateSettings,
  showAlert
)
// Renders list with edit and delete buttons
```

### renderEngineersInSettings(dom, state, updateSettings, showAlert)
```javascript
renderEngineersInSettings(dom, appState, updateSettings, showAlert)
// Renders engineer list with:
// - Edit button
// - Toggle active/inactive button
```

---

## 🎮 app.js

### Main Entry Point
```javascript
// Initializes:
// 1. Firebase SDK
// 2. Database listeners
// 3. Event listeners
// 4. View rendering
```

### Key Internal Functions

#### setupViewNavigationListeners()
- Sets up click handlers for view buttons
- Handles date navigation (prev/next)
- Logo click for home

#### switchView(view, setDate)
```javascript
switchView('week')        // Go to week view
switchView('forecast')    // Go to forecast view
switchView('clientInfo')  // Go to client info
switchView('landing')     // Go to landing page
```

#### renderCurrentView()
- Main render dispatcher
- Shows/hides containers based on currentView
- Calls appropriate render function

#### openJobModal(jobId)
```javascript
openJobModal('job123')
// Opens job editor modal
// Pre-populates with job data
// Shows delete/complete buttons if editing
```

#### setupFormListeners()
- Job form submit handler
- Engineer form submit handler
- Delete and complete buttons
- Settings forms (category/specialisation add)

#### setupModalListeners()
- Modal open handlers (Add Job, Add Engineer, Settings)
- Modal close handlers
- Click-outside-to-close handlers

---

## 🔄 Data Flow

```
index.html
    ↓
app.js (loads modules)
    ↓
├─ Firebase init
├─ DB listeners
├─ Event listeners setup
│
├─ listenForJobs → update appState.jobs → renderCurrentView()
├─ listenForEngineers → update appState.engineers → renderCurrentView()
├─ listenForSettings → update appState.categories/specialisations → renderCurrentView()
│
└─ User interactions
    ├─ View switch → switchView() → renderCurrentView()
    ├─ Form submit → DB operation → listener updates state
    ├─ Drag & drop → updateJob() → listener updates state
    └─ Modal actions → DB operation → listener updates state
```

---

## 🔗 Import Examples

```javascript
// In app.js
import { formatDate, parseDate } from './utils.js'
import { listenForJobs, updateJob } from './db.js'
import { openModal, showAlert } from './ui.js'
import { renderSchedule } from './schedule.js'
import { addDragAndDropListeners } from './dragdrop.js'
import { renderLandingPage } from './landing.js'
import { renderForecastChart } from './forecast.js'
import { renderClientInfoPage, updateClientInfoView } from './clientinfo.js'
import { renderSettingsLists, switchSettingsTab } from './settings.js'
```

---

**All modules follow ES6 standard export syntax.**
**Functions are pure when possible for testability.**
**State mutations are tracked through appState object.**
