// clients.js - Client Management Module

export const renderClientsLog = (dom, state, openClientPage) => {
    const container = dom.clientsLogContainer;
    if (!container) return;

    const clients = state.clients || [];
    
    // Group clients by parent
    const parents = clients.filter(c => c.isInvoicingClient);
    const children = clients.filter(c => !c.isInvoicingClient);
    
    container.innerHTML = '';
    
    if (parents.length === 0) {
        container.innerHTML = '<p class="text-gray-400 text-center py-8">No clients yet. Click "Add Client" to get started.</p>';
        return;
    }
    
    // Render each parent with its children
    parents.sort((a, b) => (a.companyName || '').localeCompare(b.companyName || '')).forEach(parent => {
        const parentChildren = children.filter(c => c.parentClientId === parent.id);
        
        const section = document.createElement('div');
        section.className = 'mb-6 bg-white rounded-lg shadow';
        
        section.innerHTML = `
            <div class="p-4 bg-gray-50 border-b border-gray-200 rounded-t-lg cursor-pointer hover:bg-gray-100" data-client-id="${parent.id}">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <i class="fas fa-building text-red-600 text-xl"></i>
                        <div>
                            <h3 class="font-bold text-gray-800">${parent.companyName}</h3>
                            <p class="text-sm text-gray-500">${parent.clientNumber} | ${parentChildren.length} site${parentChildren.length !== 1 ? 's' : ''}</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        ${!parent.isActive ? '<span class="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">Inactive</span>' : ''}
                        <i class="fas fa-chevron-right text-gray-400"></i>
                    </div>
                </div>
            </div>
            <div class="divide-y divide-gray-100">
                ${parentChildren.map(child => `
                    <div class="p-3 pl-12 hover:bg-gray-50 cursor-pointer" data-client-id="${child.id}">
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="font-medium text-gray-700">${child.siteName || child.companyName}</span>
                                <span class="text-sm text-gray-500 ml-2">${child.clientNumber}</span>
                            </div>
                            ${!child.isActive ? '<span class="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">Inactive</span>' : ''}
                        </div>
                        <p class="text-xs text-gray-400 mt-1">${child.address || ''}</p>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.appendChild(section);
    });
    
    // Add click handlers
    container.querySelectorAll('[data-client-id]').forEach(el => {
        el.addEventListener('click', () => {
            const clientId = el.dataset.clientId;
            if (openClientPage) openClientPage(clientId);
        });
    });
};

