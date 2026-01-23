console.log('[APP] Starting imports...');

import { FIREBASE_CONFIG, appState, SPECIALISATION_ORDER, DEFAULT_CATEGORIES, EXCLUDED_CATEGORIES, DEFAULT_CUSTOMER_CATEGORIES, DEFAULT_EQUIPMENT_CLASSES, DEFAULT_LEAD_SOURCES } from './config.js';
console.log('[APP] ✓ config imported');
import { formatDate, parseDate, dateOnly, fetchBankHolidays } from './utils.js';
console.log('[APP] ✓ utils imported');
import {
    getDOMElements,
    openModal,
    closeModal,
    showAlert,
    populateEngineerOptions,
    populateCategoryOptions,
    populateSpecialisationOptions,
    renderNotes
} from './ui.js';
console.log('[APP] ✓ ui imported');
import {
    initializeDatabase,
    listenForJobs,
    listenForEngineers,
    listenForAbsences,
    listenForSettings,
    listenForQuotes,
    listenForClients,
    listenForSuppliers,
    listenForPurchaseOrders,
    listenForEmployees,
    addJob,
    updateJob,
    deleteJob,
    addEngineer,
    updateEngineer,
    addAbsence,
    updateAbsence,
    deleteAbsence,
    updateSettings,
    addClient,
    updateClient,
    deleteClient,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    addEmployee,
    updateEmployee,
    deleteEmployee
} from './db.js';
console.log('[APP] ✓ db imported');
import { renderSchedule, renderOfficeSchedule, createJobCard, createAbsenceCard } from './schedule.js';
console.log('[APP] ✓ schedule imported');
import { renderLandingPage } from './landing.js';
import { 
    renderEmployeesPage, 
    renderEmployeePage,
    saveCertification, 
    deleteCertification 
} from './employees.js';
console.log('[APP] ✓ employees imported');
console.log('[APP] ✓ landing imported');
import { renderForecastChart } from './forecast.js';
console.log('[APP] ✓ forecast imported');
import { renderClientInfoPage, updateClientInfoView } from './clientinfo.js';
console.log('[APP] ✓ clientinfo imported');
import { renderSettingsLists, switchSettingsTab, renderEditableList, renderEngineersInSettings } from './settings.js';
console.log('[APP] ✓ settings imported');
import { renderOperationsJobs } from './operations.js';
console.log('[APP] ✓ operations imported');
import { renderClientsLog, renderClientPage } from './clients.js';
console.log('[APP] ✓ clients imported');
import { renderSuppliersLog, renderSupplierPage, generateSupplierNumber } from './suppliers.js';
console.log('[APP] ✓ suppliers imported');
import { renderPurchaseOrdersPage, updatePOMetrics, renderOpenPOs, renderAllPOs, populatePOSupplierFilter, generatePONumber, createLineItemHTML, generatePOPDF } from './purchaseorders.js';
console.log('[APP] ✓ purchaseorders imported');
import { getQuotes, renderQuotesTable, openQuoteModal, filterQuotes, addQuote, updateQuote, deleteQuote, generateQuoteNumber, renderQuoteNotes } from './quotes.js';
console.log('[APP] ✓ quotes imported');
import { addDragAndDropListeners } from './dragdrop.js';
console.log('[APP] ✓ dragdrop imported');

console.log('[APP] All modules imported successfully ✓');

console.log('[APP] All modules imported successfully ✓');

let dom = null;

// Helper to log to on-page debug console - MUST work synchronously
window.logUI = (msg) => {
    console.log('[logUI] Called with:', msg);
    const devConsole = document.getElementById('devConsole');
    console.log('[logUI] devConsole element:', devConsole);
    if (devConsole) {
        const line = document.createElement('div');
        line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        devConsole.appendChild(line);
        devConsole.scrollTop = devConsole.scrollHeight;
    }
    console.log(msg);
};

console.log('[APP] logUI function defined');
console.log('[APP] 🔧 App.js loaded, logUI ready');
console.log('[APP] First logUI call attempted');

document.addEventListener('DOMContentLoaded', async () => {
    // Show debug console
    const devConsole = document.getElementById('devConsole');
    if (devConsole) devConsole.style.display = 'block';
    
    try {
        window.logUI('🚀 Starting initialization...');
        console.log('[APP] Starting application initialization...');
        
        dom = getDOMElements();
        window.logUI(`✓ DOM cached`);
        if (!dom.loadingSpinner) {
            window.logUI('❌ ERROR: loadingSpinner not found!');
            console.error('[APP] ERROR: DOM not properly initialized. Loading spinner not found.');
            alert('ERROR: App initialization failed. Check browser console for details.');
            return;
        }
        window.logUI(`✓ All elements found`);
        console.log('[APP] DOM elements cached successfully');

        // Initialize Firebase
        console.log('[APP] Loading Firebase modules...');
        const firebaseModule = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
        const firestoreModule = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');
        const storageModule = await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js');
        console.log('[APP] Firebase modules loaded successfully');

    const app = firebaseModule.initializeApp(FIREBASE_CONFIG);
    const db = firestoreModule.getFirestore(app);
    const storage = storageModule.getStorage(app);

    const firebaseAPI = {
        db,
        storage,
        collection: firestoreModule.collection,
        doc: firestoreModule.doc,
        onSnapshot: firestoreModule.onSnapshot,
        addDoc: firestoreModule.addDoc,
        updateDoc: firestoreModule.updateDoc,
        deleteDoc: firestoreModule.deleteDoc,
        getDoc: firestoreModule.getDoc,
        setDoc: firestoreModule.setDoc,
        writeBatch: firestoreModule.writeBatch,
        query: firestoreModule.query,
        orderBy: firestoreModule.orderBy,
        // Storage functions
        storageRef: storageModule.ref,
        uploadBytes: storageModule.uploadBytes,
        getDownloadURL: storageModule.getDownloadURL,
        deleteObject: storageModule.deleteObject
    };

    initializeDatabase(firebaseAPI);

    // Fetch bank holidays
    appState.bankHolidays = await fetchBankHolidays();

    // Setup event listeners
    setupViewNavigationListeners();
    setupModalListeners();
    setupFormListeners();
    setupNotesListener();

    // Check initial load
    const checkInitialLoad = () => {
        if (appState.isInitialDataLoaded.jobs && appState.isInitialDataLoaded.engineers && appState.isInitialDataLoaded.settings) {
            console.log('[APP] All data loaded! Hiding spinner...');
            dom.loadingSpinner.style.display = 'none';
            renderCurrentView();
        } else {
            // Log what's still loading
            console.log('[APP] Waiting for data... Jobs:', appState.isInitialDataLoaded.jobs, 'Engineers:', appState.isInitialDataLoaded.engineers, 'Settings:', appState.isInitialDataLoaded.settings);
        }
    };

    // Show homepage with loading state
    console.log('[APP] Showing initial homepage...');
    const homePage = document.getElementById('homePage');
    if (homePage) {
        homePage.classList.remove('hidden');
        console.log('[APP] Homepage element found and shown');
    } else {
        console.error('[APP] Homepage element not found!');
    }
    dom.landingPage.classList.add('hidden');
    dom.schedulerPage.classList.add('hidden');
    dom.loadingSpinner.style.display = 'flex';
    
    // Set initial view to home
    appState.currentView = 'home';
    
    // Render homepage immediately (even with no data)
    renderCurrentView();
    updateNavButtonStyles(appState.currentView);

    // Migration flags to prevent repeated execution
    let hasRunCategoryMigration = false;
    let hasRunHolidayDeletion = false;
    
    // Debounce mechanism to prevent multiple rapid renders
    let renderTimeout = null;
    const scheduleRender = () => {
        if (renderTimeout) clearTimeout(renderTimeout);
        renderTimeout = setTimeout(() => {
            if (appState.isInitialDataLoaded.jobs && 
                appState.isInitialDataLoaded.engineers && 
                appState.isInitialDataLoaded.absences && 
                appState.isInitialDataLoaded.settings) {
                console.log('[APP] Debounced render executing');
                renderCurrentView();
            }
        }, 100); // Wait 100ms to batch multiple listener fires
    };

    // Setup data listeners
    listenForJobs((jobs) => {
        window.logUI(`✓ Jobs loaded: ${jobs.length} items`);
        console.log('[APP] listenForJobs callback fired');
        appState.jobs = jobs;
        appState.isInitialDataLoaded.jobs = true;
        
        // MIGRATION TEMPORARILY DISABLED TO PREVENT QUOTA ISSUES
        // Uncomment only when you want to run one-time migrations
        
        /*
        // Migration: Update old job categories to new naming convention
        if (!hasRunCategoryMigration) {
            hasRunCategoryMigration = true;
            const categoryMigrations = [
                { old: 'Installation', new: 'FD - Installation' },
                { old: 'Maintenance', new: 'FD - Maintenance' },
                { old: 'Remedial', new: 'FD - Maintenance' }
            ];
            
            let migratedCount = 0;
            categoryMigrations.forEach(migration => {
                jobs.forEach(async (job) => {
                    if (job.category === migration.old) {
                        try {
                            await updateJob(job.id, { category: migration.new });
                            migratedCount++;
                        } catch (error) {
                            console.error(`Failed to migrate job ${job.id}:`, error);
                        }
                    }
                });
            });
            if (migratedCount > 0) {
                console.log(`[MIGRATION] Updated ${migratedCount} jobs to new category naming`);
            }
        }
        
        // Delete all Holiday jobs (now handled by absence system)
        if (!hasRunHolidayDeletion) {
            hasRunHolidayDeletion = true;
            let deletedCount = 0;
            jobs.forEach(async (job) => {
                if (job.category === 'Holiday') {
                    try {
                        await deleteJob(job.id);
                        deletedCount++;
                        console.log(`[MIGRATION] Deleted Holiday job ${job.id}`);
                    } catch (error) {
                        console.error(`Failed to delete Holiday job ${job.id}:`, error);
                    }
                }
            });
            if (deletedCount > 0) {
                console.log(`[MIGRATION] Deleted ${deletedCount} Holiday jobs (moved to absence system)`);
            }
        }
        */
        
        checkInitialLoad();
        scheduleRender();
    });

    listenForEngineers((engineers) => {
        window.logUI(`✓ Engineers loaded: ${engineers.length} items`);
        console.log('[APP] listenForEngineers callback fired');
        appState.engineers = engineers;
        appState.isInitialDataLoaded.engineers = true;
        checkInitialLoad();
        scheduleRender();
    });

    listenForAbsences((absences) => {
        window.logUI(`✓ Absences loaded: ${absences.length} items`);
        console.log('[APP] listenForAbsences callback fired');
        appState.absences = absences;
        appState.isInitialDataLoaded.absences = true;
        checkInitialLoad();
        scheduleRender();
    });

    listenForSettings((settings) => {
        window.logUI(`✓ Settings loaded`);
        console.log('[APP] listenForSettings callback fired');
        appState.categories = settings.categories;
        appState.specialisations = settings.specialisations;
        
        // Load quote settings from settings document
        appState.customerCategories = settings.customerCategories || [];
        appState.equipmentClasses = settings.equipmentClasses || [];
        appState.leadSources = settings.leadSources || [];
        
        // Initialize defaults if empty
        const needsQuoteDefaults = 
            appState.customerCategories.length === 0 ||
            appState.equipmentClasses.length === 0 ||
            appState.leadSources.length === 0;
        
        if (needsQuoteDefaults) {
            console.log('[INIT] Initializing default quote settings...');
            const updates = {};
            if (appState.customerCategories.length === 0) {
                updates.customerCategories = DEFAULT_CUSTOMER_CATEGORIES;
                appState.customerCategories = DEFAULT_CUSTOMER_CATEGORIES;
            }
            if (appState.equipmentClasses.length === 0) {
                updates.equipmentClasses = DEFAULT_EQUIPMENT_CLASSES;
                appState.equipmentClasses = DEFAULT_EQUIPMENT_CLASSES;
            }
            if (appState.leadSources.length === 0) {
                updates.leadSources = DEFAULT_LEAD_SOURCES;
                appState.leadSources = DEFAULT_LEAD_SOURCES;
            }
            
            // Batch update all quote settings
            Object.keys(updates).forEach(key => {
                updateSettings(key, updates[key]).catch(err => {
                    console.error(`[INIT] Failed to initialize ${key}:`, err);
                });
            });
        }
        
        // Migration: Update categories list to remove Holiday and ensure new categories exist
        const requiredCategories = ['FD - Installation', 'FS - Installation', 'FD - Survey', 'FS - Survey', 
                                     'FD - Maintenance', 'FD - Other', 'FS - Other', 'Other'];
        const currentCategories = settings.categories.filter(cat => cat !== 'Holiday'); // Remove Holiday
        const needsMigration = requiredCategories.some(cat => !currentCategories.includes(cat)) || 
                               settings.categories.includes('Holiday');
        
        if (needsMigration) {
            console.log('[MIGRATION] Updating categories (removing Holiday, adding new)...', settings.categories);
            // Merge existing (without Holiday) with required
            const updatedCategories = [...new Set([...currentCategories, ...requiredCategories])];
            updateSettings('categories', updatedCategories).then(() => {
                console.log('[MIGRATION] Updated categories list in Firebase');
                appState.categories = updatedCategories;
                populateCategoryOptions(dom, appState.categories);
            }).catch(err => {
                console.error('[MIGRATION] Failed to update categories:', err);
            });
        } else {
            // Populate categories even if no migration is needed
            populateCategoryOptions(dom, appState.categories);
        }
        
        appState.isInitialDataLoaded.settings = true;
        checkInitialLoad();
        scheduleRender();
    });
    
    listenForQuotes((quotes) => {
        window.logUI(`✓ Quotes loaded: ${quotes.length} items`);
        console.log('[APP] listenForQuotes callback fired');
        appState.quotes = quotes;
        appState.isInitialDataLoaded.quotes = true;
        checkInitialLoad();
        // Re-render quotes table if we're on the quotations view
        if (appState.currentView === 'quotations') {
            applyQuoteFilters();
        }
    });

    listenForClients((clients) => {
        window.logUI(`✓ Clients loaded: ${clients.length} items`);
        console.log('[APP] listenForClients callback fired');
        appState.clients = clients;
        appState.isInitialDataLoaded.clients = true;
        checkInitialLoad();
        scheduleRender();
    });

    listenForSuppliers((suppliers) => {
        window.logUI(`✓ Suppliers loaded: ${suppliers.length} items`);
        console.log('[APP] listenForSuppliers callback fired');
        appState.suppliers = suppliers;
        appState.isInitialDataLoaded.suppliers = true;
        checkInitialLoad();
        scheduleRender();
    });

    listenForPurchaseOrders((purchaseOrders) => {
        window.logUI(`✓ Purchase Orders loaded: ${purchaseOrders.length} items`);
        console.log('[APP] listenForPurchaseOrders callback fired');
        appState.purchaseOrders = purchaseOrders;
        appState.isInitialDataLoaded.purchaseOrders = true;
        checkInitialLoad();
        scheduleRender();
    });

    listenForEmployees((employees) => {
        window.logUI(`✓ Employees loaded: ${employees.length} items`);
        console.log('[APP] listenForEmployees callback fired');
        console.log('[APP] Employees data:', employees);
        appState.employees = employees;
        appState.isInitialDataLoaded.employees = true;
        checkInitialLoad();
        scheduleRender();
        
        // Auto-cleanup duplicates once
        if (!window.employeesCleanedUp && employees.length > 2) {
            window.employeesCleanedUp = true;
            setTimeout(() => cleanupDuplicateEmployees(), 2000);
        }
    });

    console.log('[APP] Application initialized successfully ✓');
    } catch (error) {
        console.error('[APP] FATAL ERROR during initialization:', error);
        console.error('[APP] Stack trace:', error.stack);
        if (dom && dom.loadingSpinner) {
            dom.loadingSpinner.style.display = 'none';
            dom.schedulerPage.style.display = 'block';
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'background:red;color:white;padding:20px;margin:20px;border-radius:5px;font-size:16px;';
            errorDiv.innerHTML = `
                <h2>⚠️ App Initialization Error</h2>
                <p><strong>Error:</strong> ${error.message}</p>
                <p><strong>Details:</strong> Check browser console (F12) for full error information</p>
                <p style="font-size:12px;margin-top:10px;">This typically means a JavaScript file failed to load or has a syntax error.</p>
            `;
            document.body.appendChild(errorDiv);
        } else {
            alert(`FATAL ERROR: ${error.message}\n\nCheck browser console (F12) for details.`);
        }
    }
});

