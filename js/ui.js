// Cache DOM elements
export const getDOMElements = () => ({
    loadingSpinner: document.getElementById('loadingSpinner'),
    landingPage: document.getElementById('landingPage'),
    schedulerPage: document.getElementById('schedulerPage'),
    clientInfoPage: document.getElementById('clientInfoPage'),
    logoToHome: document.getElementById('logoToHome'),
    mainTitle: document.getElementById('mainTitle'),
    dateControls: document.getElementById('dateControls'),
    actionButtons: document.getElementById('actionButtons'),
    scheduleBoard: document.getElementById('scheduleBoard'),
    forecastContainer: document.getElementById('forecastContainer'),
    jobModal: document.getElementById('jobModal'),
    engineerModal: document.getElementById('engineerModal'),
    settingsPage: document.getElementById('settingsPage'),
    cancelJobBtn: document.getElementById('cancelJobBtn'),
    deleteJobBtn: document.getElementById('deleteJobBtn'),
    completeJobBtn: document.getElementById('completeJobBtn'),
    cancelEngineerBtn: document.getElementById('cancelEngineerBtn'),
    jobForm: document.getElementById('jobForm'),
    engineerForm: document.getElementById('engineerForm'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    currentDateRange: document.getElementById('currentDateRange'),
    scheduleGrid: document.getElementById('scheduleGrid'),
    forecastTable: document.getElementById('forecastTable'),
    weekViewBtn: document.getElementById('weekViewBtn'),
    monthViewBtn: document.getElementById('monthViewBtn'),
    forecastViewBtn: document.getElementById('forecastViewBtn'),
    clientInfoViewBtn: document.getElementById('clientInfoViewBtn'),
    navWeekViewBtn: document.getElementById('navWeekViewBtn'),
    navMonthViewBtn: document.getElementById('navMonthViewBtn'),
    navForecastViewBtn: document.getElementById('navForecastViewBtn'),
    navQuotationsViewBtn: document.getElementById('navQuotationsViewBtn'),
    navClientInfoViewBtn: document.getElementById('navClientInfoViewBtn'),
    alertModal: document.getElementById('alertModal'),
    alertMessage: document.getElementById('alertMessage'),
    alertOkBtn: document.getElementById('alertOkBtn'),
    alertCancelBtn: document.getElementById('alertCancelBtn'),
    settingsBtn: document.getElementById('settingsBtn'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    categoryList: document.getElementById('categoryList'),
    addCategoryForm: document.getElementById('addCategoryForm'),
    specialisationList: document.getElementById('specialisationList'),
    addSpecialisationForm: document.getElementById('addSpecialisationForm'),
    engineerList: document.getElementById('engineerList'),
    categoriesTab: document.getElementById('categoriesTab'),
    specialisationsTab: document.getElementById('specialisationsTab'),
    engineersTab: document.getElementById('engineersTab'),
    categoriesPanel: document.getElementById('categoriesPanel'),
    specialisationsPanel: document.getElementById('specialisationsPanel'),
    engineersPanel: document.getElementById('engineersPanel'),
    invoicedThisMonth: document.getElementById('invoicedThisMonth'),
    expectedNextMonth: document.getElementById('expectedNextMonth'),
    unscheduledJobsContainer: document.getElementById('unscheduledJobsContainer'),
    noUnscheduledJobs: document.getElementById('noUnscheduledJobs'),
    wipJobsContainer: document.getElementById('wipJobsContainer'),
    noWipJobs: document.getElementById('noWipJobs'),
    addNoteBtn: document.getElementById('addNoteBtn'),
    notesList: document.getElementById('notesList'),
    newJobNote: document.getElementById('newJobNote'),
    clientSelector: document.getElementById('clientSelector'),
    clientJobsContainer: document.getElementById('clientJobsContainer'),
    clientWorkTypeFilter: document.getElementById('clientWorkTypeFilter'),
    clientCategoryFilter: document.getElementById('clientCategoryFilter'),
    clientDateFilter: document.getElementById('clientDateFilter'),
    clientFinancialChart: document.getElementById('clientFinancialChart'),
    quotationsPage: document.getElementById('quotationsPage'),
    addQuoteBtn: document.getElementById('addQuoteBtn'),
    quoteModal: document.getElementById('quoteModal'),
    quotesTable: document.getElementById('quotesTable'),
    quotesTableBody: document.getElementById('quotesTableBody'),
    // Operations jobs UI
    opsPendingJobsList: document.getElementById('opsPendingJobsList'),
    opsAllJobsList: document.getElementById('opsAllJobsList'),
    opsJobsSearch: document.getElementById('opsJobsSearch'),
    opsJobsStatusFilter: document.getElementById('opsJobsStatusFilter'),
    opsJobsCategoryFilter: document.getElementById('opsJobsCategoryFilter'),
    opsJobsResetFilters: document.getElementById('opsJobsResetFilters'),
    // Client pages
    clientsLogPage: document.getElementById('clientsLogPage'),
    clientPage: document.getElementById('clientPage'),
    clientsLogContainer: document.getElementById('clientsLogContainer'),
    addClientBtn: document.getElementById('addClientBtn'),
    clientModal: document.getElementById('clientModal'),
    clientForm: document.getElementById('clientForm'),
    closeClientModalBtn: document.getElementById('closeClientModalBtn'),
    cancelClientBtn: document.getElementById('cancelClientBtn'),
    deleteClientBtn: document.getElementById('deleteClientBtn'),
    backToClientsBtn: document.getElementById('backToClientsBtn'),
    clientPageName: document.getElementById('clientPageName'),
    clientDetailsTab: document.getElementById('clientDetailsTab'),
    clientFinanceTab: document.getElementById('clientFinanceTab'),
    clientScheduledServicesTab: document.getElementById('clientScheduledServicesTab'),
    clientActivityTab: document.getElementById('clientActivityTab'),
    clientJobsList: document.getElementById('clientJobsList'),
    clientTabDetails: document.getElementById('clientTabDetails'),
    clientTabFinance: document.getElementById('clientTabFinance'),
    clientTabScheduled: document.getElementById('clientTabScheduled'),
    clientTabActivity: document.getElementById('clientTabActivity'),
    
    // Employee modal elements
    employeeModal: document.getElementById('employeeModal'),
    employeeForm: document.getElementById('employeeForm'),
    closeEmployeeModalBtn: document.getElementById('closeEmployeeModalBtn'),
    cancelEmployeeBtn: document.getElementById('cancelEmployeeBtn'),
    deleteEmployeeBtn: document.getElementById('deleteEmployeeBtn'),
    
    // Certification modal elements
    certificationModal: document.getElementById('certificationModal'),
    certificationForm: document.getElementById('certificationForm'),
    closeCertificationModalBtn: document.getElementById('closeCertificationModalBtn'),
    cancelCertificationBtn: document.getElementById('cancelCertificationBtn'),
    deleteCertificationBtn: document.getElementById('deleteCertificationBtn'),
});

// Modal Handling
export const openModal = (modal) => {
    modal.style.display = 'flex';
    
    // Reset scroll position to top immediately
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.scrollTop = 0;
    }
    
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modalContent?.classList.remove('scale-show');
        
        // Reset scroll again after animation starts
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    }, 10);
    
    // Final reset after a short delay to catch any content loading
    setTimeout(() => {
        if (modalContent) {
            modalContent.scrollTop = 0;
        }
    }, 100);
};

