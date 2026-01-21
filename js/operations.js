// operations.js - render job lists for Operations page
export const renderOperationsJobs = (dom, state, openJobModal) => {
    if (!dom || !state) return;

    // Pending jobs: not completed
    const pending = (state.jobs || []).filter(j => !j.isCompleted).sort((a,b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
    dom.opsPendingJobsList.innerHTML = '';
    if (pending.length === 0) {
        dom.opsPendingJobsList.innerHTML = '<p class="text-sm text-gray-400">No pending jobs</p>';
    } else {
        pending.forEach(job => {
            const el = document.createElement('div');
            el.className = 'p-3 border border-gray-100 rounded hover:bg-gray-50 cursor-pointer';
            el.dataset.jobId = job.id;
            el.innerHTML = `
                <div class="flex items-center justify-between">
                    <div>
                        <div class="font-medium text-gray-800">${job.company || '-'} <span class="text-xs text-gray-500">${job.site || ''}</span></div>
                        <div class="text-xs text-gray-500 mt-1">${job.category || '-'}</div>
                    </div>
                    <div class="text-right text-sm text-gray-400">${job.isScheduled ? 'Scheduled' : 'Unscheduled'}</div>
                </div>`;
            el.addEventListener('click', () => openJobModal(job.id));
            dom.opsPendingJobsList.appendChild(el);
        });
    }

    // Populate All Jobs filters
    const allJobs = state.jobs || [];
    const categories = Array.from(new Set(allJobs.map(j => j.category).filter(Boolean))).sort();
    dom.opsJobsCategoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(c => {
        const opt = document.createElement('option'); opt.value = c; opt.textContent = c; dom.opsJobsCategoryFilter.appendChild(opt);
    });

    const renderAllList = () => {
        const q = (dom.opsJobsSearch.value || '').toLowerCase();
        const status = dom.opsJobsStatusFilter.value;
        const cat = dom.opsJobsCategoryFilter.value;

        let filtered = allJobs.slice();
        if (status) {
            if (status === 'scheduled') filtered = filtered.filter(j => j.isScheduled);
            else if (status === 'unscheduled') filtered = filtered.filter(j => !j.isScheduled);
            else if (status === 'completed') filtered = filtered.filter(j => j.isCompleted);
        }
        if (cat) filtered = filtered.filter(j => (j.category || '') === cat);
        if (q) {
            filtered = filtered.filter(j => ((j.company||'')+ ' ' + (j.site||'') + ' ' + (j.notes||'')).toLowerCase().includes(q));
        }

        dom.opsAllJobsList.innerHTML = '';
        if (filtered.length === 0) {
            dom.opsAllJobsList.innerHTML = '<p class="text-sm text-gray-400">No jobs match the filters</p>';
            return;
        }

        filtered.sort((a,b) => ((b.createdAt && b.createdAt.seconds) ? b.createdAt.seconds : 0) - ((a.createdAt && a.createdAt.seconds) ? a.createdAt.seconds : 0));
        filtered.forEach(job => {
            const row = document.createElement('div');
            row.className = 'p-3 border border-gray-100 rounded flex items-center justify-between hover:bg-gray-50 cursor-pointer';
            row.dataset.jobId = job.id;
            row.innerHTML = `
                <div>
                    <div class="font-medium text-gray-800">${job.company || '-'} <span class="text-xs text-gray-500">${job.site || ''}</span></div>
                    <div class="text-xs text-gray-500">${job.category || '-'} ${job.isScheduled ? '| '+(job.startDate || '') : ''}</div>
                </div>
                <div class="text-sm text-gray-500">${job.isCompleted ? 'Completed' : (job.isScheduled ? 'Scheduled' : 'Unscheduled')}</div>
            `;
            row.addEventListener('click', () => openJobModal(job.id));
            dom.opsAllJobsList.appendChild(row);
        });
    };

    // Attach filter handlers
    dom.opsJobsSearch.oninput = renderAllList;
    dom.opsJobsStatusFilter.onchange = renderAllList;
    dom.opsJobsCategoryFilter.onchange = renderAllList;
    dom.opsJobsResetFilters.onclick = () => {
        dom.opsJobsSearch.value = '';
        dom.opsJobsStatusFilter.value = '';
        dom.opsJobsCategoryFilter.value = '';
        renderAllList();
    };

    // Initial render
    renderAllList();
};