// Navigation
const setupViewNavigationListeners = () => {
    window.logUI('Setting up listeners...');
    console.log('[LISTENERS] Setting up view navigation listeners...');
    
    // Homepage Section Navigation
    const navOperationsBtn = document.getElementById('navOperationsBtn');
    const navSalesBtn = document.getElementById('navSalesBtn');
    const navFinanceBtn = document.getElementById('navFinanceBtn');
    const navPurchasingBtn = document.getElementById('navPurchasingBtn');
    const navWarehouseBtn = document.getElementById('navWarehouseBtn');
    const navComplianceBtn = document.getElementById('navComplianceBtn');
    const navHRBtn = document.getElementById('navHRBtn');
    const navReportingBtn = document.getElementById('navReportingBtn');
    const navSettingsPageBtn = document.getElementById('navSettingsPageBtn');
    
    if (navOperationsBtn) navOperationsBtn.addEventListener('click', () => switchView('operations'));
    if (navSalesBtn) navSalesBtn.addEventListener('click', () => switchView('sales'));
    if (navFinanceBtn) navFinanceBtn.addEventListener('click', () => switchView('finance'));
    if (navPurchasingBtn) navPurchasingBtn.addEventListener('click', () => switchView('purchasing'));
    if (navWarehouseBtn) navWarehouseBtn.addEventListener('click', () => switchView('warehouse'));
    if (navComplianceBtn) navComplianceBtn.addEventListener('click', () => switchView('compliance'));
    if (navHRBtn) navHRBtn.addEventListener('click', () => switchView('hr'));
    if (navReportingBtn) navReportingBtn.addEventListener('click', () => switchView('reporting'));
    if (navSettingsPageBtn) navSettingsPageBtn.addEventListener('click', () => switchView('settingsPage'));
    
    // Operations Section Navigation
    const opsNavTeamScheduleBtn = document.getElementById('opsNavTeamScheduleBtn');
    const opsNavOfficeScheduleBtn = document.getElementById('opsNavOfficeScheduleBtn');
    const opsNavAddJobBtn = document.getElementById('opsNavAddJobBtn');
    const opsNavClientsBtn = document.getElementById('opsNavClientsBtn');
    if (opsNavTeamScheduleBtn) opsNavTeamScheduleBtn.addEventListener('click', () => switchView('week'));
    if (opsNavOfficeScheduleBtn) opsNavOfficeScheduleBtn.addEventListener('click', () => switchView('officeWeek'));
    if (opsNavClientsBtn) opsNavClientsBtn.addEventListener('click', () => switchView('clientsLog'));
    if (opsNavAddJobBtn) {
        opsNavAddJobBtn.addEventListener('click', () => {
            dom.jobForm.reset();
            appState.currentJobNotes = [];
            renderNotes(dom, appState.currentJobNotes);
            document.getElementById('jobIsScheduled').checked = true;
            document.getElementById('jobIsProject').checked = false;
            document.getElementById('jobIsAppointmentBased').checked = false;
            document.getElementById('jobId').value = '';
            dom.jobModal.querySelector('h2').textContent = 'Add New Job';
            dom.deleteJobBtn.classList.add('hidden');
            dom.completeJobBtn.classList.add('hidden');
            populateEngineerOptions(dom, appState.engineers);
            populateCategoryOptions(dom, appState.categories);
            loadApplicationsData([]);
            loadAppointmentsData([]);
            loadDailyExceptionsData([], '', '', []);
            openModal(dom.jobModal);
        });
    }
    
    // HR Section Navigation
    const hrNavAddAbsenceBtn = document.getElementById('hrNavAddAbsenceBtn');
    if (hrNavAddAbsenceBtn) hrNavAddAbsenceBtn.addEventListener('click', () => openAbsenceModal());
    
    // Team Schedule View Toggle
    const scheduleWeekViewBtn = document.getElementById('scheduleWeekViewBtn');
    const scheduleMonthViewBtn = document.getElementById('scheduleMonthViewBtn');
    if (scheduleWeekViewBtn) scheduleWeekViewBtn.addEventListener('click', () => switchView('week'));
    if (scheduleMonthViewBtn) scheduleMonthViewBtn.addEventListener('click', () => switchView('month'));
    
    // Office Schedule View Toggle
    const officeScheduleWeekViewBtn = document.getElementById('officeScheduleWeekViewBtn');
    const officeScheduleMonthViewBtn = document.getElementById('officeScheduleMonthViewBtn');
    if (officeScheduleWeekViewBtn) officeScheduleWeekViewBtn.addEventListener('click', () => switchView('officeWeek'));
    if (officeScheduleMonthViewBtn) officeScheduleMonthViewBtn.addEventListener('click', () => switchView('officeMonth'));
    
    // Sales Section Navigation
    const salesNavQuotationsBtn = document.getElementById('salesNavQuotationsBtn');
    const salesNavClientsBtn = document.getElementById('salesNavClientsBtn');
    
    if (salesNavQuotationsBtn) salesNavQuotationsBtn.addEventListener('click', () => switchView('quotations'));
    if (salesNavClientsBtn) salesNavClientsBtn.addEventListener('click', () => switchView('clientInfo'));
    
    // Finance Section Navigation
    const financeNavForecastBtn = document.getElementById('financeNavForecastBtn');
    if (financeNavForecastBtn) financeNavForecastBtn.addEventListener('click', () => switchView('forecast'));
    
    // Purchasing Section Navigation
    const purchasingNavPOsBtn = document.getElementById('purchasingNavPOsBtn');
    const purchasingNavSuppliersBtn = document.getElementById('purchasingNavSuppliersBtn');
    
    if (purchasingNavPOsBtn) purchasingNavPOsBtn.addEventListener('click', () => switchView('purchaseOrders'));
    if (purchasingNavSuppliersBtn) purchasingNavSuppliersBtn.addEventListener('click', () => switchView('suppliersLog'));
    
    // Compliance Section Navigation
    const complianceNavFireDoorsBtn = document.getElementById('complianceNavFireDoorsBtn');
    const complianceNavFireStoppingBtn = document.getElementById('complianceNavFireStoppingBtn');
    const complianceNavRegistersBtn = document.getElementById('complianceNavRegistersBtn');
    const backFromFireDoorsBtn = document.getElementById('backFromFireDoorsBtn');
    const backFromFireStoppingBtn = document.getElementById('backFromFireStoppingBtn');
    const backFromBMTradaRegistersBtn = document.getElementById('backFromBMTradaRegistersBtn');
    
    if (complianceNavFireDoorsBtn) complianceNavFireDoorsBtn.addEventListener('click', () => switchView('fireDoors'));
    if (complianceNavFireStoppingBtn) complianceNavFireStoppingBtn.addEventListener('click', () => switchView('fireStopping'));
    if (complianceNavRegistersBtn) complianceNavRegistersBtn.addEventListener('click', () => switchView('bmtradaRegisters'));
    if (backFromFireDoorsBtn) backFromFireDoorsBtn.addEventListener('click', () => switchView('compliance'));
    if (backFromFireStoppingBtn) backFromFireStoppingBtn.addEventListener('click', () => switchView('compliance'));
    if (backFromBMTradaRegistersBtn) backFromBMTradaRegistersBtn.addEventListener('click', () => switchView('compliance'));
    
    // HR Section Navigation
    const hrNavEmployeesBtn = document.getElementById('hrNavEmployeesBtn');
    const backFromEmployeesBtn = document.getElementById('backFromEmployeesBtn');
    const backFromEmployeeBtn = document.getElementById('backFromEmployeeBtn');
    const addEmployeeBtn = document.getElementById('addEmployeeBtn');
    const editEmployeeBtn = document.getElementById('editEmployeeBtn');
    const addCertificationBtn = document.getElementById('addCertificationBtn');
    
    if (hrNavEmployeesBtn) hrNavEmployeesBtn.addEventListener('click', () => switchView('employees'));
    if (backFromEmployeesBtn) backFromEmployeesBtn.addEventListener('click', () => switchView('hr'));
    if (backFromEmployeeBtn) backFromEmployeeBtn.addEventListener('click', () => switchView('employees'));
    if (addEmployeeBtn) addEmployeeBtn.addEventListener('click', () => openEmployeeModal());
    if (editEmployeeBtn) editEmployeeBtn.addEventListener('click', () => {
        if (appState.currentEmployeeId) {
            openEmployeeModal(appState.currentEmployeeId);
        }
    });
    if (addCertificationBtn) addCertificationBtn.addEventListener('click', () => {
        if (appState.currentEmployeeId) {
            openCertificationModal();
        }
    });
    
    // Settings button - goes to settings page
    if (dom.settingsBtn) {
        dom.settingsBtn.addEventListener('click', () => {
            console.log('[CLICK] Settings button clicked');
            switchView('settingsPage');
        });
    }

    // Date controls
    if (dom.prevBtn) {
        dom.prevBtn.addEventListener('click', () => {
            window.logUI('📌 Clicked: Prev');
            console.log('[CLICK] Prev button clicked');
            if (appState.currentView === 'week') appState.currentDate.setDate(appState.currentDate.getDate() - 7);
            else appState.currentDate.setMonth(appState.currentDate.getMonth() - 1);
            renderCurrentView();
        });
    }

    // Office Schedule Date controls
    const officePrevBtn = document.getElementById('officePrevBtn');
    const officeNextBtn = document.getElementById('officeNextBtn');
    if (officePrevBtn) {
        officePrevBtn.addEventListener('click', () => {
            console.log('[CLICK] Office Prev button clicked');
            if (appState.currentView === 'officeWeek') appState.currentDate.setDate(appState.currentDate.getDate() - 7);
            else appState.currentDate.setMonth(appState.currentDate.getMonth() - 1);
            renderCurrentView();
        });
    }
    if (officeNextBtn) {
        officeNextBtn.addEventListener('click', () => {
            console.log('[CLICK] Office Next button clicked');
            if (appState.currentView === 'officeWeek') appState.currentDate.setDate(appState.currentDate.getDate() + 7);
            else appState.currentDate.setMonth(appState.currentDate.getMonth() + 1);
            renderCurrentView();
        });
    }

    if (dom.nextBtn) {
        dom.nextBtn.addEventListener('click', () => {
            window.logUI('📌 Clicked: Next');
            console.log('[CLICK] Next button clicked');
            if (appState.currentView === 'week') appState.currentDate.setDate(appState.currentDate.getDate() + 7);
            else appState.currentDate.setMonth(appState.currentDate.getMonth() + 1);
            renderCurrentView();
        });
    }

    // Logo to home
    if (dom.logoToHome) {
        dom.logoToHome.addEventListener('click', () => {
            window.logUI('📌 Clicked: Logo');
            console.log('[CLICK] Logo clicked - going home');
            switchView('home');
        });
    }
    
    window.logUI('✓ Listeners ready');
    console.log('[LISTENERS] View navigation listeners setup complete ✓');
};

const switchView = (view, setDate = null) => {
    window.logUI(`→ switchView('${view}')`);
    console.log(`[SWITCH] Switching to view: ${view}`);
    appState.currentView = view;
    if (setDate) {
        appState.currentDate = new Date(setDate);
    } else if (view === 'week') {
        appState.currentDate = new Date();
    }

    renderCurrentView();
    updateNavButtonStyles(view);
};

const updateNavButtonStyles = (view) => {
    // Map view names to button ID prefixes
    const viewMap = {
        'week': 'Week',
        'month': 'Month',
        'forecast': 'Forecast',
        'quotations': 'Quotations',
        'clientInfo': 'ClientInfo'
    };
    
    const allNavButtons = [
        dom.navWeekViewBtn, dom.navMonthViewBtn, dom.navForecastViewBtn, dom.navQuotationsViewBtn, dom.navClientInfoViewBtn
    ];
    
    // Remove active style from all buttons
    allNavButtons.forEach(btn => {
        if (btn) {
            btn.classList.remove('bg-red-600', 'text-white');
            btn.classList.add('bg-gray-300', 'text-gray-800');
        }
    });

    // Add active style to current view button
    const viewPrefix = viewMap[view];
    const activeButtonId = `nav${viewPrefix}ViewBtn`;
    const activeBtn = document.getElementById(activeButtonId);
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-300', 'text-gray-800');
        activeBtn.classList.add('bg-red-600', 'text-white');
    }
};