export const closeModal = (modal) => {
    modal.classList.add('opacity-0');
    modal.querySelector('.modal-content').classList.add('scale-show');
    setTimeout(() => modal.style.display = 'none', 300);
};

export const showAlert = (dom, message, showCancel = false) => {
    dom.alertMessage.textContent = message;
    dom.alertCancelBtn.classList.toggle('hidden', !showCancel);
    openModal(dom.alertModal);
    return new Promise(resolve => {
        dom.alertOkBtn.onclick = () => {
            closeModal(dom.alertModal);
            resolve(true);
        };
        dom.alertCancelBtn.onclick = () => {
            closeModal(dom.alertModal);
            resolve(false);
        };
    });
};

// Populate Dropdowns
export const populateEngineerOptions = (dom, engineers, selectedIds = []) => {
    const select = document.getElementById('jobEngineers');
    select.innerHTML = '';
    engineers
        .filter(e => e.isActive)
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach(e => {
            const option = document.createElement('option');
            option.value = e.id;
            option.textContent = `${e.name} (${e.type})`;
            option.selected = selectedIds.includes(e.id);
            select.appendChild(option);
        });
};

export const populateCategoryOptions = (dom, categories, selected = '') => {
    const select = document.getElementById('jobCategory');
    select.innerHTML = '';
    categories.sort().forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        option.selected = cat === selected;
        select.appendChild(option);
    });
};

export const populateSpecialisationOptions = (dom, specialisations, selected = '') => {
    const select = document.getElementById('engineerType');
    select.innerHTML = '';
    specialisations.sort().forEach(spec => {
        const option = document.createElement('option');
        option.value = spec;
        option.textContent = spec;
        option.selected = spec === selected;
        select.appendChild(option);
    });
};

// Render Notes
export const renderNotes = (dom, notesArray) => {
    dom.notesList.innerHTML = '';
    if (!notesArray || notesArray.length === 0) {
        dom.notesList.innerHTML = `<p class="text-gray-400 text-sm italic p-2">No notes yet.</p>`;
        return;
    }
    [...notesArray].reverse().forEach(note => {
        const noteEl = document.createElement('div');
        noteEl.className = 'p-2 border-b border-gray-200';
        const timestamp = new Date(note.timestamp).toLocaleString('en-GB');
        noteEl.innerHTML = `
            <p class="text-sm text-gray-800">${note.text}</p>
            <p class="text-xs text-gray-400 text-right mt-1">${timestamp}</p>
        `;
        dom.notesList.appendChild(noteEl);
    });
};
