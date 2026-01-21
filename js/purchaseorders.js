import { appState } from './config.js';
import { formatDate } from './utils.js';

export function renderPurchaseOrdersPage() {
    updatePOMetrics();
    renderOpenPOs();
    renderAllPOs();
}

export function updatePOMetrics() {
    const openPOs = appState.purchaseOrders.filter(po => 
        ['sent', 'acknowledged', 'partially-delivered'].includes(po.status)
    );
    
    const awaitingDelivery = appState.purchaseOrders.filter(po => 
        ['acknowledged', 'partially-delivered'].includes(po.status)
    );

    const totalValue = openPOs.reduce((sum, po) => sum + (po.totalAmount || 0), 0);

    // This month's POs
    const now = new Date();
    const thisMonth = appState.purchaseOrders.filter(po => {
        const poDate = po.poDate ? new Date(po.poDate) : po.createdAt?.toDate?.() || new Date();
        return poDate.getMonth() === now.getMonth() && poDate.getFullYear() === now.getFullYear();
    });
    const monthlyTotal = thisMonth.reduce((sum, po) => sum + (po.totalAmount || 0), 0);

    document.getElementById('poMetricOpen').textContent = openPOs.length;
    document.getElementById('poMetricValue').textContent = `£${totalValue.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('poMetricAwaiting').textContent = awaitingDelivery.length;
    document.getElementById('poMetricMonth').textContent = `£${monthlyTotal.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

export function renderOpenPOs() {
    const openPOsList = document.getElementById('openPOsList');
    if (!openPOsList) return;

    const openPOs = appState.purchaseOrders
        .filter(po => ['sent', 'acknowledged', 'partially-delivered'].includes(po.status))
        .sort((a, b) => (b.poDate || b.createdAt?.toDate?.() || new Date()) - (a.poDate || a.createdAt?.toDate?.() || new Date()));

    if (openPOs.length === 0) {
        openPOsList.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-file-invoice text-6xl mb-4 opacity-30"></i>
                <p class="text-lg font-medium">No open purchase orders</p>
            </div>
        `;
        return;
    }

    openPOsList.innerHTML = openPOs.map(po => {
        const supplier = appState.suppliers.find(s => s.id === po.supplierId);
        const job = appState.jobs.find(j => j.id === po.jobId);
        
        return `
            <div class="border-l-4 ${getStatusColor(po.status)} bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition mb-3">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <h4 class="font-bold text-gray-800 text-lg">${po.poNumber || 'N/A'}</h4>
                            <span class="text-xs px-2 py-1 rounded font-semibold ${getStatusBadgeColor(po.status)}">
                                ${formatStatus(po.status)}
                            </span>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                            <p><i class="fas fa-truck mr-2 text-green-500"></i>${supplier?.company || 'Unknown Supplier'}</p>
                            <p><i class="fas fa-briefcase mr-2 text-blue-500"></i>${job?.jobNo || 'Unknown Job'}</p>
                            <p><i class="fas fa-calendar mr-2 text-gray-500"></i>${po.poDate ? new Date(po.poDate).toLocaleDateString('en-GB') : (po.createdAt ? formatDate(po.createdAt.toDate ? po.createdAt.toDate() : po.createdAt) : 'N/A')}</p>
                        </div>
                        <div class="mt-2">
                            <p class="text-sm font-semibold text-green-700">
                                Total: £${(po.totalAmount || 0).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </p>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <button onclick="window.editPO('${po.id}')" class="text-green-600 hover:text-green-700 p-2" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="window.downloadPOPDF('${po.id}')" class="text-red-600 hover:text-red-700 p-2" title="Download PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

export function renderAllPOs() {
    const allPOsList = document.getElementById('allPOsList');
    if (!allPOsList) return;

    const statusFilter = document.getElementById('poFilterStatus')?.value || '';
    const supplierFilter = document.getElementById('poFilterSupplier')?.value || '';

    let filteredPOs = appState.purchaseOrders;

    if (statusFilter) {
        filteredPOs = filteredPOs.filter(po => po.status === statusFilter);
    }

    if (supplierFilter) {
        filteredPOs = filteredPOs.filter(po => po.supplierId === supplierFilter);
    }

    filteredPOs = filteredPOs.sort((a, b) => 
        (b.poDate || b.createdAt?.toDate?.() || new Date()) - (a.poDate || a.createdAt?.toDate?.() || new Date())
    );

    if (filteredPOs.length === 0) {
        allPOsList.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-filter text-6xl mb-4 opacity-30"></i>
                <p class="text-lg font-medium">No purchase orders match the filters</p>
            </div>
        `;
        return;
    }

    allPOsList.innerHTML = filteredPOs.map(po => {
        const supplier = appState.suppliers.find(s => s.id === po.supplierId);
        const job = appState.jobs.find(j => j.id === po.jobId);
        
        return `
            <div class="border-l-4 ${getStatusColor(po.status)} bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition mb-3">
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <h4 class="font-bold text-gray-800 text-lg">${po.poNumber || 'N/A'}</h4>
                            <span class="text-xs px-2 py-1 rounded font-semibold ${getStatusBadgeColor(po.status)}">
                                ${formatStatus(po.status)}
                            </span>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                            <p><i class="fas fa-truck mr-2 text-green-500"></i>${supplier?.company || 'Unknown Supplier'}</p>
                            <p><i class="fas fa-briefcase mr-2 text-blue-500"></i>${job?.jobNo || 'Unknown Job'}</p>
                            <p><i class="fas fa-calendar mr-2 text-gray-500"></i>${po.poDate ? new Date(po.poDate).toLocaleDateString('en-GB') : (po.createdAt ? formatDate(po.createdAt.toDate ? po.createdAt.toDate() : po.createdAt) : 'N/A')}</p>
                        </div>
                        <div class="mt-2">
                            <p class="text-sm font-semibold text-green-700">
                                Total: £${(po.totalAmount || 0).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </p>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2">
                        <button onclick="window.editPO('${po.id}')" class="text-green-600 hover:text-green-700 p-2" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="window.downloadPOPDF('${po.id}')" class="text-red-600 hover:text-red-700 p-2" title="Download PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

export function populatePOSupplierFilter() {
    const supplierFilter = document.getElementById('poFilterSupplier');
    if (!supplierFilter) return;

    const activeSuppliers = appState.suppliers
        .filter(s => s.isActive)
        .sort((a, b) => a.company.localeCompare(b.company));

    const currentValue = supplierFilter.value;
    
    supplierFilter.innerHTML = '<option value="">All Suppliers</option>' + 
        activeSuppliers.map(s => 
            `<option value="${s.id}">${s.company}</option>`
        ).join('');

    if (currentValue) {
        supplierFilter.value = currentValue;
    }
}

export function generatePONumber() {
    if (appState.purchaseOrders.length === 0) {
        return '10001';
    }

    const numbers = appState.purchaseOrders
        .map(po => parseInt(po.poNumber))
        .filter(num => !isNaN(num));

    if (numbers.length === 0) {
        return '10001';
    }

    const maxNumber = Math.max(...numbers);
    return String(maxNumber + 1);
}

export function createLineItemHTML(index, item = {}) {
    return `
        <div class="line-item grid grid-cols-12 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200" data-index="${index}">
            <div class="col-span-2">
                <label class="block text-xs font-medium text-gray-600 mb-1">Qty</label>
                <input type="number" class="line-qty w-full border border-gray-300 rounded px-2 py-1 text-sm" value="${item.quantity || 1}" min="1" step="1" required>
            </div>
            <div class="col-span-5">
                <label class="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input type="text" class="line-description w-full border border-gray-300 rounded px-2 py-1 text-sm" value="${item.description || ''}" required>
            </div>
            <div class="col-span-2">
                <label class="block text-xs font-medium text-gray-600 mb-1">Unit Price (£)</label>
                <input type="number" class="line-price w-full border border-gray-300 rounded px-2 py-1 text-sm" value="${item.unitPrice || 0}" min="0" step="0.01" required>
            </div>
            <div class="col-span-2">
                <label class="block text-xs font-medium text-gray-600 mb-1">Total</label>
                <input type="text" class="line-total w-full border border-gray-300 rounded px-2 py-1 text-sm bg-gray-100" value="£${((item.quantity || 1) * (item.unitPrice || 0)).toFixed(2)}" readonly>
            </div>
            <div class="col-span-1 flex items-end">
                <button type="button" class="remove-line-btn w-full bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm" onclick="window.removeLineItem(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function getStatusColor(status) {
    const colors = {
        'sent': 'border-blue-500',
        'acknowledged': 'border-yellow-500',
        'partially-delivered': 'border-orange-500',
        'delivered': 'border-green-500',
        'closed': 'border-gray-400',
        'cancelled': 'border-red-500'
    };
    return colors[status] || 'border-gray-300';
}

function getStatusBadgeColor(status) {
    const colors = {
        'sent': 'bg-blue-100 text-blue-700',
        'acknowledged': 'bg-yellow-100 text-yellow-700',
        'partially-delivered': 'bg-orange-100 text-orange-700',
        'delivered': 'bg-green-100 text-green-700',
        'closed': 'bg-gray-100 text-gray-700',
        'cancelled': 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
}

function formatStatus(status) {
    const statusMap = {
        'sent': 'Sent',
        'acknowledged': 'Acknowledged',
        'partially-delivered': 'Partially Delivered',
        'delivered': 'Delivered',
        'closed': 'Closed',
        'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
}

// PDF Generation
export function generatePOPDF(poId) {
    const po = appState.purchaseOrders.find(p => p.id === poId);
    if (!po) {
        console.error('PO not found:', poId);
        return;
    }

    const supplier = appState.suppliers.find(s => s.id === po.supplierId);
    const job = appState.jobs.find(j => j.id === po.jobId);

    // Load jsPDF from CDN if not already loaded
    if (typeof window.jspdf === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = () => generatePOPDFContent(po, supplier, job);
        document.head.appendChild(script);
    } else {
        generatePOPDFContent(po, supplier, job);
    }
}

function generatePOPDFContent(po, supplier, job) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = 20;

    // Company Logo/Header
    doc.setFillColor(220, 38, 38); // Red color
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PFS Network Ltd', margin, 20);

    // Right side company details
    doc.setFontSize(8);
    const rightX = pageWidth - margin;
    doc.text('Unit 3 Globe Estate', rightX, 10, { align: 'right' });
    doc.text('Field House Lane', rightX, 14, { align: 'right' });
    doc.text('Marlow', rightX, 18, { align: 'right' });
    doc.text('Buckinghamshire', rightX, 22, { align: 'right' });
    doc.text('SL7 1LW', rightX, 26, { align: 'right' });
    doc.text('Tel: 01494 474787', rightX, 30, { align: 'right' });

    yPos = 45;
    doc.setTextColor(0, 0, 0);

    // Purchase Order Title
    doc.setFillColor(34, 197, 94); // Green
    doc.rect(margin, yPos, pageWidth - (2 * margin), 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PURCHASE ORDER', margin + 5, yPos + 8);
    
    doc.setFontSize(12);
    doc.text(`PO #${po.poNumber}`, rightX - 5, yPos + 8, { align: 'right' });

    yPos += 20;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    // Two columns: Supplier Details & Order Details
    const col1X = margin;
    const col2X = pageWidth / 2 + 5;

    // Supplier Details
    doc.setFont('helvetica', 'bold');
    doc.text('SUPPLIER:', col1X, yPos);
    doc.setFont('helvetica', 'normal');
    yPos += 6;
    doc.text(supplier?.company || 'N/A', col1X, yPos);
    yPos += 5;
    if (supplier?.address1) doc.text(supplier.address1, col1X, yPos), yPos += 5;
    if (supplier?.address2) doc.text(supplier.address2, col1X, yPos), yPos += 5;
    if (supplier?.address3) doc.text(supplier.address3, col1X, yPos), yPos += 5;
    if (supplier?.county) doc.text(supplier.county, col1X, yPos), yPos += 5;
    if (supplier?.postcode) doc.text(supplier.postcode, col1X, yPos), yPos += 5;
    
    if (supplier?.contact) {
        yPos += 3;
        doc.text(`Attn: ${supplier.contact}`, col1X, yPos);
        yPos += 5;
    }
    if (supplier?.phone) doc.text(`Tel: ${supplier.phone}`, col1X, yPos), yPos += 5;
    if (supplier?.email) doc.text(`Email: ${supplier.email}`, col1X, yPos);

    // Order Details (right column)
    let rightYPos = 67;
    doc.setFont('helvetica', 'bold');
    doc.text('PO DATE:', col2X, rightYPos);
    doc.setFont('helvetica', 'normal');
    doc.text(po.poDate ? new Date(po.poDate).toLocaleDateString('en-GB') : 'N/A', col2X + 40, rightYPos);
    
    rightYPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('JOB NUMBER:', col2X, rightYPos);
    doc.setFont('helvetica', 'normal');
    doc.text(job?.jobNo || 'N/A', col2X + 40, rightYPos);
    
    rightYPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('STATUS:', col2X, rightYPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formatStatus(po.status), col2X + 40, rightYPos);

    rightYPos += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('ACCOUNT NO:', col2X, rightYPos);
    doc.setFont('helvetica', 'normal');
    doc.text(supplier?.accountNumber || 'N/A', col2X + 40, rightYPos);

    // Line Items Table
    yPos = Math.max(yPos, rightYPos) + 15;
    
    // Table Header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, pageWidth - (2 * margin), 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('QTY', margin + 2, yPos + 5.5);
    doc.text('DESCRIPTION', margin + 20, yPos + 5.5);
    doc.text('UNIT PRICE', pageWidth - 60, yPos + 5.5, { align: 'right' });
    doc.text('TOTAL', pageWidth - margin - 2, yPos + 5.5, { align: 'right' });

    yPos += 8;
    doc.setFont('helvetica', 'normal');

    // Line Items
    if (po.lineItems && po.lineItems.length > 0) {
        po.lineItems.forEach((item, index) => {
            if (yPos > 270) {
                doc.addPage();
                yPos = 20;
            }

            const lineHeight = 6;
            doc.text(String(item.quantity || 0), margin + 2, yPos + 4);
            
            // Wrap description if too long
            const descLines = doc.splitTextToSize(item.description || '', 90);
            doc.text(descLines, margin + 20, yPos + 4);
            
            doc.text(`£${(item.unitPrice || 0).toFixed(2)}`, pageWidth - 60, yPos + 4, { align: 'right' });
            doc.text(`£${(item.total || 0).toFixed(2)}`, pageWidth - margin - 2, yPos + 4, { align: 'right' });
            
            yPos += Math.max(lineHeight, descLines.length * 5);
            
            // Line separator
            doc.setDrawColor(220, 220, 220);
            doc.line(margin, yPos, pageWidth - margin, yPos);
            yPos += 2;
        });
    }

    // Total
    yPos += 5;
    doc.setFillColor(34, 197, 94);
    doc.rect(pageWidth - 70, yPos, 55, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL:', pageWidth - 65, yPos + 7);
    doc.text(`£${(po.totalAmount || 0).toFixed(2)}`, pageWidth - margin - 2, yPos + 7, { align: 'right' });

    // Notes section
    if (po.notes) {
        yPos += 20;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('NOTES:', margin, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        const noteLines = doc.splitTextToSize(po.notes, pageWidth - (2 * margin));
        doc.text(noteLines, margin, yPos);
    }

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'italic');
    doc.text('Please quote this PO number on all correspondence and invoices.', pageWidth / 2, footerY, { align: 'center' });
    doc.text('Payment terms as agreed. Thank you for your business.', pageWidth / 2, footerY + 4, { align: 'center' });

    // Save PDF
    doc.save(`PO_${po.poNumber}.pdf`);
}