export const renderClientPage = (dom, state, clientId, openJobModal) => {
    const client = state.clients.find(c => c.id === clientId);
    if (!client) return;
    
    const page = dom.clientPage;
    if (!page) return;
    
    // Update main title with client name
    const mainTitle = document.getElementById('mainTitle');
    if (mainTitle) {
        mainTitle.textContent = 'PFSN Management System - ' + client.companyName + (client.siteName ? ` (${client.siteName})` : '');
    }
    
    // Reset tabs to Details tab (always start on Details)
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
            if (tab === 'details') {
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
    
    // Render tabs based on current view
    renderClientDetailsTab(dom, client, state);
    renderClientFinanceTab(dom, client, state);
    renderClientScheduledServicesTab(dom, client, state);
    renderClientActivityTab(dom, client);
    renderClientJobsList(dom, client, state, openJobModal);
};

const renderClientDetailsTab = (dom, client, state) => {
    const container = dom.clientDetailsTab;
    if (!container) return;
    
    const parent = client.parentClientId ? state.clients.find(c => c.id === client.parentClientId) : null;
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 class="font-semibold text-gray-700 mb-3">Client Information</h4>
                <div class="space-y-2 text-sm">
                    <div><span class="text-gray-500">Client Number:</span> <span class="font-medium">${client.clientNumber}</span></div>
                    <div><span class="text-gray-500">Company:</span> <span class="font-medium">${client.companyName}</span></div>
                    ${client.siteName ? `<div><span class="text-gray-500">Site:</span> <span class="font-medium">${client.siteName}</span></div>` : ''}
                    <div><span class="text-gray-500">Type:</span> <span class="font-medium">${client.isInvoicingClient ? 'Invoicing Client' : 'Site'}</span></div>
                    ${parent ? `<div><span class="text-gray-500">Parent Company:</span> <span class="font-medium">${parent.companyName}</span></div>` : ''}
                    <div><span class="text-gray-500">Status:</span> <span class="px-2 py-1 ${client.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs font-semibold rounded">${client.isActive ? 'Active' : 'Inactive'}</span></div>
                </div>
            </div>
            
            <div>
                <h4 class="font-semibold text-gray-700 mb-3">Address</h4>
                <div class="text-sm space-y-1">
                    ${client.address ? `<div>${client.address}</div>` : ''}
                    ${client.city ? `<div>${client.city}</div>` : ''}
                    ${client.postcode ? `<div>${client.postcode}</div>` : ''}
                </div>
                ${client.billingAddress ? `
                    <h4 class="font-semibold text-gray-700 mb-3 mt-4">Billing Address</h4>
                    <div class="text-sm">${client.billingAddress}</div>
                ` : ''}
            </div>
            
            <div>
                <h4 class="font-semibold text-gray-700 mb-3">Primary Contact</h4>
                <div class="space-y-2 text-sm">
                    ${client.contact1Name ? `<div><span class="text-gray-500">Name:</span> ${client.contact1Name}</div>` : ''}
                    ${client.contact1Tel ? `<div><span class="text-gray-500">Tel:</span> <a href="tel:${client.contact1Tel}" class="text-blue-600 hover:underline">${client.contact1Tel}</a></div>` : ''}
                    ${client.contact1Email ? `<div><span class="text-gray-500">Email:</span> <a href="mailto:${client.contact1Email}" class="text-blue-600 hover:underline">${client.contact1Email}</a></div>` : ''}
                </div>
            </div>
            
            ${client.contact2Name || client.contact2Tel || client.contact2Email ? `
                <div>
                    <h4 class="font-semibold text-gray-700 mb-3">Secondary Contact</h4>
                    <div class="space-y-2 text-sm">
                        ${client.contact2Name ? `<div><span class="text-gray-500">Name:</span> ${client.contact2Name}</div>` : ''}
                        ${client.contact2Tel ? `<div><span class="text-gray-500">Tel:</span> <a href="tel:${client.contact2Tel}" class="text-blue-600 hover:underline">${client.contact2Tel}</a></div>` : ''}
                        ${client.contact2Email ? `<div><span class="text-gray-500">Email:</span> <a href="mailto:${client.contact2Email}" class="text-blue-600 hover:underline">${client.contact2Email}</a></div>` : ''}
                    </div>
                </div>
            ` : ''}
            
            ${client.documentLink ? `
                <div class="md:col-span-2">
                    <h4 class="font-semibold text-gray-700 mb-3">Documents</h4>
                    <a href="${client.documentLink}" target="_blank" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline">
                        <i class="fas fa-folder-open"></i>
                        <span>Open SharePoint Document Folder</span>
                        <i class="fas fa-external-link-alt text-xs"></i>
                    </a>
                </div>
            ` : ''}
            
            ${client.specialInstructions ? `
                <div class="md:col-span-2">
                    <h4 class="font-semibold text-gray-700 mb-3">Special Instructions / Access Codes</h4>
                    <div class="text-sm bg-yellow-50 border border-yellow-200 rounded p-3 whitespace-pre-wrap">${client.specialInstructions}</div>
                </div>
            ` : ''}
        </div>
        
        <div class="mt-6 flex gap-3">
            <button id="editClientBtn" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                <i class="fas fa-edit mr-2"></i>Edit Client
            </button>
            <button id="toggleClientActiveBtn" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
                ${client.isActive ? 'Deactivate' : 'Reactivate'} Client
            </button>
        </div>
    `;
};

const renderClientFinanceTab = (dom, client, state) => {
    const container = dom.clientFinanceTab;
    if (!container) return;
    
    // Calculate totals from jobs/quotes
    const clientJobs = state.jobs.filter(j => j.company === client.companyName);
    const clientQuotes = state.quotes.filter(q => q.company === client.companyName);
    
    const totalJobsValue = clientJobs.reduce((sum, j) => sum + (parseFloat(j.cost) || 0), 0);
    const totalQuotesValue = clientQuotes.reduce((sum, q) => sum + (parseFloat(q.value) || 0), 0);
    const wonQuotesValue = clientQuotes.filter(q => q.status === 'Won').reduce((sum, q) => sum + (parseFloat(q.value) || 0), 0);
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 class="text-sm font-medium text-blue-900 mb-2">Total Jobs Value</h4>
                <p class="text-2xl font-bold text-blue-600">£${totalJobsValue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
                <p class="text-xs text-blue-700 mt-1">${clientJobs.length} job${clientJobs.length !== 1 ? 's' : ''}</p>
            </div>
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 class="text-sm font-medium text-green-900 mb-2">Won Quotes</h4>
                <p class="text-2xl font-bold text-green-600">£${wonQuotesValue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
                <p class="text-xs text-green-700 mt-1">${clientQuotes.filter(q => q.status === 'Won').length} won</p>
            </div>
            <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 class="text-sm font-medium text-purple-900 mb-2">All Quotes Value</h4>
                <p class="text-2xl font-bold text-purple-600">£${totalQuotesValue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
                <p class="text-xs text-purple-700 mt-1">${clientQuotes.length} quote${clientQuotes.length !== 1 ? 's' : ''}</p>
            </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h4 class="font-semibold text-gray-700 mb-3">Payment Information</h4>
                <div class="space-y-2 text-sm">
                    ${client.paymentTerms ? `<div><span class="text-gray-500">Payment Terms:</span> <span class="font-medium">${client.paymentTerms}</span></div>` : '<div class="text-gray-400">No payment terms set</div>'}
                    ${client.creditLimit ? `<div><span class="text-gray-500">Credit Limit:</span> <span class="font-medium">£${parseFloat(client.creditLimit).toLocaleString('en-GB')}</span></div>` : ''}
                    ${client.vatNumber ? `<div><span class="text-gray-500">VAT Number:</span> <span class="font-medium">${client.vatNumber}</span></div>` : ''}
                </div>
            </div>
            <div>
                <h4 class="font-semibold text-gray-700 mb-3">Outstanding (Placeholder)</h4>
                <p class="text-gray-400 text-sm">Future: Outstanding invoices will appear here</p>
            </div>
        </div>
    `;
};

const renderClientScheduledServicesTab = (dom, client, state) => {
    const container = dom.clientScheduledServicesTab;
    if (!container) return;
    
    const services = client.scheduledServices || [];
    
    container.innerHTML = `
        <div class="mb-4 flex justify-between items-center">
            <h4 class="font-semibold text-gray-700">Fire Door Surveys</h4>
            <button id="addScheduledServiceBtn" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm">
                <i class="fas fa-plus mr-2"></i>Add Scheduled Service
            </button>
        </div>
        
        <!-- Add Service Form (hidden by default) -->
        <div id="addServiceForm" class="hidden mb-4 bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <h5 class="font-semibold text-gray-800 mb-3">New Fire Door Survey Schedule</h5>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Frequency *</label>
                    <select id="serviceFrequency" class="w-full border-2 border-gray-300 rounded px-3 py-2">
                        <option value="">Select Frequency</option>
                        <option value="3-Month">3-Month</option>
                        <option value="6-Month">6-Month</option>
                        <option value="12-Month">12-Month</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Last Completed Date</label>
                    <input type="date" id="serviceLastDate" class="w-full border-2 border-gray-300 rounded px-3 py-2">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Last Quote Value (£)</label>
                    <input type="number" step="0.01" id="serviceLastQuote" class="w-full border-2 border-gray-300 rounded px-3 py-2" placeholder="0.00">
                </div>
            </div>
            <div class="flex gap-2">
                <button id="saveServiceBtn" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                    <i class="fas fa-check mr-2"></i>Save
                </button>
                <button id="cancelServiceBtn" class="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                    Cancel
                </button>
            </div>
        </div>
        
        ${services.length === 0 ? '<p class="text-gray-400 text-center py-8">No scheduled services</p>' : `
            <div class="space-y-3">
                ${services.map((service, idx) => {
                    const nextDue = service.nextDueDate ? new Date(service.nextDueDate) : null;
                    const isUpcoming = nextDue && (nextDue - new Date()) < (30 * 24 * 60 * 60 * 1000); // within 30 days
                    
                    return `
                        <div class="border ${isUpcoming ? 'border-orange-300 bg-orange-50' : 'border-gray-200'} rounded-lg p-4">
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center gap-3">
                                    <i class="fas fa-door-closed text-red-600"></i>
                                    <span class="font-medium">Fire Door Survey</span>
                                    <span class="px-2 py-1 text-xs font-semibold rounded ${service.status === 'Active' ? 'bg-green-100 text-green-800' : service.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}">${service.status || 'Active'}</span>
                                </div>
                                <button class="text-blue-600 hover:text-blue-800 edit-service-btn" data-index="${idx}">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                            <div class="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <span class="text-gray-500">Frequency:</span>
                                    <span class="font-medium ml-2">${service.frequency || '-'}</span>
                                </div>
                                <div>
                                    <span class="text-gray-500">Last Completed:</span>
                                    <span class="font-medium ml-2">${service.lastCompletedDate ? new Date(service.lastCompletedDate).toLocaleDateString('en-GB') : '-'}</span>
                                </div>
                                <div>
                                    <span class="text-gray-500">Next Due:</span>
                                    <span class="font-medium ml-2 ${isUpcoming ? 'text-orange-600 font-bold' : ''}">${nextDue ? nextDue.toLocaleDateString('en-GB') : '-'}</span>
                                </div>
                            </div>
                            ${service.lastQuoteValue ? `<div class="text-sm text-gray-500 mt-2">Last Quote: £${parseFloat(service.lastQuoteValue).toLocaleString('en-GB', { minimumFractionDigits: 2 })}</div>` : ''}
                        </div>
                    `;
                }).join('')}
            </div>
        `}
    `;
};

const renderClientActivityTab = (dom, client) => {
    const container = dom.clientActivityTab;
    if (!container) return;
    
    const activities = client.activityLog || [];
    
    container.innerHTML = `
        <div class="mb-4">
            <h4 class="font-semibold text-gray-700 mb-3">Activity Log (ISO9001 Compliance)</h4>
            <div class="flex gap-2">
                <input id="newActivityNote" type="text" placeholder="Add activity note..." class="flex-1 border-2 border-gray-300 rounded px-3 py-2">
                <button id="addActivityNoteBtn" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    <i class="fas fa-plus mr-2"></i>Add Note
                </button>
            </div>
        </div>
        
        <div class="border-2 border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto bg-gray-50">
            ${activities.length === 0 ? '<p class="text-gray-400 text-sm">No activity recorded yet</p>' : 
                activities.slice().reverse().map(activity => `
                    <div class="mb-3 pb-3 border-b border-gray-200 last:border-0">
                        <p class="text-sm text-gray-800">${activity.note}</p>
                        <p class="text-xs text-gray-400 mt-1">${new Date(activity.timestamp).toLocaleString('en-GB')}</p>
                    </div>
                `).join('')
            }
        </div>
    `;
};

const renderClientJobsList = (dom, client, state, openJobModal) => {
    const container = dom.clientJobsList;
    if (!container) return;
    
    // Find jobs for this client (match by company name for now)
    const clientJobs = state.jobs.filter(j => j.company === client.companyName);
    
    container.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h4 class="font-semibold text-gray-700">Jobs (${clientJobs.length})</h4>
            <button id="addClientJobBtn" class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm">
                <i class="fas fa-plus mr-2"></i>Add Job for this Client
            </button>
        </div>
        
        ${clientJobs.length === 0 ? '<p class="text-gray-400 text-center py-8">No jobs for this client yet</p>' : `
            <div class="space-y-2">
                ${clientJobs.map(job => `
                    <div class="border border-gray-200 rounded p-3 hover:bg-gray-50 cursor-pointer" data-job-id="${job.id}">
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="font-medium">${job.category || '-'}</span>
                                <span class="text-sm text-gray-500 ml-2">${job.site || ''}</span>
                            </div>
                            <div class="text-sm text-gray-500">${job.isCompleted ? 'Completed' : (job.isScheduled ? 'Scheduled' : 'Unscheduled')}</div>
                        </div>
                        ${job.startDate ? `<div class="text-xs text-gray-400 mt-1">${job.startDate} ${job.endDate && job.endDate !== job.startDate ? '- ' + job.endDate : ''}</div>` : ''}
                    </div>
                `).join('')}
            </div>
        `}
    `;
    
    // Add click handlers
    container.querySelectorAll('[data-job-id]').forEach(el => {
        el.addEventListener('click', () => {
            if (openJobModal) openJobModal(el.dataset.jobId);
        });
    });
};
