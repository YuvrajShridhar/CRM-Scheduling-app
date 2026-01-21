import { parseDate } from './utils.js';

export const renderClientInfoPage = (dom, state, parseDateFn, openJobModal) => {
    // Preserve current filter values
    const savedCompany = dom.clientSelector.value;
    const savedWorkType = dom.clientWorkTypeFilter?.value || '';
    const savedCategory = dom.clientCategoryFilter.value;
    const savedDateRange = dom.clientDateFilter.value;
    
    const companies = [...new Set(state.jobs.map(j => j.company))].sort();

    dom.clientSelector.innerHTML = `<option value="">-- All Clients --</option>`;
    companies.forEach(c => {
        dom.clientSelector.innerHTML += `<option value="${c}">${c}</option>`;
    });

    const excludedCategories = ['Scoping', 'Holiday'];
    const availableCategories = [...new Set(state.jobs.map(j => j.category))]
        .filter(c => !excludedCategories.includes(c))
        .sort();
    
    dom.clientCategoryFilter.innerHTML = `<option value="">-- All Categories --</option>`;
    availableCategories.forEach(c => {
        dom.clientCategoryFilter.innerHTML += `<option value="${c}">${c}</option>`;
    });

    // Restore filter values
    if (savedCompany) dom.clientSelector.value = savedCompany;
    if (savedWorkType && dom.clientWorkTypeFilter) dom.clientWorkTypeFilter.value = savedWorkType;
    if (savedCategory) dom.clientCategoryFilter.value = savedCategory;
    if (savedDateRange) dom.clientDateFilter.value = savedDateRange;

    updateClientInfoView(dom, state, parseDateFn, openJobModal);
};

export const updateClientInfoView = (dom, state, parseDateFn, openJobModal) => {
    const selectedCompany = dom.clientSelector.value;
    const selectedWorkType = dom.clientWorkTypeFilter?.value || '';
    const selectedCategory = dom.clientCategoryFilter.value;
    const selectedDateRange = dom.clientDateFilter.value;
    const excludedCategories = ['Scoping', 'Holiday'];

    let filteredJobs = state.jobs.filter(j => !excludedCategories.includes(j.category));

    if (selectedCompany) {
        filteredJobs = filteredJobs.filter(j => j.company === selectedCompany);
    }
    if (selectedWorkType) {
        filteredJobs = filteredJobs.filter(j => j.category && j.category.startsWith(selectedWorkType + ' -'));
    }
    if (selectedCategory) {
        filteredJobs = filteredJobs.filter(j => j.category === selectedCategory);
    }

    if (selectedDateRange === 'past-year') {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        filteredJobs = filteredJobs.filter(j => j.endDate && parseDateFn(j.endDate) >= oneYearAgo);
    } else if (selectedDateRange === 'past-month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        filteredJobs = filteredJobs.filter(j => j.endDate && parseDateFn(j.endDate) >= oneMonthAgo);
    }

    renderClientJobsTable(dom, filteredJobs, openJobModal);
    renderClientChart(dom, filteredJobs, state);
};

const renderClientJobsTable = (dom, filteredJobs, openJobModal) => {
    const container = dom.clientJobsContainer;
    container.innerHTML = '';

    if (filteredJobs.length === 0) {
        container.innerHTML = `<p class="text-gray-500 p-4">No jobs match the selected filters.</p>`;
        return;
    }

    const table = document.createElement('table');
    table.className = 'min-w-full bg-white divide-y divide-gray-200';
    table.innerHTML = `
        <thead class="bg-gray-50">
            <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job No.</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
        </tbody>
    `;

    const tbody = table.querySelector('tbody');
    filteredJobs.sort((a, b) => parseDate(b.startDate) - parseDate(a.startDate)).forEach(job => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">${job.site || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${job.jobNo || ''}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-800">£${parseFloat(job.cost || 0).toLocaleString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${job.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                    ${job.isCompleted ? 'Completed' : 'Active'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button data-job-id="${job.id}" class="text-red-600 hover:text-red-900 edit-job-from-ci">Details</button>
            </td>
        `;
    });

    container.appendChild(table);

    // Add event listener for detail buttons
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('edit-job-from-ci')) {
            openJobModal(e.target.dataset.jobId);
        }
    });
};

const renderClientChart = (dom, filteredJobs, state) => {
    const monthlyTotals = Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    filteredJobs.forEach(job => {
        // Handle project jobs with applications
        if (job.isProject && job.applications && job.applications.length > 0) {
            job.applications.forEach(app => {
                if (app.cost && app.date) {
                    const appDate = parseDate(app.date);
                    if (appDate.getFullYear() === currentYear) {
                        const monthIndex = appDate.getMonth();
                        monthlyTotals[monthIndex] += parseFloat(app.cost || 0);
                    }
                }
            });
        } else {
            // Regular job without applications
            if (job.cost && job.endDate) {
                const endDate = parseDate(job.endDate);
                if (endDate.getFullYear() === currentYear) {
                    const monthIndex = endDate.getMonth();
                    monthlyTotals[monthIndex] += parseFloat(job.cost || 0);
                }
            }
        }
    });

    const ctx = dom.clientFinancialChart;
    if (!ctx) {
        console.error('[CLIENT] clientFinancialChart canvas not found');
        return;
    }

    if (state.clientChartInstance) state.clientChartInstance.destroy();

    const Chart = window.Chart;
    if (!Chart) {
        console.error('[CLIENT] Chart.js library not loaded');
        return;
    }

    state.clientChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: `Total Value for ${currentYear}`,
                data: monthlyTotals,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (v) => '£' + v.toLocaleString()
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (c) => `Total: £${c.parsed.y.toLocaleString()}`
                    }
                }
            }
        }
    });
};
