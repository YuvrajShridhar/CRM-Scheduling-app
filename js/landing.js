export const renderLandingPage = (dom, state, dateOnlyFn, parseDate, openJobModal) => {
    console.log('[LANDING] renderLandingPage called');
    console.log('[LANDING] dom.wipJobsContainer:', dom.wipJobsContainer);
    console.log('[LANDING] dom.unscheduledJobsContainer:', dom.unscheduledJobsContainer);
    console.log('[LANDING] state.jobs:', state.jobs?.length || 0, 'jobs');
    
    const now = new Date();
    const todayTime = dateOnlyFn(now);
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const nextMonth = (thisMonth + 1) % 12;
    const nextMonthYear = thisMonth === 11 ? thisYear + 1 : thisYear;

    let thisMonthValue = 0;
    let nextMonthValue = 0;

    state.jobs.forEach(job => {
        if (job.cost && job.endDate) {
            const endDate = parseDate(job.endDate);
            const cost = parseFloat(job.cost) || 0;
            if (endDate.getMonth() === thisMonth && endDate.getFullYear() === thisYear) {
                thisMonthValue += cost;
            }
            if (endDate.getMonth() === nextMonth && endDate.getFullYear() === nextMonthYear) {
                nextMonthValue += cost;
            }
        }
    });

    dom.invoicedThisMonth.textContent = `£${thisMonthValue.toLocaleString()}`;
    dom.expectedNextMonth.textContent = `£${nextMonthValue.toLocaleString()}`;

    // Render WIP Jobs
    const wipJobs = state.jobs.filter(j =>
        j.isScheduled &&
        !j.isCompleted &&
        j.startDate &&
        j.endDate &&
        todayTime >= dateOnlyFn(parseDate(j.startDate)) &&
        todayTime <= dateOnlyFn(parseDate(j.endDate))
    );

    dom.wipJobsContainer.innerHTML = '';
    if (wipJobs.length > 0) {
        dom.noWipJobs.classList.add('hidden');
        wipJobs.forEach(job => {
            const card = document.createElement('div');
            card.className = 'unscheduled-card bg-white p-4 rounded-lg shadow';
            card.dataset.jobId = job.id;
            card.innerHTML = `
                <h4 class="font-bold text-gray-800">${job.company}</h4>
                <p class="text-sm text-gray-600">${job.site}</p>
                <p class="text-xs text-gray-400 mt-2">${job.category}</p>
            `;
            card.addEventListener('click', () => openJobModal(job.id));
            dom.wipJobsContainer.appendChild(card);
        });
    } else {
        dom.noWipJobs.classList.remove('hidden');
    }

    // Render Unscheduled Jobs
    const unscheduled = state.jobs.filter(j => !j.isScheduled);
    dom.unscheduledJobsContainer.innerHTML = '';
    if (unscheduled.length > 0) {
        dom.noUnscheduledJobs.classList.add('hidden');
        unscheduled.forEach(job => {
            const card = document.createElement('div');
            card.className = 'unscheduled-card bg-white p-4 rounded-lg shadow';
            card.dataset.jobId = job.id;
            card.innerHTML = `
                <h4 class="font-bold text-gray-800">${job.company}</h4>
                <p class="text-sm text-gray-600">${job.site}</p>
                <p class="text-xs text-gray-400 mt-2">${job.category}</p>
            `;
            card.addEventListener('click', () => openJobModal(job.id));
            dom.unscheduledJobsContainer.appendChild(card);
        });
    } else {
        dom.noUnscheduledJobs.classList.remove('hidden');
    }
};
