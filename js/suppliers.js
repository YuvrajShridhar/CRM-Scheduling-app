import { appState } from './config.js';
import { formatDate } from './utils.js';

export function generateSupplierNumber() {
    if (appState.suppliers.length === 0) {
        return 'PFSS0001';
    }

    const existingNumbers = appState.suppliers
        .map(s => s.accountNumber)
        .filter(num => num && num.startsWith('PFSS'))
        .map(num => parseInt(num.replace('PFSS', '')))
        .filter(num => !isNaN(num));

    if (existingNumbers.length === 0) {
        return 'PFSS0001';
    }

    const maxNumber = Math.max(...existingNumbers);
    const nextNumber = maxNumber + 1;
    return `PFSS${String(nextNumber).padStart(4, '0')}`;
}

export function renderSuppliersLog() {
    const suppliersLog = document.getElementById('suppliersLog');
    if (!suppliersLog) return;

    const activeSuppliers = appState.suppliers.filter(s => s.isActive);
    const inactiveSuppliers = appState.suppliers.filter(s => !s.isActive);

    if (appState.suppliers.length === 0) {
        suppliersLog.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-truck text-6xl mb-4 opacity-30"></i>
                <p class="text-lg font-medium">No suppliers yet</p>
                <p class="text-sm">Click "Add Supplier" to create your first supplier</p>
            </div>
        `;
        return;
    }

    let html = '';

    // Active Suppliers
    if (activeSuppliers.length > 0) {
        html += `<div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-700 mb-3">Active Suppliers (${activeSuppliers.length})</h3>
            <div class="space-y-2">`;
        
        activeSuppliers.sort((a, b) => a.company.localeCompare(b.company)).forEach(supplier => {
            html += `
                <div class="border-l-4 border-green-500 bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer" onclick="window.openSupplierPage('${supplier.id}')">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-800 text-lg">${supplier.company}</h4>
                            <div class="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                                ${supplier.contact ? `<p><i class="fas fa-user mr-2 text-green-500"></i>${supplier.contact}</p>` : ''}
                                ${supplier.phone ? `<p><i class="fas fa-phone mr-2 text-green-500"></i>${supplier.phone}</p>` : ''}
                                ${supplier.email ? `<p><i class="fas fa-envelope mr-2 text-green-500"></i>${supplier.email}</p>` : ''}
                                ${supplier.paymentTerms ? `<p><i class="fas fa-calendar mr-2 text-green-500"></i>Terms: ${formatPaymentTerms(supplier.paymentTerms)}</p>` : ''}
                            </div>
                        </div>
                        <i class="fas fa-chevron-right text-gray-400"></i>
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }

    // Inactive Suppliers
    if (inactiveSuppliers.length > 0) {
        html += `<div>
            <h3 class="text-lg font-semibold text-gray-700 mb-3">Inactive Suppliers (${inactiveSuppliers.length})</h3>
            <div class="space-y-2">`;
        
        inactiveSuppliers.sort((a, b) => a.company.localeCompare(b.company)).forEach(supplier => {
            html += `
                <div class="border-l-4 border-gray-300 bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer opacity-60" onclick="window.openSupplierPage('${supplier.id}')">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-600 text-lg">${supplier.company}</h4>
                            <div class="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-500">
                                ${supplier.contact ? `<p><i class="fas fa-user mr-2"></i>${supplier.contact}</p>` : ''}
                                ${supplier.phone ? `<p><i class="fas fa-phone mr-2"></i>${supplier.phone}</p>` : ''}
                            </div>
                        </div>
                        <span class="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Inactive</span>
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }

    suppliersLog.innerHTML = html;
}

export function renderSupplierPage(supplierId) {
    const supplier = appState.suppliers.find(s => s.id === supplierId);
    if (!supplier) {
        console.error('[SUPPLIER] Supplier not found:', supplierId);
        return;
    }

    console.log('[SUPPLIER] Rendering supplier page:', supplier);
    appState.currentSupplierId = supplierId;

    // Update main title with supplier name
    const mainTitle = document.getElementById('mainTitle');
    if (mainTitle) {
        mainTitle.textContent = 'PFSN Management System - ' + supplier.company;
    }
    
    const content = document.getElementById('supplierDetailsContent');
    if (!content) {
        console.error('[SUPPLIER] supplierDetailsContent element not found');
        return;
    }
    
    // Build contact info
    let contactInfo = '';
    if (supplier.contact) contactInfo += `<p><span class="font-medium">Contact:</span> ${supplier.contact}</p>`;
    if (supplier.phone) contactInfo += `<p><span class="font-medium">Phone:</span> ${supplier.phone}</p>`;
    if (supplier.email) contactInfo += `<p><span class="font-medium">Email:</span> <a href="mailto:${supplier.email}" class="text-green-600 hover:underline">${supplier.email}</a></p>`;
    
    // Build address - check both old (address) and new (address1, address2, etc.) formats
    const hasOldAddress = supplier.address;
    const hasNewAddress = supplier.address1 || supplier.address2 || supplier.address3 || supplier.county || supplier.postcode;
    
    if (hasNewAddress) {
        contactInfo += `<p><span class="font-medium">Address:</span><br/>`;
        if (supplier.address1) contactInfo += `${supplier.address1}<br/>`;
        if (supplier.address2) contactInfo += `${supplier.address2}<br/>`;
        if (supplier.address3) contactInfo += `${supplier.address3}<br/>`;
        if (supplier.county) contactInfo += `${supplier.county}<br/>`;
        if (supplier.postcode) contactInfo += `${supplier.postcode}`;
        contactInfo += `</p>`;
    } else if (hasOldAddress) {
        // Legacy support for old address format
        contactInfo += `<p><span class="font-medium">Address:</span><br/>${supplier.address.replace(/\n/g, '<br/>')}</p>`;
    }
    
    if (!contactInfo) {
        contactInfo = '<p class="text-gray-500 italic">No contact information added</p>';
    }
    
    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 class="text-sm font-semibold text-gray-600 mb-2">Contact Information</h3>
                <div class="bg-gray-50 p-4 rounded-lg space-y-2">
                    ${contactInfo}
                </div>
            </div>
            
            <div>
                <h3 class="text-sm font-semibold text-gray-600 mb-2">Account Information</h3>
                <div class="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span class="font-medium">Account Number:</span> <span class="text-green-700 font-semibold">${supplier.accountNumber || 'N/A'}</span></p>
                    ${supplier.paymentTerms ? `<p><span class="font-medium">Payment Terms:</span> ${formatPaymentTerms(supplier.paymentTerms)}</p>` : '<p><span class="font-medium">Payment Terms:</span> <span class="text-gray-500 italic">Not set</span></p>'}
                    <p><span class="font-medium">Status:</span> 
                        <span class="inline-block px-2 py-1 rounded text-xs font-semibold ${supplier.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}">
                            ${supplier.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </p>
                </div>
            </div>
        </div>

        ${supplier.notes ? `
            <div class="mt-6">
                <h3 class="text-sm font-semibold text-gray-600 mb-2">General Notes</h3>
                <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                    <p class="text-gray-700">${supplier.notes.replace(/\n/g, '<br/>')}</p>
                </div>
            </div>
        ` : ''}

        <div class="mt-6">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold text-gray-600">Activity Log</h3>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
                <div class="mb-4">
                    <textarea id="supplierActivityNote" rows="3" class="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200" placeholder="Add a note about this supplier..."></textarea>
                    <div class="flex justify-end mt-2">
                        <button id="saveSupplierNoteBtn" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                            <i class="fas fa-save mr-2"></i>Save Note
                        </button>
                    </div>
                </div>
                <div id="supplierActivityList" class="space-y-3">
                    ${supplier.activityLog && supplier.activityLog.length > 0 ? 
                        supplier.activityLog.slice().reverse().map(activity => `
                            <div class="bg-white border border-gray-200 rounded-lg p-3">
                                <div class="flex items-start justify-between">
                                    <div class="flex-1">
                                        <p class="text-gray-800">${activity.note}</p>
                                        <p class="text-xs text-gray-500 mt-1">
                                            ${activity.timestamp ? formatDate(activity.timestamp.toDate ? activity.timestamp.toDate() : activity.timestamp) : ''}
                                            ${activity.user ? ` • ${activity.user}` : ''}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        `).join('') 
                        : '<p class="text-gray-400 text-center py-4">No activity recorded yet</p>'
                    }
                </div>
            </div>
        </div>

        ${supplier.createdAt ? `
            <div class="mt-6 text-xs text-gray-500 border-t pt-4">
                <p>Created: ${formatDate(supplier.createdAt.toDate ? supplier.createdAt.toDate() : supplier.createdAt)}</p>
                ${supplier.updatedAt ? `<p>Last updated: ${formatDate(supplier.updatedAt.toDate ? supplier.updatedAt.toDate() : supplier.updatedAt)}</p>` : ''}
            </div>
        ` : ''}
    `;
    
    console.log('[SUPPLIER] Page rendered successfully');
}

function formatPaymentTerms(terms) {
    const termsMap = {
        'cash': 'Cash on Delivery',
        '7days': '7 Days',
        '14days': '14 Days',
        '30days': '30 Days',
        '60days': '60 Days',
        '90days': '90 Days'
    };
    return termsMap[terms] || terms;
}