const renderCurrentView = () => {
    const dataReady = appState.isInitialDataLoaded.jobs && appState.isInitialDataLoaded.engineers && appState.isInitialDataLoaded.settings;
    
    // Log render attempts to track efficiency
    const renderCount = window.renderCount || 0;
    window.renderCount = renderCount + 1;
    console.log(`[RENDER #${window.renderCount}] Rendering view: ${appState.currentView}, Data ready: ${dataReady}`);
    
    if (!dataReady) {
        console.warn(`[RENDER] Data not fully loaded yet. Jobs: ${appState.isInitialDataLoaded.jobs}, Engineers: ${appState.isInitialDataLoaded.engineers}, Settings: ${appState.isInitialDataLoaded.settings}`);
    }

    try {
        // Get all page elements
        const homePage = document.getElementById('homePage');
        const operationsPage = document.getElementById('operationsPage');
        const teamSchedulePage = document.getElementById('teamSchedulePage');
        const officeSchedulePage = document.getElementById('officeSchedulePage');
        const salesPage = document.getElementById('salesPage');
        const financePage = document.getElementById('financePage');
        const purchasingPage = document.getElementById('purchasingPage');
        const warehousePage = document.getElementById('warehousePage');
        const compliancePage = document.getElementById('compliancePage');
        const hrPage = document.getElementById('hrPage');
        const reportingPage = document.getElementById('reportingPage');
        
        // Views that should show schedule controls
        const scheduleViews = ['week', 'month'];
        const officeScheduleViews = ['officeWeek', 'officeMonth'];
        const showScheduleControls = scheduleViews.includes(appState.currentView);
        const showOfficeScheduleControls = officeScheduleViews.includes(appState.currentView);
        
        // Update view toggle buttons in team schedule
        const scheduleWeekViewBtn = document.getElementById('scheduleWeekViewBtn');
        const scheduleMonthViewBtn = document.getElementById('scheduleMonthViewBtn');
        if (scheduleWeekViewBtn && scheduleMonthViewBtn) {
            if (appState.currentView === 'week') {
                scheduleWeekViewBtn.classList.remove('bg-gray-300', 'text-gray-800');
                scheduleWeekViewBtn.classList.add('bg-purple-600', 'text-white');
                scheduleMonthViewBtn.classList.remove('bg-purple-600', 'text-white');
                scheduleMonthViewBtn.classList.add('bg-gray-300', 'text-gray-800');
            } else if (appState.currentView === 'month') {
                scheduleMonthViewBtn.classList.remove('bg-gray-300', 'text-gray-800');
                scheduleMonthViewBtn.classList.add('bg-purple-600', 'text-white');
                scheduleWeekViewBtn.classList.remove('bg-purple-600', 'text-white');
                scheduleWeekViewBtn.classList.add('bg-gray-300', 'text-gray-800');
            }
        }
        
        // Update view toggle buttons in office schedule
        const officeScheduleWeekViewBtn = document.getElementById('officeScheduleWeekViewBtn');
        const officeScheduleMonthViewBtn = document.getElementById('officeScheduleMonthViewBtn');
        if (officeScheduleWeekViewBtn && officeScheduleMonthViewBtn) {
            if (appState.currentView === 'officeWeek') {
                officeScheduleWeekViewBtn.classList.remove('bg-gray-300', 'text-gray-800');
                officeScheduleWeekViewBtn.classList.add('bg-blue-600', 'text-white');
                officeScheduleMonthViewBtn.classList.remove('bg-blue-600', 'text-white');
                officeScheduleMonthViewBtn.classList.add('bg-gray-300', 'text-gray-800');
            } else if (appState.currentView === 'officeMonth') {
                officeScheduleMonthViewBtn.classList.remove('bg-gray-300', 'text-gray-800');
                officeScheduleMonthViewBtn.classList.add('bg-blue-600', 'text-white');
                officeScheduleWeekViewBtn.classList.remove('bg-blue-600', 'text-white');
                officeScheduleWeekViewBtn.classList.add('bg-gray-300', 'text-gray-800');
            }
        }
        
        // Hide all pages
        if (homePage) homePage.classList.add('hidden');
        if (operationsPage) operationsPage.classList.add('hidden');
        if (teamSchedulePage) teamSchedulePage.classList.add('hidden');
        if (officeSchedulePage) officeSchedulePage.classList.add('hidden');
        if (salesPage) salesPage.classList.add('hidden');
        if (financePage) financePage.classList.add('hidden');
        if (purchasingPage) purchasingPage.classList.add('hidden');
        if (warehousePage) warehousePage.classList.add('hidden');
        if (compliancePage) compliancePage.classList.add('hidden');
        if (hrPage) hrPage.classList.add('hidden');
        if (reportingPage) reportingPage.classList.add('hidden');
        dom.landingPage.classList.add('hidden');
        dom.schedulerPage.classList.add('hidden');
        dom.clientInfoPage.classList.add('hidden');
        dom.quotationsPage.classList.add('hidden');
        dom.forecastContainer.classList.add('hidden');
        dom.scheduleBoard.classList.add('hidden');
        dom.settingsPage.classList.add('hidden');
        if (dom.clientsLogPage) dom.clientsLogPage.classList.add('hidden');
        if (dom.clientPage) dom.clientPage.classList.add('hidden');
        
        const purchaseOrdersPage = document.getElementById('purchaseOrdersPage');
        const suppliersLogPage = document.getElementById('suppliersLogPage');
        const supplierPage = document.getElementById('supplierPage');
        const fireDoorsPage = document.getElementById('fireDoorsPage');
        const fireStoppingPage = document.getElementById('fireStoppingPage');
        const bmtradaRegistersPage = document.getElementById('bmtradaRegistersPage');
        if (purchaseOrdersPage) purchaseOrdersPage.classList.add('hidden');
        if (suppliersLogPage) suppliersLogPage.classList.add('hidden');
        if (supplierPage) supplierPage.classList.add('hidden');
        if (fireDoorsPage) fireDoorsPage.classList.add('hidden');
        if (fireStoppingPage) fireStoppingPage.classList.add('hidden');
        if (bmtradaRegistersPage) bmtradaRegistersPage.classList.add('hidden');
        const employeesPage = document.getElementById('employeesPage');
        const employeePage = document.getElementById('employeePage');
        if (employeesPage) employeesPage.classList.add('hidden');
        if (employeePage) employeePage.classList.add('hidden');

        // Show appropriate page
        if (appState.currentView === 'home') {
            if (homePage) homePage.classList.remove('hidden');
            updateHomeOverview();
        } else if (appState.currentView === 'operations') {
            if (operationsPage) operationsPage.classList.remove('hidden');
                // Render operations jobs lists
                renderOperationsJobs(dom, appState, window.openJobModal || ((id) => window.openJobModalHandler?.(id)));
        } else if (appState.currentView === 'sales') {
            if (salesPage) salesPage.classList.remove('hidden');
        } else if (appState.currentView === 'finance') {
            if (financePage) financePage.classList.remove('hidden');
        } else if (appState.currentView === 'purchasing') {
            if (purchasingPage) purchasingPage.classList.remove('hidden');
        } else if (appState.currentView === 'warehouse') {
            if (warehousePage) warehousePage.classList.remove('hidden');
        } else if (appState.currentView === 'compliance') {
            if (compliancePage) compliancePage.classList.remove('hidden');
        } else if (appState.currentView === 'hr') {
            if (hrPage) hrPage.classList.remove('hidden');
        } else if (appState.currentView === 'reporting') {
            if (reportingPage) reportingPage.classList.remove('hidden');
        } else if (appState.currentView === 'landing') {
            renderLandingPage(dom, appState, dateOnly, parseDate, openJobModal);
            dom.landingPage.classList.remove('hidden');
        } else if (appState.currentView === 'settingsPage') {
            dom.settingsPage.classList.remove('hidden');
            renderSettingsLists(dom, appState, updateSettings, showAlert);
        } else if (appState.currentView === 'clientsLog') {
            if (dom.clientsLogPage) {
                dom.clientsLogPage.classList.remove('hidden');
                renderClientsLog(dom, appState, (clientId) => {
                    appState.currentClientId = clientId;
                    switchView('client');
                });
            }
        } else if (appState.currentView === 'client') {
            if (dom.clientPage && appState.currentClientId) {
                dom.clientPage.classList.remove('hidden');
                renderClientPage(dom, appState, appState.currentClientId, openJobModal);
            }
        } else if (appState.currentView === 'purchaseOrders') {
            const purchaseOrdersPage = document.getElementById('purchaseOrdersPage');
            if (purchaseOrdersPage) {
                purchaseOrdersPage.classList.remove('hidden');
                renderPurchaseOrdersPage();
            }
        } else if (appState.currentView === 'suppliersLog') {
            const suppliersLogPage = document.getElementById('suppliersLogPage');
            if (suppliersLogPage) {
                suppliersLogPage.classList.remove('hidden');
                renderSuppliersLog();
            }
        } else if (appState.currentView === 'supplier') {
            const supplierPage = document.getElementById('supplierPage');
            if (supplierPage && appState.currentSupplierId) {
                supplierPage.classList.remove('hidden');
                renderSupplierPage(appState.currentSupplierId);
            }
        } else if (appState.currentView === 'fireDoors') {
            const fireDoorsPage = document.getElementById('fireDoorsPage');
            if (fireDoorsPage) {
                fireDoorsPage.classList.remove('hidden');
            }
        } else if (appState.currentView === 'fireStopping') {
            const fireStoppingPage = document.getElementById('fireStoppingPage');
            if (fireStoppingPage) {
                fireStoppingPage.classList.remove('hidden');
            }
        } else if (appState.currentView === 'bmtradaRegisters') {
            const bmtradaRegistersPage = document.getElementById('bmtradaRegistersPage');
            if (bmtradaRegistersPage) {
                bmtradaRegistersPage.classList.remove('hidden');
            }
        } else if (appState.currentView === 'employees') {
            const employeesPage = document.getElementById('employeesPage');
            if (employeesPage) {
                employeesPage.classList.remove('hidden');
                renderEmployeesPage();
            }
        } else if (appState.currentView === 'employee') {
            const employeePage = document.getElementById('employeePage');
            if (employeePage && appState.currentEmployeeId) {
                employeePage.classList.remove('hidden');
                renderEmployeePage(appState.currentEmployeeId);
            }
        } else if (dataReady) {
            // Show scheduler views if data is ready
            if (scheduleViews.includes(appState.currentView)) {
                // Show team schedule page wrapper
                if (teamSchedulePage) teamSchedulePage.classList.remove('hidden');
            }
            
            if (officeScheduleViews.includes(appState.currentView)) {
                // Show office schedule page wrapper
                if (officeSchedulePage) officeSchedulePage.classList.remove('hidden');
            }
            
            dom.schedulerPage.classList.remove('hidden');
            if (appState.currentView === 'forecast') {
                dom.forecastContainer.classList.remove('hidden');
                renderForecastChart(dom, appState);
            } else if (appState.currentView === 'clientInfo') {
                dom.clientInfoPage.classList.remove('hidden');
                renderClientInfoPage(dom, appState, parseDate, openJobModal);
            } else if (appState.currentView === 'quotations') {
                dom.quotationsPage.classList.remove('hidden');
                renderQuotesTable(appState.quotes, appState);
            } else if (officeScheduleViews.includes(appState.currentView)) {
                // Render office schedule with custom DOM elements
                dom.scheduleBoard.classList.remove('hidden');
                const officeDom = {
                    scheduleGrid: dom.scheduleGrid,
                    currentDateRange: document.getElementById('officeCurrentDateRange')
                };
                // Update appState view to 'week' or 'month' for internal rendering logic
                const tempView = appState.currentView;
                appState.currentView = appState.currentView === 'officeWeek' ? 'week' : 'month';
                renderOfficeSchedule(officeDom, appState, appState.bankHolidays);
                appState.currentView = tempView;
                addDragAndDropListeners(appState, openJobModal, openAbsenceModal);
            } else {
                dom.scheduleBoard.classList.remove('hidden');
                renderSchedule(dom, appState, appState.bankHolidays);
                addDragAndDropListeners(appState, openJobModal, openAbsenceModal);
            }
        } else {
            // Show home page if data not ready
            console.log('[RENDER] Data not ready, showing home page instead');
            if (homePage) {
                homePage.classList.remove('hidden');
                updateHomeOverview();
            }
        }
        console.log(`[RENDER] View rendered successfully ✓`);
    } catch (error) {
        console.error(`[RENDER] Error rendering view:`, error);
    }
};

const updateHomeOverview = () => {
    const homeWIPCount = document.getElementById('homeWIPCount');
    const homeScheduledCount = document.getElementById('homeScheduledCount');
    const homePendingQuotesCount = document.getElementById('homePendingQuotesCount');
    
    if (homeWIPCount) {
        const wipJobs = appState.jobs.filter(j => j.status && j.status.toLowerCase().includes('progress'));
        homeWIPCount.textContent = wipJobs.length;
    }
    
    if (homeScheduledCount) {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const scheduledJobs = appState.jobs.filter(j => {
            if (!j.startDate) return false;
            const startDate = parseDate(j.startDate);
            return startDate >= today && startDate <= nextWeek;
        });
        homeScheduledCount.textContent = scheduledJobs.length;
    }
    
    if (homePendingQuotesCount) {
        const pendingQuotes = appState.quotes.filter(q => q.status === 'Pending');
        homePendingQuotesCount.textContent = pendingQuotes.length;
    }
};

const renderScheduleWrapper = () => {
    renderSchedule(dom, appState, appState.bankHolidays);
    addDragAndDropListeners(appState, openJobModal, openAbsenceModal);
};

