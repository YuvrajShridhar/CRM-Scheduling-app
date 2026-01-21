// quotes.js - Quotations Management Module

import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, Timestamp, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getDB, addJob } from './db.js';

// Generate next quote number
export const generateQuoteNumber = async () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // MM format
    const yearMonth = `${year}${month}`; // YYYYMM
    
    try {
        const db = getDB();
        if (!db) {
            console.error('[QUOTES] Database not initialized');
            return `PFSQ${yearMonth}001`;
        }
        
        const quotesRef = collection(db, 'quotes');
        const q = query(quotesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        // Find the highest sequence number for current month
        let maxSequence = 0;
        const prefix = `PFSQ${yearMonth}`;
        
        snapshot.forEach(doc => {
            const quoteNum = doc.data().quoteNumber;
            if (quoteNum && quoteNum.startsWith(prefix)) {
                const seq = parseInt(quoteNum.slice(-3));
                if (seq > maxSequence) maxSequence = seq;
            }
        });
        
        const nextSequence = (maxSequence + 1).toString().padStart(3, '0');
        return `${prefix}${nextSequence}`;
    } catch (error) {
        console.error('Error generating quote number:', error);
        const year = new Date().getFullYear();
        const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
        return `PFSQ${year}${month}001`;
    }
};

// Add new quote
export const addQuote = async (quoteData) => {
    try {
        const db = getDB();
        if (!db) throw new Error('Database not initialized');
        
        const quotesRef = collection(db, 'quotes');
        const quoteNumber = await generateQuoteNumber();
        
        const quote = {
            ...quoteData,
            quoteNumber,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        };
        
        const docRef = await addDoc(quotesRef, quote);
        console.log('[QUOTES] Quote added:', docRef.id);
        return { id: docRef.id, ...quote };
    } catch (error) {
        console.error('Error adding quote:', error);
        throw error;
    }
};

// Update quote
export const updateQuote = async (quoteId, quoteData) => {
    try {
        const db = getDB();
        if (!db) throw new Error('Database not initialized');
        
        const quoteRef = doc(db, 'quotes', quoteId);
        // Load existing quote to detect status changes and include notes
        const existingSnap = await getDoc(quoteRef);
        const existing = existingSnap && typeof existingSnap.exists === 'function' ? (existingSnap.exists() ? existingSnap.data() : null) : (existingSnap && existingSnap.exists ? existingSnap.data() : null);
        
        // Auto-populate actual close date when status changes to "Won"
        const updateData = { ...quoteData };
        if (quoteData.status === 'Won' && !quoteData.actualCloseDate) {
            updateData.actualCloseDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        }

        await updateDoc(quoteRef, {
            ...updateData,
            updatedAt: Timestamp.now()
        });
        console.log('[QUOTES] Quote updated:', quoteId);

        // If status changed to Won, create a job mapping the quote's category to job.category
        try {
            const prevStatus = existing && existing.status ? existing.status : null;
            const newStatus = updateData.status;
            if (newStatus === 'Won' && prevStatus !== 'Won') {
                // Build job object from quote
                const jobData = {
                    company: existing?.company || updateData.company || '',
                    site: existing?.site || updateData.site || '',
                    category: updateData.equipmentClass || existing?.equipmentClass || existing?.category || 'Other',
                    description: existing?.serviceDescription || existing?.worksExpected || updateData.worksExpected || updateData.equipmentOther || '',
                    notes: existing?.notes || [],
                    createdFromQuote: quoteId,
                    createdAt: Timestamp.now()
                };

                // If there was an 'Other' equipment text, add it to notes
                if (updateData.equipmentOther && updateData.equipmentOther.trim() !== '') {
                    jobData.notes = jobData.notes || [];
                    jobData.notes.push({ text: `Equipment (Other): ${updateData.equipmentOther}`, timestamp: Date.now() });
                }

                await addJob(jobData);
                console.log('[QUOTES] Created job from won quote:', quoteId);
            }
        } catch (err) {
            console.error('[QUOTES] Failed to create job when quote won:', err);
        }
    } catch (error) {
        console.error('Error updating quote:', error);
        throw error;
    }
};

