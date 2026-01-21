// Firebase Configuration
export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyAmALPaK8xqZceYwqX_koSnoGnkX8PjN-4",
    authDomain: "crm-scheduling-app.firebaseapp.com",
    projectId: "crm-scheduling-app",
    storageBucket: "crm-scheduling-app.firebasestorage.app",
    messagingSenderId: "716913774330",
    appId: "1:716913774330:web:e05002463c75277ace0343",
    measurementId: "G-XCBPN7G3EZ"
};

// Category Colors Configuration
export const CATEGORY_COLOURS = {
    'Installation': 0,
    'Survey': 120,
    'Remedial': 30,
    'Maintenance': 200,
    'Other': 50
};

// Default Specialisation Order
export const SPECIALISATION_ORDER = [
    "Fire Doors",
    "Fire Doors - Contractors",
    "Fire Stopping",
    "Fire Stopping - Contractors",
    "Contractor",
    "Office",
    "Warehouse",
    "Labourer"
];

// Default Categories
export const DEFAULT_CATEGORIES = [
    'FD - Installation',
    'FS - Installation',
    'FD - Survey',
    'FS - Survey',
    'FD - Maintenance',
    'FD - Other',
    'FS - Other',
    'Other'
];

// Excluded Categories for certain views
export const EXCLUDED_CATEGORIES = ['Scoping'];

// Default Equipment Classes for Quotations
export const DEFAULT_EQUIPMENT_CLASSES = [
    'Call out and Remedials',
    'Door Access',
    'Fire Compartmentation and Door survey',
    'Fire Compartmentation and Door Works',
    'Fire Compartmentation Survey',
    'Fire Door Remedials',
    'Fire Door Survey',
    'Fire Doors',
    'Fire Rated Hatch',
    'Fire Risk Assessment',
    'Fire Stopping',
    'Fire Stopping Remedials',
    'Fire Stopping Survey',
    'Fire Stopping Works',
    'Locks',
    'Loft Hatches',
    'Other'
];

// Default Customer Categories for Quotations
export const DEFAULT_CUSTOMER_CATEGORIES = [
    'Commercial',
    'Facilities',
    'Facilities Management',
    'Fire Authority',
    'Housing Association',
    'Leisure Centre',
    'Other',
    'Property Maintenance',
    'Property Management',
    'Religious Building',
    'Residential Construction',
    'Retirement Homes',
    'Security',
    'Sports Facility'
];

// Default Lead Sources for Quotations
export const DEFAULT_LEAD_SOURCES = [
    'Existing Customer',
    'Internet',
    'External',
    'Referral',
    'Cold Call',
    'Trade Show',
    'Social Media'
];

// Application State
export const appState = {
    currentDate: new Date(),
    engineers: [],
    jobs: [],
    absences: [],
    quotes: [],
    clients: [],
    suppliers: [],
    purchaseOrders: [],
    employees: [],
    categories: [],
    specialisations: [],
    customerCategories: [],
    equipmentClasses: [],
    leadSources: [],
    draggedJobInfo: null,
    currentJobNotes: [],
    currentQuoteNotes: [],
    currentView: 'home',
    currentClientId: null,
    currentSupplierId: null,
    currentPOId: null,
    currentEmployeeId: null,
    bankHolidays: new Map(),
    isInitialDataLoaded: { jobs: false, engineers: false, absences: false, settings: false, quotes: false, clients: false, suppliers: false, purchaseOrders: false, employees: false },
    forecastChartInstance: null,
    clientChartInstance: null
};