// Modals and Forms
const setupModalListeners = () => {
    [dom.cancelJobBtn, dom.cancelEngineerBtn, dom.closeSettingsBtn, dom.alertOkBtn, dom.alertCancelBtn].forEach(btn => 
        btn?.addEventListener('click', () => closeModal(btn.closest('.modal-backdrop')))
    );

    // Remove backdrop click-to-close for job modal to prevent accidental data loss
    // Only allow explicit close buttons
    [dom.engineerModal, dom.alertModal].forEach(modal => 
        modal?.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        })
    );
    
    // Add close button handler for job modal
    document.getElementById('closeJobModalBtn')?.addEventListener('click', () => {
        closeModal(dom.jobModal);
    });
    
    // Quote modal close handlers
    document.getElementById('closeQuoteModalBtn')?.addEventListener('click', () => {
        closeModal(dom.quoteModal);
    });
    
    document.getElementById('cancelQuoteBtn')?.addEventListener('click', () => {
        closeModal(dom.quoteModal);
    });
    
    // Prevent backdrop click-to-close for quote modal
    dom.quoteModal?.addEventListener('click', (e) => {
        if (e.target === dom.quoteModal) {
            // Don't close on backdrop click
        }
    });

    // Client modal close handlers
    dom.closeClientModalBtn?.addEventListener('click', () => {
        closeModal(dom.clientModal);
    });
    
    dom.cancelClientBtn?.addEventListener('click', () => {
        closeModal(dom.clientModal);
    });
    
    // Prevent backdrop click-to-close for client modal
    dom.clientModal?.addEventListener('click', (e) => {
        if (e.target === dom.clientModal) {
            // Don't close on backdrop click
        }
    });
    
    // Client modal - toggle parent selector and finance sections
    document.getElementById('clientIsInvoicing')?.addEventListener('change', (e) => {
        const isInvoicing = e.target.checked;
        const companyNameWrapper = document.getElementById('clientCompanyNameWrapper');
        const siteNameWrapper = document.getElementById('clientSiteNameWrapper');
        const companySiteRow = document.getElementById('clientCompanySiteRow');
        
        document.getElementById('clientParentSection').classList.toggle('hidden', isInvoicing);
        document.getElementById('clientBillingSection').classList.toggle('hidden', !isInvoicing);
        document.getElementById('clientFinanceSection').classList.toggle('hidden', !isInvoicing);
        
        if (isInvoicing) {
            // Invoicing client - show company name, hide parent
            document.getElementById('clientParent').value = '';
            if (companyNameWrapper) companyNameWrapper.classList.remove('hidden');
            if (companySiteRow) companySiteRow.classList.remove('md:grid-cols-1');
            if (companySiteRow) companySiteRow.classList.add('md:grid-cols-2');
            document.getElementById('clientCompanyName').value = '';
            document.getElementById('clientCompanyName').required = true;
        } else {
            // Site - company name will come from parent selection
            document.getElementById('clientCompanyName').required = false;
        }
    });
    
    // Client parent dropdown - auto-fill company name from parent
    document.getElementById('clientParent')?.addEventListener('change', (e) => {
        const parentId = e.target.value;
        const companyNameWrapper = document.getElementById('clientCompanyNameWrapper');
        const companySiteRow = document.getElementById('clientCompanySiteRow');
        
        if (parentId) {
            const parent = appState.clients.find(c => c.id === parentId);
            if (parent) {
                // Hide company name field and make site name full width
                document.getElementById('clientCompanyName').value = parent.companyName;
                if (companyNameWrapper) companyNameWrapper.classList.add('hidden');
                if (companySiteRow) companySiteRow.classList.remove('md:grid-cols-2');
                if (companySiteRow) companySiteRow.classList.add('md:grid-cols-1');
                
                // Auto-select parent's category
                const categorySelect = document.getElementById('clientCategory');
                if (categorySelect && parent.category) {
                    categorySelect.value = parent.category;
                }
            }
        } else {
            // No parent selected - show company name field
            if (companyNameWrapper) companyNameWrapper.classList.remove('hidden');
            if (companySiteRow) companySiteRow.classList.remove('md:grid-cols-1');
            if (companySiteRow) companySiteRow.classList.add('md:grid-cols-2');
            document.getElementById('clientCompanyName').value = '';
        }
    });
    
    // Add Client button
    dom.addClientBtn?.addEventListener('click', () => {
        openClientModal();
    });
    
    // Certification modal close handlers
    dom.closeCertificationModalBtn?.addEventListener('click', () => {
        closeModal(dom.certificationModal);
    });
    
    dom.cancelCertificationBtn?.addEventListener('click', () => {
        closeModal(dom.certificationModal);
    });
    
    // Back to clients button
    dom.backToClientsBtn?.addEventListener('click', () => {
        switchView('clientsLog');
    });
    
    // Client page tab switching
    dom.clientTabDetails?.addEventListener('click', () => switchClientTab('details'));
    dom.clientTabFinance?.addEventListener('click', () => switchClientTab('finance'));
    dom.clientTabScheduled?.addEventListener('click', () => switchClientTab('scheduled'));
    dom.clientTabActivity?.addEventListener('click', () => switchClientTab('activity'));
    
    // Client page action buttons (event delegation since they're dynamically rendered)
    dom.clientPage?.addEventListener('click', async (e) => {
        const editBtn = e.target.closest('#editClientBtn');
        const toggleActiveBtn = e.target.closest('#toggleClientActiveBtn');
        const addJobBtn = e.target.closest('#addClientJobBtn');
        const addServiceBtn = e.target.closest('#addScheduledServiceBtn');
        const addActivityBtn = e.target.closest('#addActivityNoteBtn');
        
        if (editBtn) {
            // Get current client from page
            const clientId = appState.currentClientId;
            if (clientId) {
                openClientModal(clientId);
            }
        } else if (toggleActiveBtn) {
            const clientId = appState.currentClientId;
            const client = appState.clients.find(c => c.id === clientId);
            if (client) {
                try {
                    await updateClient(clientId, { isActive: !client.isActive });
                } catch (error) {
                    console.error('Error toggling client active status:', error);
                    await showAlert(dom, 'Error updating client. Please try again.');
                }
            }
        } else if (addJobBtn) {
            const clientId = appState.currentClientId;
            const client = appState.clients.find(c => c.id === clientId);
            if (client) {
                // Pre-fill job modal with client details
                await openJobModal(null, { 
                    company: client.companyName,
                    site: client.siteName || ''
                });
                openModal(dom.jobModal);
            }
        } else if (addServiceBtn) {
            // Show the add service form
            const form = document.getElementById('addServiceForm');
            if (form) {
                form.classList.remove('hidden');
                document.getElementById('serviceFrequency').value = '';
                document.getElementById('serviceLastDate').value = '';
                document.getElementById('serviceLastQuote').value = '';
            }
        } else if (e.target.closest('#saveServiceBtn')) {
            // Save scheduled service
            const clientId = appState.currentClientId;
            const client = appState.clients.find(c => c.id === clientId);
            const frequency = document.getElementById('serviceFrequency').value;
            const lastDate = document.getElementById('serviceLastDate').value;
            const lastQuote = document.getElementById('serviceLastQuote').value;
            
            if (!frequency) {
                await showAlert(dom, 'Please select a frequency.');
                return;
            }
            
            if (client) {
                const scheduledServices = client.scheduledServices || [];
                
                // Calculate next due date based on frequency and last completed date
                let nextDueDate = null;
                if (lastDate) {
                    const lastCompleted = new Date(lastDate);
                    const monthsToAdd = frequency === '3-Month' ? 3 : frequency === '6-Month' ? 6 : 12;
                    nextDueDate = new Date(lastCompleted);
                    nextDueDate.setMonth(nextDueDate.getMonth() + monthsToAdd);
                }
                
                scheduledServices.push({
                    frequency,
                    lastCompletedDate: lastDate || null,
                    nextDueDate: nextDueDate ? nextDueDate.toISOString().split('T')[0] : null,
                    lastQuoteValue: lastQuote || null,
                    status: 'Active',
                    createdAt: new Date().toISOString()
                });
                
                try {
                    await updateClient(clientId, { scheduledServices });
                    document.getElementById('addServiceForm').classList.add('hidden');
                } catch (error) {
                    console.error('Error adding scheduled service:', error);
                    await showAlert(dom, 'Error adding service. Please try again.');
                }
            }
        } else if (e.target.closest('#cancelServiceBtn')) {
            // Cancel adding service
            document.getElementById('addServiceForm')?.classList.add('hidden');
        } else if (addActivityBtn) {
            const clientId = appState.currentClientId;
            const client = appState.clients.find(c => c.id === clientId);
            const noteInput = document.getElementById('newActivityNote');
            
            if (client && noteInput && noteInput.value.trim()) {
                const activityLog = client.activityLog || [];
                activityLog.push({
                    note: noteInput.value.trim(),
                    timestamp: new Date().toISOString()
                });
                
                try {
                    await updateClient(clientId, { activityLog });
                    noteInput.value = '';
                } catch (error) {
                    console.error('Error adding activity note:', error);
                    await showAlert(dom, 'Error adding note. Please try again.');
                }
            }
        }
    });

    dom.settingsBtn.addEventListener('click', () => {
        openSettingsPage();
    });

    document.getElementById('closeSettingsPageBtn')?.addEventListener('click', () => {
        closeSettingsPage();
    });

    document.getElementById('categoriesNavBtn')?.addEventListener('click', () => switchSettingsSection('categories'));
    document.getElementById('specialisationsNavBtn')?.addEventListener('click', () => switchSettingsSection('specialisations'));
    document.getElementById('engineersNavBtn')?.addEventListener('click', () => switchSettingsSection('engineers'));
    
    // Quote settings navigation
    document.getElementById('customerCategoriesNavBtn')?.addEventListener('click', () => switchSettingsSection('customerCategories'));
    document.getElementById('equipmentClassesNavBtn')?.addEventListener('click', () => switchSettingsSection('equipmentClasses'));
    document.getElementById('leadSourcesNavBtn')?.addEventListener('click', () => switchSettingsSection('leadSources'));
    
    // Add Quote button
    dom.addQuoteBtn?.addEventListener('click', async () => {
        await openQuoteModal(null, appState);
        openModal(dom.quoteModal);
    });
    
    // Quote status change listener - auto-populate actual close date when Won
    document.getElementById('quoteStatus')?.addEventListener('change', (e) => {
        const actualCloseDateField = document.getElementById('quoteActualCloseDate');
        if (e.target.value === 'Won' && !actualCloseDateField.value) {
            actualCloseDateField.value = new Date().toISOString().split('T')[0];
        }
    });

    dom.clientSelector?.addEventListener('change', () => updateClientInfoView(dom, appState, parseDate, openJobModal));
    dom.clientWorkTypeFilter?.addEventListener('change', () => updateClientInfoView(dom, appState, parseDate, openJobModal));
    dom.clientCategoryFilter?.addEventListener('change', () => updateClientInfoView(dom, appState, parseDate, openJobModal));
    dom.clientDateFilter?.addEventListener('change', () => updateClientInfoView(dom, appState, parseDate, openJobModal));
    
    // Quote filters
    document.getElementById('filterQuoteStatus')?.addEventListener('change', applyQuoteFilters);
    document.getElementById('filterQuoteManager')?.addEventListener('input', applyQuoteFilters);
    document.getElementById('filterQuoteCompany')?.addEventListener('input', applyQuoteFilters);
    document.getElementById('filterQuoteDateFrom')?.addEventListener('change', applyQuoteFilters);
    document.getElementById('filterQuoteDateTo')?.addEventListener('change', applyQuoteFilters);
    
    // Employee filters
    document.getElementById('employeeSearch')?.addEventListener('input', () => {
        if (appState.currentView === 'employees') {
            renderEmployeesPage();
        }
    });
    document.getElementById('employeeTypeFilter')?.addEventListener('change', () => {
        if (appState.currentView === 'employees') {
            renderEmployeesPage();
        }
    });
    document.getElementById('employeeRoleFilter')?.addEventListener('change', () => {
        if (appState.currentView === 'employees') {
            renderEmployeesPage();
        }
    });
    
    // Project checkbox toggle
    document.getElementById('jobIsProject')?.addEventListener('change', (e) => {
        const applicationsSection = document.getElementById('applicationsSection');
        if (e.target.checked) {
            applicationsSection.classList.remove('hidden');
            if (document.getElementById('applicationsList').children.length === 0) {
                addApplicationItem();
            }
        } else {
            applicationsSection.classList.add('hidden');
        }
    });
    
    // Add application button
    document.getElementById('addApplicationBtn')?.addEventListener('click', () => {
        addApplicationItem();
    });
    
    // Add exception button
    document.getElementById('addExceptionBtn')?.addEventListener('click', () => {
        const dateSelect = document.getElementById('exceptionDate');
        const engineerSelect = document.getElementById('exceptionEngineer');
        
        if (!dateSelect.value || !engineerSelect.value) {
            showAlert(dom, 'Please select both a date and an engineer');
            return;
        }
        
        const currentExceptions = getDailyExceptionsData();
        
        // Check if exception already exists
        const exists = currentExceptions.some(e => 
            e.date === dateSelect.value && e.engineerId === engineerSelect.value
        );
        
        if (exists) {
            showAlert(dom, 'This exception already exists');
            return;
        }
        
        currentExceptions.push({
            date: dateSelect.value,
            engineerId: engineerSelect.value,
            reason: ''
        });
        
        const jobStartDate = document.getElementById('jobStartDate').value;
        const jobEndDate = document.getElementById('jobEndDate').value;
        const engineerIds = Array.from(document.getElementById('jobEngineers').selectedOptions).map(opt => opt.value);
        
        loadDailyExceptionsData(currentExceptions, jobStartDate, jobEndDate, engineerIds);
        
        // Reset selections
        dateSelect.value = '';
        engineerSelect.value = '';
    });
    
    // Update exceptions when date range or engineers change
    ['jobStartDate', 'jobEndDate', 'jobEngineers'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', () => {
            const currentExceptions = getDailyExceptionsData();
            const jobStartDate = document.getElementById('jobStartDate').value;
            const jobEndDate = document.getElementById('jobEndDate').value;
            const engineerIds = Array.from(document.getElementById('jobEngineers').selectedOptions).map(opt => opt.value);
            loadDailyExceptionsData(currentExceptions, jobStartDate, jobEndDate, engineerIds);
        });
    });
    
    // === Supplier & Purchase Order Event Listeners ===
    
    // Back buttons for purchasing pages
    document.getElementById('backFromPOsBtn')?.addEventListener('click', () => switchView('purchasing'));
    document.getElementById('backFromSuppliersBtn')?.addEventListener('click', () => switchView('purchasing'));
    document.getElementById('backFromSupplierBtn')?.addEventListener('click', () => switchView('suppliersLog'));
    
    // Create buttons
    document.getElementById('createPOBtn')?.addEventListener('click', () => openPOModal());
    document.getElementById('createSupplierBtn')?.addEventListener('click', () => openSupplierModal());
    
    // Edit/delete supplier from supplier page
    document.getElementById('editSupplierBtn')?.addEventListener('click', () => {
        if (appState.currentSupplierId) {
            openSupplierModal(appState.currentSupplierId);
        }
    });
    
    document.getElementById('deleteSupplierBtn')?.addEventListener('click', async () => {
        if (appState.currentSupplierId) {
            const supplier = appState.suppliers.find(s => s.id === appState.currentSupplierId);
            if (supplier && confirm(`Delete supplier "${supplier.company}"? This cannot be undone.`)) {
                try {
                    await deleteSupplier(appState.currentSupplierId);
                    switchView('suppliersLog');
                } catch (error) {
                    console.error('Error deleting supplier:', error);
                    await showAlert(dom, 'Error deleting supplier. Please try again.');
                }
            }
        }
    });
    
    // PO tab switching
    document.getElementById('openPOsTab')?.addEventListener('click', () => {
        document.getElementById('openPOsTab').classList.add('text-green-600', 'border-green-600');
        document.getElementById('openPOsTab').classList.remove('text-gray-500');
        document.getElementById('allPOsTab').classList.remove('text-green-600', 'border-green-600');
        document.getElementById('allPOsTab').classList.add('text-gray-500');
        document.getElementById('openPOsContent').classList.remove('hidden');
        document.getElementById('allPOsContent').classList.add('hidden');
    });
    
    document.getElementById('allPOsTab')?.addEventListener('click', () => {
        document.getElementById('allPOsTab').classList.add('text-green-600', 'border-green-600');
        document.getElementById('allPOsTab').classList.remove('text-gray-500');
        document.getElementById('openPOsTab').classList.remove('text-green-600', 'border-green-600');
        document.getElementById('openPOsTab').classList.add('text-gray-500');
        document.getElementById('allPOsContent').classList.remove('hidden');
        document.getElementById('openPOsContent').classList.add('hidden');
    });
    
    // PO filters
    document.getElementById('poFilterStatus')?.addEventListener('change', () => renderAllPOs());
    document.getElementById('poFilterSupplier')?.addEventListener('change', () => renderAllPOs());
    
    // Supplier modal close/cancel
    document.getElementById('closeSupplierModalBtn')?.addEventListener('click', () => closeModal(document.getElementById('supplierModal')));
    document.getElementById('cancelSupplierBtn')?.addEventListener('click', () => closeModal(document.getElementById('supplierModal')));
    
    // PO modal close/cancel
    document.getElementById('closePOModalBtn')?.addEventListener('click', () => closeModal(document.getElementById('poModal')));
    document.getElementById('cancelPOBtn')?.addEventListener('click', () => closeModal(document.getElementById('poModal')));
    
    // Add line item button
    document.getElementById('addLineItemBtn')?.addEventListener('click', () => {
        const lineItemsContainer = document.getElementById('poLineItems');
        const currentLines = lineItemsContainer.children.length;
        lineItemsContainer.insertAdjacentHTML('beforeend', createLineItemHTML(currentLines));
        updateLineItemListeners();
    });
    
    // Quick add supplier button from PO modal
    document.getElementById('quickAddSupplierBtn')?.addEventListener('click', async () => {
        const supplierName = prompt('Enter supplier company name:');
        if (supplierName && supplierName.trim()) {
            try {
                const docRef = await addSupplier({ company: supplierName.trim(), isActive: true });
                // Wait a moment for listener to fire and update appState
                setTimeout(() => {
                    // Repopulate supplier dropdown in PO modal
                    const supplierSelect = document.getElementById('poSupplier');
                    if (supplierSelect) {
                        const currentValue = supplierSelect.value;
                        supplierSelect.innerHTML = '<option value="">-- Select Supplier --</option>';
                        appState.suppliers
                            .filter(s => s.isActive)
                            .sort((a, b) => a.company.localeCompare(b.company))
                            .forEach(s => {
                                const option = document.createElement('option');
                                option.value = s.id;
                                option.textContent = s.company;
                                supplierSelect.appendChild(option);
                            });
                        // Try to select the newly added supplier if we can find it
                        const newSupplier = appState.suppliers.find(s => s.company === supplierName.trim());
                        if (newSupplier) {
                            supplierSelect.value = newSupplier.id;
                        }
                    }
                }, 500);
            } catch (error) {
                console.error('Error adding supplier:', error);
                await showAlert(dom, 'Error adding supplier. Please try again.');
            }
        }
    });
    
    // Save supplier note button
    document.addEventListener('click', async (e) => {
        if (e.target.closest('#saveSupplierNoteBtn')) {
            const noteField = document.getElementById('supplierActivityNote');
            const note = noteField?.value.trim();
            
            if (!note) {
                await showAlert(dom, 'Please enter a note.');
                return;
            }
            
            if (!appState.currentSupplierId) return;
            
            const supplier = appState.suppliers.find(s => s.id === appState.currentSupplierId);
            if (!supplier) return;
            
            const activityLog = supplier.activityLog || [];
            activityLog.push({
                note: note,
                timestamp: new Date(),
                user: 'System' // Could be replaced with actual user when auth is implemented
            });
            
            try {
                await updateSupplier(appState.currentSupplierId, { activityLog });
                noteField.value = '';
            } catch (error) {
                console.error('Error saving supplier note:', error);
                await showAlert(dom, 'Error saving note. Please try again.');
            }
        }
    });
    
    // Supplier form submission
    document.getElementById('supplierForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const supplierId = document.getElementById('supplierId').value;
        
        const supplierData = {
            company: document.getElementById('supplierCompany').value,
            contact: document.getElementById('supplierContact').value,
            phone: document.getElementById('supplierPhone').value,
            email: document.getElementById('supplierEmail').value,
            address1: document.getElementById('supplierAddress1').value,
            address2: document.getElementById('supplierAddress2').value,
            address3: document.getElementById('supplierAddress3').value,
            county: document.getElementById('supplierCounty').value,
            postcode: document.getElementById('supplierPostcode').value,
            accountNumber: document.getElementById('supplierAccountNumber').value,
            paymentTerms: document.getElementById('supplierPaymentTerms').value,
            isActive: document.getElementById('supplierIsActive').checked,
            notes: document.getElementById('supplierNotes').value
        };
        
        try {
            if (supplierId) {
                await updateSupplier(supplierId, supplierData);
            } else {
                await addSupplier(supplierData);
            }
            closeModal(document.getElementById('supplierModal'));
        } catch (error) {
            console.error('Error saving supplier:', error);
            await showAlert(dom, 'Error saving supplier. Please try again.');
        }
    });
    
    // PO form submission
    document.getElementById('poForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const poId = document.getElementById('poId').value;
        
        // Collect line items
        const lineItems = [];
        const lineElements = document.querySelectorAll('.line-item');
        lineElements.forEach(line => {
            const qty = parseFloat(line.querySelector('.line-qty').value);
            const desc = line.querySelector('.line-description').value;
            const price = parseFloat(line.querySelector('.line-price').value);
            if (desc && qty > 0) {
                lineItems.push({
                    quantity: qty,
                    description: desc,
                    unitPrice: price,
                    total: qty * price
                });
            }
        });
        
        const totalAmount = lineItems.reduce((sum, item) => sum + item.total, 0);
        
        const poData = {
            poNumber: document.getElementById('poNumber').value,
            supplierId: document.getElementById('poSupplier').value,
            jobId: document.getElementById('poJob').value,
            poDate: document.getElementById('poDate').value,
            status: document.getElementById('poStatus').value,
            lineItems: lineItems,
            totalAmount: totalAmount,
            notes: document.getElementById('poNotes').value
        };
        
        try {
            if (poId) {
                await updatePurchaseOrder(poId, poData);
            } else {
                await addPurchaseOrder(poData);
            }
            closeModal(document.getElementById('poModal'));
        } catch (error) {
            console.error('Error saving purchase order:', error);
            await showAlert(dom, 'Error saving purchase order. Please try again.');
        }
    });
    
    // Employee form submission
    const employeeForm = document.getElementById('employeeForm');
    if (employeeForm) {
        console.log('[APP] Setting up employee form listener');
        // Remove any existing listeners by cloning the form
        const newEmployeeForm = employeeForm.cloneNode(true);
        employeeForm.parentNode.replaceChild(newEmployeeForm, employeeForm);
        
        // Re-attach button listeners after cloning (cloning removes all event listeners)
        document.getElementById('closeEmployeeModalBtn')?.addEventListener('click', () => {
            closeModal(dom.employeeModal);
        });
        
        document.getElementById('cancelEmployeeBtn')?.addEventListener('click', () => {
            closeModal(dom.employeeModal);
        });
        
        newEmployeeForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('[APP] Employee form submitted');
            const employeeId = document.getElementById('employeeId').value;
            
            const employeeData = {
                firstName: document.getElementById('employeeFirstName').value,
                lastName: document.getElementById('employeeLastName').value,
                dateOfBirth: document.getElementById('employeeDOB').value,
                niNumber: document.getElementById('employeeNINumber').value,
                email: document.getElementById('employeeEmail').value,
                phone: document.getElementById('employeePhone').value,
                homeTel: document.getElementById('employeeHomeTel').value,
                address: document.getElementById('employeeAddress').value,
                city: document.getElementById('employeeCity').value,
                postcode: document.getElementById('employeePostcode').value,
                employmentType: document.getElementById('employeeType').value,
                role: document.getElementById('employeeRole').value,
                startDate: document.getElementById('employeeStartDate').value,
                payrollNumber: document.getElementById('employeePayrollNumber').value,
                emergencyContactName: document.getElementById('employeeEmergencyName').value,
                emergencyContactRelationship: document.getElementById('employeeEmergencyRelationship').value,
                emergencyContactAddress: document.getElementById('employeeEmergencyAddress').value,
                emergencyContactPhone: document.getElementById('employeeEmergencyPhone').value,
                bankAddress: document.getElementById('employeeBankAddress').value,
                accountName: document.getElementById('employeeAccountName').value,
                sortCode: document.getElementById('employeeSortCode').value,
                accountNumber: document.getElementById('employeeAccountNumber').value,
                employeeStatement: document.querySelector('input[name="employeeStatement"]:checked')?.value || '',
                studentLoan: document.getElementById('employeeStudentLoan').checked
            };
            
            console.log('[APP] Employee data:', employeeData);
            
            try {
                if (employeeId) {
                    await updateEmployee(employeeId, employeeData);
                    closeModal(dom.employeeModal);
                    if (appState.currentView === 'employee') {
                        renderEmployeePage(employeeId);
                    } else {
                        switchView('employees');
                    }
                } else {
                    await addEmployee(employeeData);
                    closeModal(dom.employeeModal);
                    switchView('employees');
                }
            } catch (error) {
                console.error('Error saving employee:', error);
                closeModal(dom.employeeModal);
                await showAlert(dom, 'Error saving employee. Please try again.');
            }
        });
    } else {
        console.error('[APP] Employee form not found!');
    }
    
    document.getElementById('deleteEmployeeBtn')?.addEventListener('click', async () => {
        const employeeId = document.getElementById('employeeId').value;
        if (employeeId && await showAlert(dom, 'Are you sure you want to delete this employee?', true)) {
            try {
                await deleteEmployee(employeeId);
                closeModal(dom.employeeModal);
                switchView('employees');
            } catch (error) {
                console.error('Error deleting employee:', error);
                closeModal(dom.employeeModal);
                await showAlert(dom, 'Error deleting employee. Please try again.');
            }
        }
    });
    
    // Certification form submission
    const certificationForm = document.getElementById('certificationForm');
    if (certificationForm) {
        console.log('[APP] Setting up certification form listener');
        certificationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('[APP] Certification form submitted');
            
            if (!appState.currentEmployeeId) {
                await showAlert(dom, 'Error: No employee selected.');
                return;
            }
            
            try {
                // Show loading spinner on modal (not full page)
                const modalSpinner = document.getElementById('certificationModalSpinner');
                if (modalSpinner) modalSpinner.style.display = 'flex';
                
                // Handle file upload first if present
                let uploadedFileURL = null;
                const fileInput = document.getElementById('certificationFile');
                if (fileInput && fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    
                    // Validate file size (10MB max)
                    if (file.size > 10 * 1024 * 1024) {
                        if (modalSpinner) modalSpinner.style.display = 'none';
                        await showAlert(dom, 'File size must be less than 10MB');
                        return;
                    }
                    
                    console.log('[APP] Uploading certificate file:', file.name);
                    
                    const { getFirebaseAPI } = await import('./db.js');
                    const firebaseAPI = getFirebaseAPI();
                    
                    try {
                        // Create a storage reference
                        const timestamp = Date.now();
                        const fileName = `${timestamp}_${file.name}`;
                        const storageRef = firebaseAPI.storageRef(firebaseAPI.storage, `certifications/${appState.currentEmployeeId}/${fileName}`);
                        
                        // Upload file
                        console.log('[APP] Starting file upload...');
                        const uploadResult = await firebaseAPI.uploadBytes(storageRef, file);
                        console.log('[APP] Upload complete, getting download URL...');
                        
                        // Get download URL - wrap in its own try-catch
                        try {
                            uploadedFileURL = await firebaseAPI.getDownloadURL(storageRef);
                            console.log('[APP] File uploaded successfully, URL:', uploadedFileURL);
                        } catch (urlError) {
                            console.error('[APP] Error getting download URL:', urlError);
                            // Try to construct URL manually as fallback
                            const bucket = 'crm-scheduling-app.firebasestorage.app';
                            const encodedPath = encodeURIComponent(`certifications/${appState.currentEmployeeId}/${fileName}`);
                            uploadedFileURL = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media`;
                            console.log('[APP] Using fallback URL:', uploadedFileURL);
                        }
                    } catch (uploadError) {
                        console.error('[APP] File upload error:', uploadError);
                        if (modalSpinner) modalSpinner.style.display = 'none';
                        await showAlert(dom, `File upload failed: ${uploadError.message}`);
                        return;
                    }
                }
                
                const certificationData = {
                    name: document.getElementById('certificationName').value,
                    number: document.getElementById('certificationNumber').value,
                    issuer: document.getElementById('certificationIssuer').value,
                    dateObtained: document.getElementById('certificationDateObtained').value,
                    dateExpires: document.getElementById('certificationDateExpires').value,
                    comments: document.getElementById('certificationComments').value
                };
                
                // Only add fileURL if a file was uploaded (Firebase doesn't allow undefined)
                if (uploadedFileURL) {
                    certificationData.fileURL = uploadedFileURL;
                }
                
                console.log('[APP] Saving certification data:', certificationData);
                await saveCertification(appState.currentEmployeeId, certificationData, currentCertificationIndex);
                
                // Hide spinner and close modal
                if (modalSpinner) modalSpinner.style.display = 'none';
                closeModal(dom.certificationModal);
                
                // Clear file input
                if (fileInput) fileInput.value = '';
                
                // Refresh employee page
                renderEmployeePage(appState.currentEmployeeId);
            } catch (error) {
                console.error('[APP] Error in certification save process:', error);
                const modalSpinner = document.getElementById('certificationModalSpinner');
                if (modalSpinner) modalSpinner.style.display = 'none';
                await showAlert(dom, `Error: ${error.message || 'Failed to save certification. Please try again.'}`);
            }
        });
    } else {
        console.error('[APP] Certification form not found!');
    }
    
    document.getElementById('deleteCertificationBtn')?.addEventListener('click', async () => {
        if (!appState.currentEmployeeId || currentCertificationIndex === null) return;
        
        if (await showAlert(dom, 'Are you sure you want to delete this certification?', true)) {
            try {
                await deleteCertification(appState.currentEmployeeId, currentCertificationIndex);
                closeModal(dom.certificationModal);
                renderEmployeePage(appState.currentEmployeeId);
            } catch (error) {
                console.error('Error deleting certification:', error);
                closeModal(dom.certificationModal);
                await showAlert(dom, 'Error deleting certification. Please try again.');
            }
        }
    });
};

// Applications Management
const addApplicationItem = (appData = null) => {
    const list = document.getElementById('applicationsList');
    const appNumber = list.children.length + 1;
    
    const appItem = document.createElement('div');
    appItem.className = 'application-item';
    appItem.innerHTML = `
        <div class="application-number">App ${appNumber}</div>
        <input type="text" class="application-desc border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" 
               placeholder="Job No." value="${appData?.description || ''}" />
        <input type="date" class="application-date border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition" 
               value="${appData?.date || ''}" />
        <input type="number" class="application-cost border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition currency-input" 
               placeholder="£0.00" step="0.01" min="0" value="${appData?.cost || ''}" />
        <button type="button" class="remove-application-btn" onclick="this.closest('.application-item').remove(); updateApplicationNumbers();">
            Remove
        </button>
    `;
    list.appendChild(appItem);
};

const updateApplicationNumbers = () => {
    const items = document.querySelectorAll('.application-item');
    items.forEach((item, index) => {
        item.querySelector('.application-number').textContent = `App ${index + 1}`;
    });
};

window.updateApplicationNumbers = updateApplicationNumbers;

const getApplicationsData = () => {
    const items = document.querySelectorAll('.application-item');
    const applications = [];
    items.forEach((item, index) => {
        const description = item.querySelector('.application-desc').value.trim();
        const date = item.querySelector('.application-date').value;
        const cost = parseFloat(item.querySelector('.application-cost').value) || 0;
        if (description || cost > 0 || date) {
            applications.push({
                number: index + 1,
                description,
                date,
                cost
            });
        }
    });
    return applications;
};

const loadApplicationsData = (applications) => {
    const list = document.getElementById('applicationsList');
    list.innerHTML = '';
    if (applications && applications.length > 0) {
        applications.forEach(app => addApplicationItem(app));
        document.getElementById('applicationsSection').classList.remove('hidden');
    } else {
        document.getElementById('applicationsSection').classList.add('hidden');
    }
};

// Appointment Management Functions
const populateAppointmentEngineers = () => {
    const select = document.getElementById('appointmentEngineers');
    if (!select) return;
    
    select.innerHTML = '';
    appState.engineers
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(engineer => {
            const option = document.createElement('option');
            option.value = engineer.id;
            option.textContent = engineer.name;
            select.appendChild(option);
        });
};

const addAppointmentItem = (aptData = null) => {
    const dateInput = document.getElementById('appointmentDate');
    const engineersSelect = document.getElementById('appointmentEngineers');
    const notesInput = document.getElementById('appointmentNotes');
    const statusSelect = document.getElementById('appointmentStatus');
    
    let date, engineerIds, notes, status;
    
    if (aptData) {
        date = aptData.date;
        engineerIds = aptData.engineerIds || [];
        notes = aptData.notes || '';
        status = aptData.status || 'scheduled';
    } else {
        date = dateInput.value;
        engineerIds = Array.from(engineersSelect.selectedOptions).map(opt => opt.value);
        notes = notesInput.value.trim();
        status = statusSelect.value;
        
        if (!date || engineerIds.length === 0) {
            showAlert('Please select a date and at least one engineer');
            return;
        }
    }
    
    const list = document.getElementById('appointmentsList');
    const item = document.createElement('div');
    item.className = 'flex items-center justify-between bg-white p-3 rounded-lg border-2 border-purple-200';
    item.dataset.date = date;
    item.dataset.engineers = JSON.stringify(engineerIds);
    item.dataset.notes = notes;
    item.dataset.status = status;
    
    const engineerNames = engineerIds.map(id => {
        const eng = appState.engineers.find(e => e.id === id);
        return eng ? eng.name : 'Unknown';
    }).join(', ');
    
    const statusColors = {
        pending: 'bg-gray-100 text-gray-700',
        scheduled: 'bg-blue-100 text-blue-700',
        completed: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700'
    };
    
    const statusLabels = {
        pending: 'Pending',
        scheduled: 'Scheduled',
        completed: 'Completed',
        cancelled: 'Cancelled'
    };
    
    item.innerHTML = `
        <div class="flex-grow">
            <div class="font-medium text-gray-800">${formatDate(parseDate(date))}</div>
            <div class="text-sm text-gray-600">${engineerNames}</div>
            ${notes ? `<div class="text-sm text-purple-600 italic mt-1">${notes}</div>` : ''}
        </div>
        <div class="flex items-center space-x-2">
            <span class="px-2 py-1 text-xs font-semibold rounded ${statusColors[status]}">${statusLabels[status]}</span>
            <button type="button" class="text-red-600 hover:text-red-800 remove-appointment">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    item.querySelector('.remove-appointment').addEventListener('click', () => {
        item.remove();
    });
    
    list.appendChild(item);
    
    // Clear inputs if not loading data
    if (!aptData) {
        dateInput.value = '';
        engineersSelect.selectedIndex = -1;
        notesInput.value = '';
        statusSelect.value = 'scheduled';
    }
};

const getAppointmentsData = () => {
    const list = document.getElementById('appointmentsList');
    const appointments = [];
    list.querySelectorAll('[data-date]').forEach(item => {
        appointments.push({
            date: item.dataset.date,
            engineerIds: JSON.parse(item.dataset.engineers),
            notes: item.dataset.notes || '',
            status: item.dataset.status
        });
    });
    return appointments;
};

const loadAppointmentsData = (appointments) => {
    const list = document.getElementById('appointmentsList');
    list.innerHTML = '';
    if (appointments && appointments.length > 0) {
        populateAppointmentEngineers();
        appointments.forEach(apt => addAppointmentItem(apt));
        document.getElementById('appointmentsSection').classList.remove('hidden');
    } else {
        document.getElementById('appointmentsSection').classList.add('hidden');
    }
};

const loadDailyExceptionsData = (exceptions, jobStartDate, jobEndDate, engineerIds) => {
    const list = document.getElementById('dailyExceptionsList');
    const dateSelect = document.getElementById('exceptionDate');
    const engineerSelect = document.getElementById('exceptionEngineer');
    
    list.innerHTML = '';
    
    // Populate date dropdown with dates in job range
    dateSelect.innerHTML = '<option value="">Select Date</option>';
    if (jobStartDate && jobEndDate) {
        const start = parseDate(jobStartDate);
        const end = parseDate(jobEndDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = formatDate(d);
            const option = document.createElement('option');
            option.value = dateStr;
            option.textContent = new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
            dateSelect.appendChild(option);
        }
    }
    
    // Populate engineer dropdown
    engineerSelect.innerHTML = '<option value="">Select Engineer</option>';
    if (engineerIds && engineerIds.length > 0) {
        engineerIds.forEach(engId => {
            const engineer = appState.engineers.find(e => e.id === engId);
            if (engineer) {
                const option = document.createElement('option');
                option.value = engId;
                option.textContent = engineer.name;
                engineerSelect.appendChild(option);
            }
        });
    }
    
    // Display existing exceptions
    if (exceptions && exceptions.length > 0) {
        exceptions.forEach(exc => {
            const engineer = appState.engineers.find(e => e.id === exc.engineerId);
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between bg-orange-50 border border-orange-200 p-2 rounded';
            item.innerHTML = `
                <span class="text-sm">
                    <strong>${engineer ? engineer.name : 'Unknown'}</strong> - 
                    ${new Date(exc.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    ${exc.reason ? `: ${exc.reason}` : ''}
                </span>
                <button type="button" class="remove-exception text-red-600 hover:text-red-800" data-date="${exc.date}" data-engineer="${exc.engineerId}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            list.appendChild(item);
        });
        
        // Add remove listeners
        list.querySelectorAll('.remove-exception').forEach(btn => {
            btn.addEventListener('click', () => {
                const date = btn.dataset.date;
                const engineerId = btn.dataset.engineer;
                const currentExceptions = getDailyExceptionsData();
                const updated = currentExceptions.filter(e => !(e.date === date && e.engineerId === engineerId));
                loadDailyExceptionsData(updated, jobStartDate, jobEndDate, engineerIds);
            });
        });
    }
};

const getDailyExceptionsData = () => {
    const list = document.getElementById('dailyExceptionsList');
    const exceptions = [];
    list.querySelectorAll('.remove-exception').forEach(btn => {
        exceptions.push({
            date: btn.dataset.date,
            engineerId: btn.dataset.engineer,
            reason: '' // Could add reason field later if needed
        });
    });
    return exceptions;
};

// Add daily exceptions to all jobs for an engineer during their absence period
const addDailyExceptionsForAbsence = async (absenceData) => {
    const { engineerId, startDate, endDate, type } = absenceData;
    
    // Find all jobs that include this engineer
    const affectedJobs = appState.jobs.filter(job => 
        job.engineerIds && job.engineerIds.includes(engineerId) && job.isScheduled
    );
    
    if (affectedJobs.length === 0) {
        console.log('[ABSENCE] No jobs found for engineer during absence period');
        return;
    }
    
    // Generate all dates in the absence period
    const absenceStart = parseDate(startDate);
    const absenceEnd = parseDate(endDate);
    const exceptionsToAdd = [];
    
    for (let d = new Date(absenceStart); d <= absenceEnd; d.setDate(d.getDate() + 1)) {
        exceptionsToAdd.push(formatDate(d));
    }
    
    console.log(`[ABSENCE] Adding exceptions for ${affectedJobs.length} jobs across ${exceptionsToAdd.length} days`);
    
    // Update each affected job
    const updatePromises = affectedJobs.map(async (job) => {
        // Check if job dates overlap with absence period
        const jobStart = parseDate(job.startDate);
        const jobEnd = parseDate(job.endDate);
        
        if (jobEnd < absenceStart || jobStart > absenceEnd) {
            // Job doesn't overlap with absence period
            return;
        }
        
        // Get existing exceptions or initialize empty array
        const existingExceptions = job.dailyExceptions || [];
        
        // Add new exceptions for dates that fall within both job period and absence period
        const newExceptions = [...existingExceptions];
        
        exceptionsToAdd.forEach(exceptionDate => {
            const exDate = parseDate(exceptionDate);
            
            // Check if date falls within job period
            if (exDate >= jobStart && exDate <= jobEnd) {
                // Check if exception doesn't already exist
                const alreadyExists = newExceptions.some(
                    ex => ex.date === exceptionDate && ex.engineerId === engineerId
                );
                
                if (!alreadyExists) {
                    newExceptions.push({
                        date: exceptionDate,
                        engineerId: engineerId,
                        reason: `${type} (Auto-added)`
                    });
                }
            }
        });
        
        // Only update if we added new exceptions
        if (newExceptions.length > existingExceptions.length) {
            console.log(`[ABSENCE] Adding ${newExceptions.length - existingExceptions.length} exceptions to job: ${job.company} - ${job.site}`);
            await updateJob(job.id, { dailyExceptions: newExceptions });
        }
    });
    
    await Promise.all(updatePromises);
    console.log('[ABSENCE] Daily exceptions added to all affected jobs');
};

// Helper function to open client modal for add or edit
const openClientModal = (clientId = null) => {
    const client = clientId ? appState.clients.find(c => c.id === clientId) : null;
    
    // Populate parent dropdown with invoicing clients only
    const parentSelect = document.getElementById('clientParent');
    if (parentSelect) {
        parentSelect.innerHTML = '<option value="">Select Parent/Invoicing Client</option>';
        appState.clients
            .filter(c => c.isInvoicingClient)
            .forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.textContent = `${c.clientNumber} - ${c.companyName}`;
                if (client && c.id === client.parentClientId) {
                    option.selected = true;
                }
                parentSelect.appendChild(option);
            });
    }
    
    // Populate category dropdown from customer categories (or fallback to default list)
    const categorySelect = document.getElementById('clientCategory');
    if (categorySelect) {
        const categories = appState.customerCategories && appState.customerCategories.length > 0 
            ? appState.customerCategories 
            : ['Fire Authority', 'Commercial', 'Residential', 'Public Sector', 'Education', 'Healthcare'];
        
        categorySelect.innerHTML = '<option value="">-- Select Category --</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            if (client && cat === client.category) {
                option.selected = true;
            }
            categorySelect.appendChild(option);
        });
    }
    
    // Reset or populate form
    document.getElementById('clientId').value = client?.id || '';
    document.getElementById('clientNumber').value = client?.clientNumber || '';
    document.getElementById('clientIsInvoicing').checked = client?.isInvoicingClient || false;
    document.getElementById('clientCompanyName').value = client?.companyName || '';
    document.getElementById('clientSiteName').value = client?.siteName || '';
    // Category already set above via dropdown population
    document.getElementById('clientAddress').value = client?.address || '';
    document.getElementById('clientCity').value = client?.city || '';
    document.getElementById('clientPostcode').value = client?.postcode || '';
    document.getElementById('clientBillingAddress').value = client?.billingAddress || '';
    document.getElementById('clientContact1Name').value = client?.contact1Name || '';
    document.getElementById('clientContact1Tel').value = client?.contact1Tel || '';
    document.getElementById('clientContact1Email').value = client?.contact1Email || '';
    document.getElementById('clientContact2Name').value = client?.contact2Name || '';
    document.getElementById('clientContact2Tel').value = client?.contact2Tel || '';
    document.getElementById('clientContact2Email').value = client?.contact2Email || '';
    document.getElementById('clientPaymentTerms').value = client?.paymentTerms || '';
    document.getElementById('clientCreditLimit').value = client?.creditLimit || '';
    document.getElementById('clientDocumentLink').value = client?.documentLink || '';
    document.getElementById('clientSpecialInstructions').value = client?.specialInstructions || '';
    
    // Show/hide sections based on isInvoicingClient checkbox
    const isInvoicing = document.getElementById('clientIsInvoicing').checked;
    const parentSection = document.getElementById('clientParentSection');
    const billingSection = document.getElementById('clientBillingSection');
    const financeSection = document.getElementById('clientFinanceSection');
    const companyNameWrapper = document.getElementById('clientCompanyNameWrapper');
    const companySiteRow = document.getElementById('clientCompanySiteRow');
    
    if (parentSection) parentSection.classList.toggle('hidden', isInvoicing);
    if (billingSection) billingSection.classList.toggle('hidden', !isInvoicing);
    if (financeSection) financeSection.classList.toggle('hidden', !isInvoicing);
    
    // Handle company name field visibility based on whether this is a site with parent
    if (!isInvoicing && client?.parentClientId) {
        // Editing a site - hide company name, show site name full width
        if (companyNameWrapper) companyNameWrapper.classList.add('hidden');
        if (companySiteRow) {
            companySiteRow.classList.remove('md:grid-cols-2');
            companySiteRow.classList.add('md:grid-cols-1');
        }
    } else if (!isInvoicing) {
        // New site - will be handled by parent dropdown change
        if (companyNameWrapper) companyNameWrapper.classList.remove('hidden');
        if (companySiteRow) {
            companySiteRow.classList.remove('md:grid-cols-1');
            companySiteRow.classList.add('md:grid-cols-2');
        }
    } else {
        // Invoicing client - always show company name
        if (companyNameWrapper) companyNameWrapper.classList.remove('hidden');
        if (companySiteRow) {
            companySiteRow.classList.remove('md:grid-cols-1');
            companySiteRow.classList.add('md:grid-cols-2');
        }
    }
    
    // Set required attribute based on visibility
    document.getElementById('clientCompanyName').required = isInvoicing;
    
    // Show delete button only when editing
    if (dom.deleteClientBtn) {
        dom.deleteClientBtn.style.display = client ? 'inline-block' : 'none';
    }
    
    openModal(dom.clientModal);
};

// Helper function to switch client page tabs
const switchClientTab = (tabName) => {
    const tabConfig = {
        'details': { btnId: 'clientTabDetails', contentId: 'clientDetailsTab' },
        'finance': { btnId: 'clientTabFinance', contentId: 'clientFinanceTab' },
        'scheduled': { btnId: 'clientTabScheduled', contentId: 'clientScheduledServicesTab' },
        'activity': { btnId: 'clientTabActivity', contentId: 'clientActivityTab' }
    };
    
    Object.entries(tabConfig).forEach(([tab, ids]) => {
        const btn = document.getElementById(ids.btnId);
        const content = document.getElementById(ids.contentId);
        
        if (btn && content) {
            if (tab === tabName) {
                btn.classList.remove('border-transparent', 'text-gray-600');
                btn.classList.add('border-red-500', 'text-red-600');
                content.classList.remove('hidden');
            } else {
                btn.classList.remove('border-red-500', 'text-red-600');
                btn.classList.add('border-transparent', 'text-gray-600');
                content.classList.add('hidden');
            }
        }
    });
};

// === Supplier Modal ===
const openSupplierModal = (supplierId = null) => {
    const supplier = supplierId ? appState.suppliers.find(s => s.id === supplierId) : null;
    
    document.getElementById('supplierId').value = supplier?.id || '';
    document.getElementById('supplierCompany').value = supplier?.company || '';
    document.getElementById('supplierContact').value = supplier?.contact || '';
    document.getElementById('supplierPhone').value = supplier?.phone || '';
    document.getElementById('supplierEmail').value = supplier?.email || '';
    document.getElementById('supplierAddress1').value = supplier?.address1 || '';
    document.getElementById('supplierAddress2').value = supplier?.address2 || '';
    document.getElementById('supplierAddress3').value = supplier?.address3 || '';
    document.getElementById('supplierCounty').value = supplier?.county || '';
    document.getElementById('supplierPostcode').value = supplier?.postcode || '';
    document.getElementById('supplierAccountNumber').value = supplier?.accountNumber || generateSupplierNumber();
    document.getElementById('supplierPaymentTerms').value = supplier?.paymentTerms || '';
    document.getElementById('supplierIsActive').checked = supplier?.isActive !== undefined ? supplier.isActive : true;
    document.getElementById('supplierNotes').value = supplier?.notes || '';
    
    document.getElementById('supplierModalTitle').textContent = supplier ? 'Edit Supplier' : 'Add New Supplier';
    document.getElementById('deleteSupplierModalBtn').style.display = supplier ? 'inline-block' : 'none';
    
    openModal(document.getElementById('supplierModal'));
};

// === Purchase Order Modal ===
const openPOModal = (poId = null) => {
    const po = poId ? appState.purchaseOrders.find(p => p.id === poId) : null;
    
    // Populate supplier dropdown
    const supplierSelect = document.getElementById('poSupplier');
    if (supplierSelect) {
        supplierSelect.innerHTML = '<option value="">-- Select Supplier --</option>';
        appState.suppliers
            .filter(s => s.isActive)
            .sort((a, b) => a.company.localeCompare(b.company))
            .forEach(s => {
                const option = document.createElement('option');
                option.value = s.id;
                option.textContent = s.company;
                if (po && s.id === po.supplierId) {
                    option.selected = true;
                }
                supplierSelect.appendChild(option);
            });
    }
    
    // Populate job dropdown (open jobs only)
    const jobSelect = document.getElementById('poJob');
    if (jobSelect) {
        jobSelect.innerHTML = '<option value="">-- Select Open Job --</option>';
        appState.jobs
            .filter(j => !j.isCompleted)
            .sort((a, b) => (a.jobNo || '').localeCompare(b.jobNo || ''))
            .forEach(j => {
                const option = document.createElement('option');
                option.value = j.id;
                option.textContent = `${j.jobNo || 'No Number'} - ${j.company} - ${j.category || 'No Category'}`;
                if (po && j.id === po.jobId) {
                    option.selected = true;
                }
                jobSelect.appendChild(option);
            });
    }
    
    // Update supplier filter dropdown
    populatePOSupplierFilter();
    
    document.getElementById('poId').value = po?.id || '';
    document.getElementById('poNumber').value = po?.poNumber || generatePONumber();
    document.getElementById('poDate').value = po?.poDate || new Date().toISOString().split('T')[0];
    document.getElementById('poStatus').value = po?.status || 'sent';
    document.getElementById('poNotes').value = po?.notes || '';
    
    // Load line items
    const lineItemsContainer = document.getElementById('poLineItems');
    lineItemsContainer.innerHTML = '';
    
    if (po && po.lineItems && po.lineItems.length > 0) {
        po.lineItems.forEach((item, index) => {
            lineItemsContainer.insertAdjacentHTML('beforeend', createLineItemHTML(index, item));
        });
    } else {
        // Start with 2 empty lines
        lineItemsContainer.insertAdjacentHTML('beforeend', createLineItemHTML(0));
        lineItemsContainer.insertAdjacentHTML('beforeend', createLineItemHTML(1));
    }
    
    updateLineItemListeners();
    updatePOTotal();
    
    document.getElementById('poModalTitle').textContent = po ? 'Edit Purchase Order' : 'Create Purchase Order';
    document.getElementById('deletePOModalBtn').style.display = po ? 'inline-block' : 'none';
    
    openModal(document.getElementById('poModal'));
};

// Update line item event listeners for total calculation
const updateLineItemListeners = () => {
    document.querySelectorAll('.line-qty, .line-price').forEach(input => {
        input.removeEventListener('input', updateLineTotal);
        input.addEventListener('input', updateLineTotal);
    });
};

// Update individual line total
const updateLineTotal = (e) => {
    const lineItem = e.target.closest('.line-item');
    const qty = parseFloat(lineItem.querySelector('.line-qty').value) || 0;
    const price = parseFloat(lineItem.querySelector('.line-price').value) || 0;
    const totalInput = lineItem.querySelector('.line-total');
    totalInput.value = `£${(qty * price).toFixed(2)}`;
    updatePOTotal();
};

// Update PO grand total
const updatePOTotal = () => {
    let grandTotal = 0;
    document.querySelectorAll('.line-item').forEach(line => {
        const qty = parseFloat(line.querySelector('.line-qty').value) || 0;
        const price = parseFloat(line.querySelector('.line-price').value) || 0;
        grandTotal += qty * price;
    });
    document.getElementById('poTotalAmount').textContent = `£${grandTotal.toFixed(2)}`;
};

// Global function to remove line item
window.removeLineItem = (index) => {
    const lineItems = document.querySelectorAll('.line-item');
    if (lineItems.length > 1) {
        lineItems[index].remove();
        // Reindex remaining items
        document.querySelectorAll('.line-item').forEach((line, i) => {
            line.dataset.index = i;
            line.querySelector('.remove-line-btn').setAttribute('onclick', `window.removeLineItem(${i})`);
        });
        updatePOTotal();
    } else {
        showAlert(dom, 'Purchase order must have at least one line item.');
    }
};

// Global functions for rendering (called from HTML onclick)
window.openSupplierPage = (supplierId) => {
    appState.currentSupplierId = supplierId;
    switchView('supplier');
};

window.editPO = (poId) => {
    openPOModal(poId);
};

window.downloadPOPDF = (poId) => {
    generatePOPDF(poId);
};

// CLEANUP FUNCTION - Run once to remove duplicate employees
const cleanupDuplicateEmployees = async () => {
    console.log('[CLEANUP] Starting duplicate employee cleanup...');
    console.log('[CLEANUP] Total employees:', appState.employees.length);
    
    // Group employees by email to find duplicates
    const emailMap = new Map();
    appState.employees.forEach(emp => {
        const key = emp.email?.toLowerCase() || emp.firstName + emp.lastName;
        if (!emailMap.has(key)) {
            emailMap.set(key, []);
        }
        emailMap.get(key).push(emp);
    });
    
    let deleteCount = 0;
    for (const [email, emps] of emailMap.entries()) {
        if (emps.length > 1) {
            console.log(`[CLEANUP] Found ${emps.length} duplicates for ${email}`);
            // Keep the first one, delete the rest
            for (let i = 1; i < emps.length; i++) {
                console.log(`[CLEANUP] Deleting duplicate: ${emps[i].id}`);
                try {
                    await deleteEmployee(emps[i].id);
                    deleteCount++;
                } catch (error) {
                    console.error('[CLEANUP] Error deleting:', error);
                }
            }
        }
    }
    
    console.log(`[CLEANUP] Cleanup complete! Deleted ${deleteCount} duplicate employees.`);
    if (deleteCount > 0) {
        await showAlert(dom, `Cleanup complete! Removed ${deleteCount} duplicate employee records.`);
        // Refresh the employees view
        if (appState.currentView === 'employees') {
            renderEmployeesPage();
        }
    }
};

window.cleanupDuplicateEmployees = cleanupDuplicateEmployees;

// === Employee Page Navigation ===
window.openEmployeePage = (employeeId) => {
    appState.currentEmployeeId = employeeId;
    switchView('employee');
};

// === Employee Modal ===
const openEmployeeModal = (employeeId = null) => {
    const employee = employeeId ? appState.employees.find(e => e.id === employeeId) : null;
    
    document.getElementById('employeeId').value = employee?.id || '';
    document.getElementById('employeeFirstName').value = employee?.firstName || '';
    document.getElementById('employeeLastName').value = employee?.lastName || '';
    document.getElementById('employeeDOB').value = employee?.dateOfBirth || '';
    document.getElementById('employeeNINumber').value = employee?.niNumber || '';
    document.getElementById('employeeEmail').value = employee?.email || '';
    document.getElementById('employeePhone').value = employee?.phone || '';
    document.getElementById('employeeHomeTel').value = employee?.homeTel || '';
    document.getElementById('employeeAddress').value = employee?.address || '';
    document.getElementById('employeeCity').value = employee?.city || '';
    document.getElementById('employeePostcode').value = employee?.postcode || '';
    document.getElementById('employeeType').value = employee?.employmentType || 'employee';
    document.getElementById('employeeRole').value = employee?.role || '';
    document.getElementById('employeeStartDate').value = employee?.startDate || '';
    document.getElementById('employeePayrollNumber').value = employee?.payrollNumber || '';
    document.getElementById('employeeEmergencyName').value = employee?.emergencyContactName || '';
    document.getElementById('employeeEmergencyRelationship').value = employee?.emergencyContactRelationship || '';
    document.getElementById('employeeEmergencyAddress').value = employee?.emergencyContactAddress || '';
    document.getElementById('employeeEmergencyPhone').value = employee?.emergencyContactPhone || '';
    document.getElementById('employeeBankAddress').value = employee?.bankAddress || '';
    document.getElementById('employeeAccountName').value = employee?.accountName || '';
    document.getElementById('employeeSortCode').value = employee?.sortCode || '';
    document.getElementById('employeeAccountNumber').value = employee?.accountNumber || '';
    
    // Set employee statement radio button
    if (employee?.employeeStatement) {
        const radioId = `employeeStatement${employee.employeeStatement}`;
        const radio = document.getElementById(radioId);
        if (radio) radio.checked = true;
    } else {
        // Clear all radio buttons
        document.querySelectorAll('input[name="employeeStatement"]').forEach(r => r.checked = false);
    }
    
    document.getElementById('employeeStudentLoan').checked = employee?.studentLoan || false;
    
    document.getElementById('employeeModalTitle').textContent = employee ? 'Edit Employee' : 'Add New Employee';
    document.getElementById('deleteEmployeeBtn').style.display = employee ? 'inline-block' : 'none';
    
    openModal(document.getElementById('employeeModal'));
};

window.editEmployee = (employeeId) => {
    openEmployeeModal(employeeId);
};

// === Certification Modal ===
let currentCertificationIndex = null;

const openCertificationModal = (certificationIndex = null) => {
    const employee = appState.employees.find(e => e.id === appState.currentEmployeeId);
    if (!employee) return;
    
    currentCertificationIndex = certificationIndex;
    const cert = (certificationIndex !== null && employee.certifications) ? employee.certifications[certificationIndex] : null;
    
    document.getElementById('certificationName').value = cert?.name || '';
    document.getElementById('certificationNumber').value = cert?.number || '';
    document.getElementById('certificationIssuer').value = cert?.issuer || '';
    document.getElementById('certificationDateObtained').value = cert?.dateObtained || '';
    document.getElementById('certificationDateExpires').value = cert?.dateExpires || '';
    document.getElementById('certificationComments').value = cert?.comments || '';
    document.getElementById('certificationEmployeeId').value = appState.currentEmployeeId;
    
    // Show uploaded file if exists
    const filePreview = document.getElementById('certificationFilePreview');
    const fileLink = document.getElementById('certificationFileLink');
    const fileName = document.getElementById('certificationFileName');
    
    console.log('[APP] Certification data:', cert);
    console.log('[APP] FileURL:', cert?.fileURL);
    
    if (cert?.fileURL && filePreview && fileLink && fileName) {
        fileLink.href = cert.fileURL;
        // Extract filename from URL or use default
        const urlFileName = cert.fileURL.split('/').pop().split('?')[0];
        // Remove timestamp prefix if present (e.g., "1234567890_filename.pdf" -> "filename.pdf")
        const displayName = urlFileName.includes('_') ? urlFileName.substring(urlFileName.indexOf('_') + 1) : urlFileName;
        fileName.textContent = decodeURIComponent(displayName) || 'View certificate';
        filePreview.classList.remove('hidden');
        console.log('[APP] Showing file preview:', displayName);
    } else if (filePreview) {
        filePreview.classList.add('hidden');
        console.log('[APP] No fileURL found, hiding preview');
    }
    
    // Clear file input
    const fileInput = document.getElementById('certificationFile');
    if (fileInput) fileInput.value = '';
    
    document.getElementById('certificationModalTitle').textContent = cert ? 'Edit Certification' : 'Add Certification';
    document.getElementById('deleteCertificationBtn').style.display = cert ? 'inline-block' : 'none';
    
    openModal(document.getElementById('certificationModal'));
};

window.editCertification = (employeeId, certificationIndex) => {
    // Make sure we're on the right employee page
    if (appState.currentEmployeeId !== employeeId) {
        appState.currentEmployeeId = employeeId;
    }
    openCertificationModal(certificationIndex);
};

const setupFormListeners = () => {
    dom.jobForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('jobId').value;

        const jobData = {
            company: document.getElementById('jobCompany').value,
            site: document.getElementById('jobSite').value,
            category: document.getElementById('jobCategory').value,
            engineerIds: Array.from(document.getElementById('jobEngineers').selectedOptions).map(opt => opt.value),
            startDate: document.getElementById('jobStartDate').value,
            endDate: document.getElementById('jobEndDate').value,
            cost: document.getElementById('jobCost').value,
            jobNo: document.getElementById('jobNo').value,
            po: document.getElementById('jobPO').value,
            notes: appState.currentJobNotes,
            isScheduled: document.getElementById('jobIsScheduled').checked,
            allowWeekendWork: document.getElementById('jobAllowWeekendWork').checked,
            isCompleted: document.getElementById('jobIsCompleted').checked || false,
            isProject: document.getElementById('jobIsProject').checked || false,
            applications: document.getElementById('jobIsProject').checked ? getApplicationsData() : [],
            isAppointmentBased: document.getElementById('jobIsAppointmentBased').checked || false,
            appointments: document.getElementById('jobIsAppointmentBased').checked ? getAppointmentsData() : [],
            dailyExceptions: getDailyExceptionsData()
        };

        if (jobData.isScheduled && (!jobData.startDate || !jobData.endDate || jobData.engineerIds.length === 0)) {
            await showAlert(dom, 'Scheduled jobs must have a start date, end date, and at least one engineer.');
            return;
        }

        if (jobData.startDate && jobData.endDate && parseDate(jobData.endDate) < parseDate(jobData.startDate)) {
            await showAlert(dom, 'End date cannot be before start date.');
            return;
        }

        try {
            if (id) {
                await updateJob(id, jobData);
            } else {
                await addJob(jobData);
            }
            closeModal(dom.jobModal);
        } catch (error) {
            console.error('Error saving job:', error);
            await showAlert(dom, 'Error saving job. Please try again.');
        }
    });

    dom.deleteJobBtn?.addEventListener('click', async () => {
        const id = document.getElementById('jobId').value;
        if (await showAlert(dom, 'Are you sure you want to delete this job?', true)) {
            try {
                await deleteJob(id);
                closeModal(dom.jobModal);
            } catch (error) {
                console.error('Error deleting job:', error);
            }
        }
    });

    dom.completeJobBtn?.addEventListener('click', async () => {
        const id = document.getElementById('jobId').value;
        if (await showAlert(dom, 'Are you sure works are complete?', true)) {
            try {
                await updateJob(id, { isCompleted: true });
                closeModal(dom.jobModal);
            } catch (error) {
                console.error('Error completing job:', error);
            }
        }
    });
    
    // Quote form submission
    document.getElementById('quoteForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('quoteId').value;
        
        const quoteData = {
            quoteNumber: document.getElementById('quoteNumber').value,
            company: document.getElementById('quoteCompany').value,
            site: document.getElementById('quoteSite').value || '',
            accountManager: document.getElementById('quoteAccountManager').value,
            customerCategory: document.getElementById('quoteCustomerCategory').value || '',
            contactName: document.getElementById('quoteContactName').value || '',
            contactNumber: document.getElementById('quoteContactNumber').value || '',
            value: parseFloat(document.getElementById('quoteValue').value) || 0,
            probability: parseInt(document.getElementById('quoteProbability').value) || 0,
            leadSource: document.getElementById('quoteLeadSource').value || '',
            status: document.getElementById('quoteStatus').value,
            projectedCloseDate: document.getElementById('quoteProjectedCloseDate').value || '',
            actualCloseDate: document.getElementById('quoteActualCloseDate').value || '',
            equipmentClass: document.getElementById('quoteEquipmentClass').value || '',
            equipmentOther: document.getElementById('quoteEquipmentOther') ? document.getElementById('quoteEquipmentOther').value || '' : '',
            worksExpected: document.getElementById('quoteWorksExpected').value || '',
            notes: appState.currentQuoteNotes
        };
        
        // Validate required fields
        if (!quoteData.company || !quoteData.accountManager || !quoteData.value || !quoteData.status) {
            await showAlert(dom, 'Please fill in all required fields: Company, Account Manager, Value, and Status.');
            return;
        }
        
        try {
            if (id) {
                await updateQuote(id, quoteData);
            } else {
                await addQuote(quoteData);
            }
            closeModal(dom.quoteModal);
        } catch (error) {
            console.error('Error saving quote:', error);
            await showAlert(dom, 'Error saving quote. Please try again.');
        }
    });
    
    // Delete quote button
    document.getElementById('deleteQuoteBtn')?.addEventListener('click', async () => {
        const id = document.getElementById('quoteId').value;
        if (await showAlert(dom, 'Are you sure you want to delete this quote?', true)) {
            try {
                await deleteQuote(id);
                closeModal(dom.quoteModal);
            } catch (error) {
                console.error('Error deleting quote:', error);
                await showAlert(dom, 'Error deleting quote. Please try again.');
            }
        }
    });

    // Client form submission
    dom.clientForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('clientId').value;
        
        const clientData = {
            clientNumber: document.getElementById('clientNumber').value,
            isInvoicingClient: document.getElementById('clientIsInvoicing').checked,
            parentClientId: document.getElementById('clientParent').value || null,
            companyName: document.getElementById('clientCompanyName').value,
            siteName: document.getElementById('clientSiteName').value || '',
            category: document.getElementById('clientCategory').value || '',
            address: document.getElementById('clientAddress').value || '',
            city: document.getElementById('clientCity').value || '',
            postcode: document.getElementById('clientPostcode').value || '',
            billingAddress: document.getElementById('clientBillingAddress').value || '',
            contact1Name: document.getElementById('clientContact1Name').value || '',
            contact1Tel: document.getElementById('clientContact1Tel').value || '',
            contact1Email: document.getElementById('clientContact1Email').value || '',
            contact2Name: document.getElementById('clientContact2Name').value || '',
            contact2Tel: document.getElementById('clientContact2Tel').value || '',
            contact2Email: document.getElementById('clientContact2Email').value || '',
            paymentTerms: document.getElementById('clientPaymentTerms').value || '',
            creditLimit: document.getElementById('clientCreditLimit').value || '',
            documentLink: document.getElementById('clientDocumentLink').value || '',
            specialInstructions: document.getElementById('clientSpecialInstructions').value || ''
        };
        
        // Validate required fields
        if (!clientData.clientNumber || !clientData.companyName) {
            await showAlert(dom, 'Please fill in required fields: Client Number and Company Name.');
            return;
        }
        
        if (!clientData.isInvoicingClient && !clientData.parentClientId) {
            await showAlert(dom, 'Please select a parent/invoicing client.');
            return;
        }
        
        try {
            if (id) {
                await updateClient(id, clientData);
            } else {
                await addClient(clientData);
            }
            closeModal(dom.clientModal);
        } catch (error) {
            console.error('Error saving client:', error);
            await showAlert(dom, 'Error saving client. Please try again.');
        }
    });
    
    // Delete client button
    dom.deleteClientBtn?.addEventListener('click', async () => {
        const id = document.getElementById('clientId').value;
        if (await showAlert(dom, 'Are you sure you want to delete this client?', true)) {
            try {
                await deleteClient(id);
                closeModal(dom.clientModal);
                switchView('clientsLog');
            } catch (error) {
                console.error('Error deleting client:', error);
                await showAlert(dom, 'Error deleting client. Please try again.');
            }
        }
    });

    dom.engineerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('engineerId').value;
        const engineerData = {
            name: document.getElementById('engineerName').value,
            type: document.getElementById('engineerType').value
        };

        try {
            if (id) {
                await updateEngineer(id, engineerData);
            } else {
                await addEngineer(engineerData);
            }
            closeModal(dom.engineerModal);
        } catch (error) {
            console.error('Error saving engineer:', error);
        }
    });

    // Engineer form in settings page
    document.getElementById('addEngineerFormSettings')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('newEngineerName').value.trim();
        const specialisationsSelect = document.getElementById('newEngineerSpecialisations');
        const selectedOptions = Array.from(specialisationsSelect.selectedOptions);
        const specialisations = selectedOptions.map(opt => opt.value);

        if (!name) {
            showAlert('Please enter an engineer name');
            return;
        }

        const engineerData = {
            name: name,
            type: specialisations.length > 0 ? specialisations.join(', ') : 'General'
        };

        try {
            await addEngineer(engineerData);
            document.getElementById('newEngineerName').value = '';
            specialisationsSelect.selectedIndex = -1;
            showAlert('Engineer added successfully!');
            // Refresh the engineer list
            renderSettingsLists(dom, appState, updateSettings, showAlert);
        } catch (error) {
            console.error('Error adding engineer:', error);
            showAlert('Failed to add engineer');
        }
    });

    // Absence Modal Handlers
    document.getElementById('cancelAbsenceBtn')?.addEventListener('click', () => {
        closeModal(document.getElementById('absenceModal'));
    });

    document.getElementById('absenceForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('absenceId').value;
        const absenceData = {
            engineerId: document.getElementById('absenceEngineer').value,
            type: document.getElementById('absenceType').value,
            startDate: document.getElementById('absenceStartDate').value,
            endDate: document.getElementById('absenceEndDate').value,
            notes: document.getElementById('absenceNotes').value.trim()
        };

        try {
            if (id) {
                await updateAbsence(id, absenceData);
            } else {
                await addAbsence(absenceData);
            }
            
            // Automatically add daily exceptions to all jobs during absence period
            await addDailyExceptionsForAbsence(absenceData);
            
            closeModal(document.getElementById('absenceModal'));
        } catch (error) {
            console.error('Error saving absence:', error);
            showAlert('Failed to save absence');
        }
    });

    document.getElementById('deleteAbsenceBtn')?.addEventListener('click', async () => {
        const id = document.getElementById('absenceId').value;
        if (id && confirm('Are you sure you want to delete this absence?')) {
            try {
                await deleteAbsence(id);
                closeModal(document.getElementById('absenceModal'));
            } catch (error) {
                console.error('Error deleting absence:', error);
                showAlert('Failed to delete absence');
            }
        }
    });

    dom.addCategoryForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newCategory = document.getElementById('newCategoryName').value.trim();
        if (newCategory && !appState.categories.includes(newCategory)) {
            try {
                await updateSettings('categories', [...appState.categories, newCategory]);
                document.getElementById('newCategoryName').value = '';
            } catch (error) {
                console.error('Error adding category:', error);
            }
        }
    });

    dom.addSpecialisationForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newSpec = document.getElementById('newSpecialisationName').value.trim();
        if (newSpec && !appState.specialisations.includes(newSpec)) {
            try {
                await updateSettings('specialisations', [...appState.specialisations, newSpec]);
                document.getElementById('newSpecialisationName').value = '';
            } catch (error) {
                console.error('Error adding specialisation:', error);
            }
        }
    });
    
    // Quote settings forms
    document.getElementById('addCustomerCategoryForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const value = document.getElementById('newCustomerCategory').value.trim();
        if (value) {
            await addQuoteSetting('customerCategories', value);
            document.getElementById('newCustomerCategory').value = '';
        }
    });
    
    document.getElementById('addEquipmentClassForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const value = document.getElementById('newEquipmentClass').value.trim();
        if (value) {
            await addQuoteSetting('equipmentClasses', value);
            document.getElementById('newEquipmentClass').value = '';
        }
    });
    
    document.getElementById('addLeadSourceForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const value = document.getElementById('newLeadSource').value.trim();
        if (value) {
            await addQuoteSetting('leadSources', value);
            document.getElementById('newLeadSource').value = '';
        }
    });
    
    // Appointment-Based checkbox toggle
    document.getElementById('jobIsAppointmentBased')?.addEventListener('change', (e) => {
        const appointmentsSection = document.getElementById('appointmentsSection');
        
        if (e.target.checked) {
            appointmentsSection.classList.remove('hidden');
            // Populate engineer dropdown in appointments section
            populateAppointmentEngineers();
        } else {
            appointmentsSection.classList.add('hidden');
        }
    });
    
    // Add appointment button
    document.getElementById('addAppointmentBtn')?.addEventListener('click', () => {
        addAppointmentItem();
    });
};

const setupNotesListener = () => {
    dom.addNoteBtn?.addEventListener('click', () => {
        const newNoteText = dom.newJobNote.value.trim();
        if (newNoteText) {
            const newNote = {
                text: newNoteText,
                timestamp: new Date().toISOString()
            };
            appState.currentJobNotes.push(newNote);
            renderNotes(dom, appState.currentJobNotes);
            dom.newJobNote.value = '';
        }
    });
    
    // Quote notes handler
    document.getElementById('addQuoteNoteBtn')?.addEventListener('click', () => {
        const newNoteText = document.getElementById('newQuoteNote').value.trim();
        if (newNoteText) {
            const newNote = {
                text: newNoteText,
                timestamp: new Date().toISOString()
            };
            appState.currentQuoteNotes.push(newNote);
            renderQuoteNotes(appState.currentQuoteNotes);
            document.getElementById('newQuoteNote').value = '';
        }
    });
};

// Quote Filters
const applyQuoteFilters = () => {
    const filters = {
        status: document.getElementById('filterQuoteStatus')?.value || '',
        manager: document.getElementById('filterQuoteManager')?.value || '',
        company: document.getElementById('filterQuoteCompany')?.value || '',
        dateFrom: document.getElementById('filterQuoteDateFrom')?.value || '',
        dateTo: document.getElementById('filterQuoteDateTo')?.value || ''
    };
    
    const filteredQuotes = filterQuotes(appState.quotes, filters);
    renderQuotesTable(filteredQuotes, appState);
};

// Open Quote Modal (for editing existing quote)
const openQuoteModalWrapper = async (quoteId) => {
    const quote = appState.quotes.find(q => q.id === quoteId);
    
    // Load notes into appState
    if (quote) {
        if (typeof quote.notes === 'string') {
            appState.currentQuoteNotes = quote.notes ? [{ text: quote.notes, timestamp: new Date().toISOString() }] : [];
        } else {
            appState.currentQuoteNotes = quote.notes || [];
        }
    } else {
        appState.currentQuoteNotes = [];
    }
    
    await openQuoteModal(quote, appState);
    openModal(dom.quoteModal);
};

// Job Modal Opening
const openJobModal = async (jobId, prefillData = null) => {
    // If no jobId, we're creating a new job
    if (!jobId) {
        dom.jobForm.reset();
        appState.currentJobNotes = [];
        renderNotes(dom, appState.currentJobNotes);
        document.getElementById('jobIsScheduled').checked = true;
        document.getElementById('jobIsProject').checked = false;
        document.getElementById('jobIsAppointmentBased').checked = false;
        document.getElementById('jobId').value = '';
        dom.jobModal.querySelector('h2').textContent = 'Add New Job';
        dom.deleteJobBtn.classList.add('hidden');
        dom.completeJobBtn.classList.add('hidden');
        populateEngineerOptions(dom, appState.engineers);
        populateCategoryOptions(dom, appState.categories);
        loadApplicationsData([]);
        loadAppointmentsData([]);
        loadDailyExceptionsData([], '', '', []);
        
        // Pre-fill data if provided
        if (prefillData) {
            if (prefillData.company) document.getElementById('jobCompany').value = prefillData.company;
            if (prefillData.site) document.getElementById('jobSite').value = prefillData.site;
            if (prefillData.category) document.getElementById('jobCategory').value = prefillData.category;
        }
        
        return;
    }
    
    const job = appState.jobs.find(j => j.id === jobId);
    if (!job) return;

    dom.jobModal.querySelector('h2').textContent = 'Edit Job';

    if (typeof job.notes === 'string') {
        appState.currentJobNotes = job.notes ? [{ text: job.notes, timestamp: new Date().toISOString() }] : [];
    } else {
        appState.currentJobNotes = job.notes || [];
    }
    renderNotes(dom, appState.currentJobNotes);

    const jobDataMap = {
        company: 'jobCompany', site: 'jobSite', category: 'jobCategory',
        startDate: 'jobStartDate', endDate: 'jobEndDate', cost: 'jobCost',
        jobNo: 'jobNo', po: 'jobPO',
        isScheduled: 'jobIsScheduled', allowWeekendWork: 'jobAllowWeekendWork',
        isCompleted: 'jobIsCompleted', isProject: 'jobIsProject', isAppointmentBased: 'jobIsAppointmentBased'
    };

    Object.entries(jobDataMap).forEach(([key, elementId]) => {
        const el = document.getElementById(elementId);
        if (el) {
            if (el.type === 'checkbox') {
                el.checked = job[key] || false;
            } else {
                el.value = job[key] || '';
            }
        }
    });
    
    // Load applications if this is a project
    loadApplicationsData(job.applications || []);
    
    // Load appointments if this is appointment-based
    loadAppointmentsData(job.appointments || []);
    
    // Load daily exceptions
    loadDailyExceptionsData(job.dailyExceptions || [], job.startDate, job.endDate, job.engineerIds);

    document.getElementById('jobId').value = job.id;
    populateEngineerOptions(dom, appState.engineers, job.engineerIds);
    populateCategoryOptions(dom, appState.categories, job.category);
    dom.deleteJobBtn.classList.remove('hidden');
    dom.completeJobBtn.classList.remove('hidden');
    openModal(dom.jobModal);
};

const openAbsenceModal = (absenceId = null, prefilledEngineerId = null, prefilledDate = null) => {
    const modal = document.getElementById('absenceModal');
    const form = document.getElementById('absenceForm');
    const deleteBtn = document.getElementById('deleteAbsenceBtn');
    
    // Reset form
    form.reset();
    document.getElementById('absenceId').value = '';
    
    if (absenceId) {
        // Edit mode
        const absence = appState.absences.find(a => a.id === absenceId);
        if (!absence) return;
        
        document.getElementById('absenceModalTitle').textContent = 'Edit Absence';
        document.getElementById('absenceId').value = absence.id;
        document.getElementById('absenceEngineer').value = absence.engineerId;
        document.getElementById('absenceType').value = absence.type;
        document.getElementById('absenceStartDate').value = absence.startDate;
        document.getElementById('absenceEndDate').value = absence.endDate;
        document.getElementById('absenceNotes').value = absence.notes || '';
        deleteBtn.classList.remove('hidden');
    } else {
        // Add mode
        document.getElementById('absenceModalTitle').textContent = 'Add Absence';
        deleteBtn.classList.add('hidden');
        
        // Prefill if provided
        if (prefilledEngineerId) {
            document.getElementById('absenceEngineer').value = prefilledEngineerId;
        }
        if (prefilledDate) {
            document.getElementById('absenceStartDate').value = prefilledDate;
            document.getElementById('absenceEndDate').value = prefilledDate;
        }
    }
    
    // Populate engineer dropdown
    const engineerSelect = document.getElementById('absenceEngineer');
    engineerSelect.innerHTML = '<option value="">Select Engineer</option>';
    appState.engineers
        .filter(e => e.isActive)
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(engineer => {
            const option = document.createElement('option');
            option.value = engineer.id;
            option.textContent = engineer.name;
            engineerSelect.appendChild(option);
        });
    
    // Re-select if editing
    if (absenceId) {
        const absence = appState.absences.find(a => a.id === absenceId);
        engineerSelect.value = absence.engineerId;
    } else if (prefilledEngineerId) {
        engineerSelect.value = prefilledEngineerId;
    }
    
    openModal(modal);
};

// Export functions for use in other modules
window.openJobModal = openJobModal;
window.openAbsenceModal = openAbsenceModal;

// Settings Page Functions
const openSettingsPage = () => {
    console.log('[SETTINGS] Opening settings page');
    
    // Hide all other pages
    dom.landingPage.classList.add('hidden');
    dom.schedulerPage.classList.add('hidden');
    dom.settingsPage.classList.remove('hidden');
    
    // Hide header elements
    dom.dateControls.style.display = 'none';
    dom.actionButtons.style.display = 'none';
    
    // Render settings data
    renderSettingsLists(dom, appState, updateSettings, showAlert);
    
    // Populate specialisations dropdown for engineer form
    const specialisationsSelect = document.getElementById('newEngineerSpecialisations');
    if (specialisationsSelect) {
        specialisationsSelect.innerHTML = '';
        appState.specialisations
            .sort((a, b) => a.localeCompare(b))
            .forEach(spec => {
                const option = document.createElement('option');
                option.value = spec;
                option.textContent = spec;
                specialisationsSelect.appendChild(option);
            });
    }
    
    // Show categories by default
    switchSettingsSection('categories');
};

const closeSettingsPage = () => {
    console.log('[SETTINGS] Closing settings page');
    
    // Hide settings page
    dom.settingsPage.classList.add('hidden');
    
    // Return to previous view
    renderCurrentView();
};

const switchSettingsSection = (section) => {
    console.log(`[SETTINGS] Switching to section: ${section}`);
    
    // Hide all panels
    document.getElementById('categoriesPanel')?.classList.add('hidden');
    document.getElementById('specialisationsPanel')?.classList.add('hidden');
    document.getElementById('engineersPanel')?.classList.add('hidden');
    document.getElementById('customerCategoriesPanel')?.classList.add('hidden');
    document.getElementById('equipmentClassesPanel')?.classList.add('hidden');
    document.getElementById('leadSourcesPanel')?.classList.add('hidden');
    
    // Remove active state from all nav buttons
    const navButtons = [
        'categoriesNavBtn', 'specialisationsNavBtn', 'engineersNavBtn',
        'customerCategoriesNavBtn', 'equipmentClassesNavBtn', 'leadSourcesNavBtn'
    ];
    
    navButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.classList.remove('text-white', 'bg-red-600', 'hover:bg-red-700');
            btn.classList.add('text-gray-700', 'hover:bg-gray-100');
        }
    });
    
    // Show selected panel and activate nav button
    const panelMap = {
        'categories': 'categoriesPanel',
        'specialisations': 'specialisationsPanel',
        'engineers': 'engineersPanel',
        'customerCategories': 'customerCategoriesPanel',
        'equipmentClasses': 'equipmentClassesPanel',
        'leadSources': 'leadSourcesPanel'
    };
    
    const btnMap = {
        'categories': 'categoriesNavBtn',
        'specialisations': 'specialisationsNavBtn',
        'engineers': 'engineersNavBtn',
        'customerCategories': 'customerCategoriesNavBtn',
        'equipmentClasses': 'equipmentClassesNavBtn',
        'leadSources': 'leadSourcesNavBtn'
    };
    
    const panel = document.getElementById(panelMap[section]);
    const btn = document.getElementById(btnMap[section]);
    
    if (panel && btn) {
        panel.classList.remove('hidden');
        btn.classList.remove('text-gray-700', 'hover:bg-gray-100');
        btn.classList.add('text-white', 'bg-red-600', 'hover:bg-red-700');
    }
    
    // Render lists for quote settings
    if (section === 'customerCategories') {
        renderQuoteSettingsList('customerCategories', appState.customerCategories);
    } else if (section === 'equipmentClasses') {
        renderQuoteSettingsList('equipmentClasses', appState.equipmentClasses);
    } else if (section === 'leadSources') {
        renderQuoteSettingsList('leadSources', appState.leadSources);
    }
};

// Render quote settings lists
const renderQuoteSettingsList = (type, items) => {
    const listId = type === 'customerCategories' ? 'customerCategoryList' :
                   type === 'equipmentClasses' ? 'equipmentClassList' :
                   'leadSourceList';
    const list = document.getElementById(listId);
    if (!list) return;
    
    list.innerHTML = items.map(item => `
        <div class="flex items-center justify-between p-2 bg-white rounded border hover:bg-gray-50">
            <span class="text-gray-800">${item}</span>
            <button class="remove-quote-setting text-red-600 hover:text-red-800" data-type="${type}" data-value="${item}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
    
    // Add remove listeners
    list.querySelectorAll('.remove-quote-setting').forEach(btn => {
        btn.addEventListener('click', () => removeQuoteSetting(btn.dataset.type, btn.dataset.value));
    });
};

// Add quote setting
const addQuoteSetting = async (type, value) => {
    const currentItems = appState[type] || [];
    if (currentItems.includes(value)) {
        await showAlert(dom, 'This item already exists');
        return;
    }
    
    const updatedItems = [...currentItems, value];
    try {
        await updateSettings(type, updatedItems);
        // State will be updated by listener
    } catch (error) {
        console.error(`Error adding ${type}:`, error);
        await showAlert(dom, 'Error adding item. Please try again.');
    }
};

// Remove quote setting
const removeQuoteSetting = async (type, value) => {
    const currentItems = appState[type] || [];
    const updatedItems = currentItems.filter(item => item !== value);
    
    try {
        await updateSettings(type, updatedItems);
        // State will be updated by listener
    } catch (error) {
        console.error(`Error removing ${type}:`, error);
        await showAlert(dom, 'Error removing item. Please try again.');
    }
};

window.renderScheduleWrapper = renderScheduleWrapper;
window.openQuoteModalHandler = openQuoteModalWrapper;