// Delete quote
export const deleteQuote = async (quoteId) => {
    try {
        const db = getDB();
        if (!db) throw new Error('Database not initialized');
        
        const quoteRef = doc(db, 'quotes', quoteId);
        await deleteDoc(quoteRef);
        console.log('[QUOTES] Quote deleted:', quoteId);
    } catch (error) {
        console.error('Error deleting quote:', error);
        throw error;
    }
};

// Get all quotes
export const getQuotes = async () => {
    try {
        const db = getDB();
        if (!db) {
            console.error('[QUOTES] Database not initialized');
            return [];
        }
        
        const quotesRef = collection(db, 'quotes');
        const q = query(quotesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const quotes = [];
        snapshot.forEach(doc => {
            quotes.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`[QUOTES] Loaded ${quotes.length} quotes`);
        return quotes;
    } catch (error) {
        console.error('Error getting quotes:', error);
        return [];
    }
};

// Render quotes table
export const renderQuotesTable = (quotes, state) => {
    const tbody = document.getElementById('quotesTableBody');
    const noQuotes = document.getElementById('noQuotes');
    
    if (!quotes || quotes.length === 0) {
        tbody.innerHTML = '';
        noQuotes.classList.remove('hidden');
        return;
    }
    
    noQuotes.classList.add('hidden');
    
    // Status color mapping
    const statusColors = {
        'Awaiting': 'bg-yellow-100 text-yellow-800',
        'At Risk': 'bg-orange-100 text-orange-800',
        'On Hold': 'bg-blue-100 text-blue-800',
        'Won': 'bg-green-100 text-green-800',
        'Superseded': 'bg-gray-100 text-gray-800'
    };
    
    tbody.innerHTML = quotes.map(quote => {
        const accountManager = state.engineers.find(e => e.id === quote.accountManager);
        const managerName = accountManager ? accountManager.name : quote.accountManager || '-';
        const statusClass = statusColors[quote.status] || 'bg-gray-100 text-gray-800';
        const formattedDate = quote.createdAt ? new Date(quote.createdAt.seconds * 1000).toLocaleDateString('en-GB') : '-';
        const projectedClose = quote.projectedCloseDate ? new Date(quote.projectedCloseDate).toLocaleDateString('en-GB') : '-';
        const value = quote.value ? `£${parseFloat(quote.value).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-';
        
        return `
            <tr class="border-b hover:bg-gray-50" data-quote-id="${quote.id}">
                <td class="p-3 font-medium text-blue-600 cursor-pointer hover:underline quote-clickable">${quote.quoteNumber}</td>
                <td class="p-3 quote-clickable cursor-pointer">${formattedDate}</td>
                <td class="p-3 quote-clickable cursor-pointer">${quote.company || '-'}</td>
                <td class="p-3 quote-clickable cursor-pointer">${quote.site || '-'}</td>
                <td class="p-3 quote-clickable cursor-pointer">${managerName}</td>
                <td class="p-3 font-semibold quote-clickable cursor-pointer">${value}</td>
                <td class="p-3"><span class="px-2 py-1 rounded-full text-xs font-semibold ${statusClass}">${quote.status}</span></td>
                <td class="p-3 quote-clickable cursor-pointer">${projectedClose}</td>
                <td class="p-3" onclick="event.stopPropagation()">
                    <select class="quick-status-change border border-gray-300 rounded px-2 py-1 text-sm focus:border-red-500" data-quote-id="${quote.id}">
                        <option value="Awaiting" ${quote.status === 'Awaiting' ? 'selected' : ''}>Awaiting</option>
                        <option value="At Risk" ${quote.status === 'At Risk' ? 'selected' : ''}>At Risk</option>
                        <option value="On Hold" ${quote.status === 'On Hold' ? 'selected' : ''}>On Hold</option>
                        <option value="Won" ${quote.status === 'Won' ? 'selected' : ''}>Won</option>
                        <option value="Superseded" ${quote.status === 'Superseded' ? 'selected' : ''}>Superseded</option>
                    </select>
                </td>
            </tr>
        `;
    }).join('');
    
    // Add click handlers for opening quote modal
    tbody.querySelectorAll('.quote-clickable').forEach(cell => {
        cell.addEventListener('click', (e) => {
            const row = e.target.closest('tr');
            const quoteId = row.dataset.quoteId;
            if (window.openQuoteModalHandler) {
                window.openQuoteModalHandler(quoteId);
            }
        });
    });
    
    // Add quick status change handlers
    tbody.querySelectorAll('.quick-status-change').forEach(select => {
        select.addEventListener('change', async (e) => {
            e.stopPropagation();
            const quoteId = select.dataset.quoteId;
            const newStatus = select.value;
            const quote = quotes.find(q => q.id === quoteId);
            
            // Auto-populate actual close date when changing to Won
            const updateData = { status: newStatus };
            if (newStatus === 'Won' && quote && !quote.actualCloseDate) {
                updateData.actualCloseDate = new Date().toISOString().split('T')[0];
            }
            
            try {
                await updateQuote(quoteId, updateData);
                console.log(`Quote ${quoteId} status updated to ${newStatus}`);
            } catch (error) {
                console.error('Error updating quote status:', error);
                alert('Failed to update quote status');
                // Revert the selection
                const quote = quotes.find(q => q.id === quoteId);
                if (quote) select.value = quote.status;
            }
        });
    });
};

// Open quote modal
export const openQuoteModal = async (quote = null, state) => {
    const modal = document.getElementById('quoteModal');
    const form = document.getElementById('quoteForm');
    const title = document.getElementById('quoteModalTitle');
    const deleteBtn = document.getElementById('deleteQuoteBtn');
    
    // Reset form
    form.reset();
    document.getElementById('quoteId').value = '';
    
    // Populate account manager dropdown - ONLY office/admin staff
    const managerSelect = document.getElementById('quoteAccountManager');
    managerSelect.innerHTML = '<option value="">-- Select Account Manager --</option>';
    const officeStaff = state.engineers.filter(eng => {
        const type = (eng.type || '').toLowerCase();
        return type.includes('office') || type.includes('admin');
    });
    officeStaff.sort((a, b) => a.name.localeCompare(b.name)).forEach(eng => {
        const option = document.createElement('option');
        option.value = eng.id;
        option.textContent = eng.name;
        managerSelect.appendChild(option);
    });
    
    // Populate customer categories
    const customerCategorySelect = document.getElementById('quoteCustomerCategory');
    customerCategorySelect.innerHTML = '<option value="">-- Select Category --</option>';
    if (state.customerCategories) {
        state.customerCategories.sort().forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            customerCategorySelect.appendChild(option);
        });
    }
    
    // Populate quotation categories (using job categories)
    const equipmentClassSelect = document.getElementById('quoteEquipmentClass');
    equipmentClassSelect.innerHTML = '<option value="">-- Select Quotation Category --</option>';
    if (state.categories) {
        state.categories.sort().forEach(cls => {
            const option = document.createElement('option');
            option.value = cls;
            option.textContent = cls;
            equipmentClassSelect.appendChild(option);
        });
    }

    // Show/hide 'Other' text input when needed
    const equipmentOtherInput = document.getElementById('quoteEquipmentOther');
    const toggleEquipmentOther = () => {
        const val = equipmentClassSelect.value || '';
        if (val.toLowerCase() === 'other') {
            equipmentOtherInput.classList.remove('hidden');
        } else {
            equipmentOtherInput.classList.add('hidden');
            equipmentOtherInput.value = '';
        }
    };
    equipmentClassSelect.removeEventListener?.('change', toggleEquipmentOther);
    equipmentClassSelect.addEventListener('change', toggleEquipmentOther);
    
    // Populate lead sources
    const leadSourceSelect = document.getElementById('quoteLeadSource');
    leadSourceSelect.innerHTML = '<option value="">-- Select Source --</option>';
    if (state.leadSources) {
        state.leadSources.sort().forEach(src => {
            const option = document.createElement('option');
            option.value = src;
            option.textContent = src;
            leadSourceSelect.appendChild(option);
        });
    }
    
    if (quote) {
        // Edit mode
        title.textContent = 'Edit Quote';
        document.getElementById('quoteId').value = quote.id;
        document.getElementById('quoteNumber').value = quote.quoteNumber;
        document.getElementById('quoteCompany').value = quote.company || '';
        document.getElementById('quoteSite').value = quote.site || '';
        document.getElementById('quoteAccountManager').value = quote.accountManager || '';
        document.getElementById('quoteCustomerCategory').value = quote.customerCategory || '';
        document.getElementById('quoteContactName').value = quote.contactName || '';
        document.getElementById('quoteContactNumber').value = quote.contactNumber || '';
        document.getElementById('quoteValue').value = quote.value || '';
        document.getElementById('quoteProbability').value = quote.probability || '';
        document.getElementById('quoteLeadSource').value = quote.leadSource || '';
        document.getElementById('quoteStatus').value = quote.status || 'Awaiting';
        document.getElementById('quoteProjectedCloseDate').value = quote.projectedCloseDate || '';
        document.getElementById('quoteActualCloseDate').value = quote.actualCloseDate || '';
        document.getElementById('quoteEquipmentClass').value = quote.equipmentClass || '';
        document.getElementById('quoteEquipmentOther').value = quote.equipmentOther || '';
        // Ensure 'Other' input visibility matches current value
        toggleEquipmentOther();
        document.getElementById('quoteWorksExpected').value = quote.worksExpected || '';
        
        // Load notes
        if (state.currentQuoteNotes) {
            renderQuoteNotes(state.currentQuoteNotes);
        }
        
        deleteBtn.classList.remove('hidden');
    } else {
        // Add mode
        title.textContent = 'Add New Quote';
        const nextQuoteNumber = await generateQuoteNumber();
        document.getElementById('quoteNumber').value = nextQuoteNumber;
        
        // Clear notes
        state.currentQuoteNotes = [];
        renderQuoteNotes([]);
        
        deleteBtn.classList.add('hidden');
        // Ensure 'Other' input hidden on new quote
        toggleEquipmentOther();
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
};

// Render quote notes
export const renderQuoteNotes = (notesArray) => {
    const notesList = document.getElementById('quoteNotesList');
    if (!notesList) return;
    
    notesList.innerHTML = '';
    if (!notesArray || notesArray.length === 0) {
        notesList.innerHTML = `<p class="text-gray-400 text-sm italic p-2">No notes yet.</p>`;
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
        notesList.appendChild(noteEl);
    });
};

// Filter quotes
export const filterQuotes = (quotes, filters) => {
    return quotes.filter(quote => {
        // Status filter
        if (filters.status && quote.status !== filters.status) return false;
        
        // Account manager filter
        if (filters.manager && quote.accountManager !== filters.manager) return false;
        
        // Company search filter
        if (filters.company) {
            const searchTerm = filters.company.toLowerCase();
            const company = (quote.company || '').toLowerCase();
            if (!company.includes(searchTerm)) return false;
        }
        
        // Date filter
        if (filters.dateRange && quote.createdAt) {
            const quoteDate = new Date(quote.createdAt.seconds * 1000);
            const now = new Date();
            
            switch (filters.dateRange) {
                case 'this-month':
                    if (quoteDate.getMonth() !== now.getMonth() || quoteDate.getFullYear() !== now.getFullYear()) return false;
                    break;
                case 'this-quarter':
                    const currentQuarter = Math.floor(now.getMonth() / 3);
                    const quoteQuarter = Math.floor(quoteDate.getMonth() / 3);
                    if (quoteQuarter !== currentQuarter || quoteDate.getFullYear() !== now.getFullYear()) return false;
                    break;
                case 'this-year':
                    if (quoteDate.getFullYear() !== now.getFullYear()) return false;
                    break;
            }
        }
        
        return true;
    });
};
