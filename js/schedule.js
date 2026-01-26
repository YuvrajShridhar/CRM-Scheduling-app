import {
    formatDate,
    parseDate,
    diffDays,
    dateOnly,
    getColourByCategory,
    getSortedSpecialisations
} from './utils.js';

export const renderSchedule = (dom, state, bankHolidays) => {
    const { start, end } = state.currentView === 'week'
        ? getWeekRange(state.currentDate)
        : getMonthRange(state.currentDate);

    dom.currentDateRange.textContent = state.currentView === 'week'
        ? `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : `${start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`;

    const daysInView = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        daysInView.push(new Date(d));
    }

    dom.scheduleGrid.innerHTML = '';
    dom.scheduleGrid.style.gridTemplateColumns = `12rem repeat(${daysInView.length}, minmax(10rem, 1fr))`;
    dom.scheduleGrid.style.display = 'grid';

    renderDateHeader(dom, daysInView, bankHolidays);
    renderEngineersSchedule(dom, state, daysInView, bankHolidays, dateOnly);

    // Hide the slider - not needed
    const slider = document.getElementById('scheduleSlider');
    if (slider) {
        slider.style.display = 'none';
    }
};

// Office Schedule Renderer (filters for Office category only)
export const renderOfficeSchedule = (dom, state, bankHolidays) => {
    const { start, end } = state.currentView === 'week'
        ? getWeekRange(state.currentDate)
        : getMonthRange(state.currentDate);

    dom.currentDateRange.textContent = state.currentView === 'week'
        ? `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
        : `${start.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}`;

    const daysInView = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        daysInView.push(new Date(d));
    }

    dom.scheduleGrid.innerHTML = '';
    dom.scheduleGrid.style.gridTemplateColumns = `12rem repeat(${daysInView.length}, minmax(10rem, 1fr))`;
    dom.scheduleGrid.style.display = 'grid';

    renderDateHeader(dom, daysInView, bankHolidays);
    renderOfficeStaffSchedule(dom, state, daysInView, bankHolidays, dateOnly);

    // Hide the slider - not needed
    const slider = document.getElementById('scheduleSlider');
    if (slider) {
        slider.style.display = 'none';
    }
};

const getWeekRange = (currentDate) => {
    const s = new Date(currentDate);
    s.setHours(12, 0, 0, 0);
    const day = s.getDay();
    const diff = s.getDate() - day + (day === 0 ? -6 : 1);
    s.setDate(diff);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    return { start: s, end: e };
};

const getMonthRange = (currentDate) => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return { start, end };
};

const renderDateHeader = (dom, daysInView, bankHolidays) => {
    dom.scheduleGrid.insertAdjacentHTML('beforeend', `
        <div class="p-4 font-bold text-left sticky top-0 left-0 bg-gray-100 border-b border-r" style="z-index: 30; background-color: #f3f4f6 !important;">Engineer</div>
    `);

    const todayString = formatDate(new Date());
    daysInView.forEach(day => {
        const dateString = formatDate(day);
        let classes = 'p-2 font-bold text-center sticky top-0 border-b border-r ';
        let bgColor = '#f9fafb';
        
        if (dateString === todayString) {
            classes += 'today-highlight ';
            bgColor = '#fef2f2';
        } else if (bankHolidays.has(dateString)) {
            classes += 'bank-holiday ';
            bgColor = '#fef2f2';
        } else if ([0, 6].includes(day.getDay())) {
            classes += 'weekend-day ';
            bgColor = '#f7fafc';
        }

        dom.scheduleGrid.insertAdjacentHTML('beforeend', `
            <div class="${classes}" style="z-index: 10; background-color: ${bgColor} !important;">
                ${day.toLocaleDateString('en-GB', { weekday: 'short' })}<br>
                <span class="font-normal text-sm">${day.getDate()}</span>
            </div>
        `);
    });
};

const renderOfficeStaffSchedule = (dom, state, daysInView, bankHolidays, dateOnlyFn) => {
    // Filter for only Office category engineers
    const officeStaff = state.engineers.filter(e => e.type === 'Office' && e.isActive);
    const todayString = formatDate(new Date());

    if (officeStaff.length === 0) {
        dom.scheduleGrid.insertAdjacentHTML('beforeend', `
            <div class="col-span-full p-8 text-center text-gray-500">
                <i class="fas fa-users text-4xl mb-3"></i>
                <p class="text-lg">No office staff members found</p>
            </div>
        `);
        return;
    }

    dom.scheduleGrid.insertAdjacentHTML('beforeend', `<div class="specialisation-header"><span class="specialisation-header-text">Office Staff</span></div>`);

    officeStaff.sort((a, b) => a.name.localeCompare(b.name)).forEach(staff => {
        const nameCell = document.createElement('div');
        nameCell.className = 'p-2 font-medium border-b border-r flex items-center';
        nameCell.style.position = 'sticky';
        nameCell.style.left = '0';
        nameCell.style.backgroundColor = 'white';
        nameCell.style.zIndex = '15';
        nameCell.style.minWidth = '12rem';
        nameCell.style.maxWidth = '12rem';
        nameCell.style.width = '12rem';
        nameCell.style.boxShadow = '2px 0 4px rgba(0, 0, 0, 0.1)';
        nameCell.textContent = staff.name;
        dom.scheduleGrid.appendChild(nameCell);

        daysInView.forEach(day => {
            const dateString = formatDate(day);
            const cell = document.createElement('div');
            cell.className = 'border-b border-r drop-zone p-1 min-h-[3rem]';
            
            if (dateString === todayString) cell.classList.add('today-highlight');
            if (bankHolidays.has(dateString)) cell.classList.add('bank-holiday');
            else if ([0, 6].includes(day.getDay())) cell.classList.add('weekend-day');

            cell.dataset.date = dateString;
            cell.dataset.engineerId = staff.id;

            // Render absences first (they go underneath jobs)
            state.absences
                .filter(a => a.engineerId === staff.id)
                .forEach(absence => {
                    const startDate = parseDate(absence.startDate);
                    const endDate = parseDate(absence.endDate);
                    if (dateOnlyFn(day) >= dateOnlyFn(startDate) && dateOnlyFn(day) <= dateOnlyFn(endDate)) {
                        cell.appendChild(createAbsenceCard(absence));
                    }
                });

            // Render jobs/appointments on top of absences
            state.jobs
                .filter(j => j.engineerIds.includes(staff.id) && j.isScheduled)
                .forEach(job => {
                    // Handle appointment-based jobs differently
                    if (job.isAppointmentBased && job.appointments && job.appointments.length > 0) {
                        // For appointment-based jobs, only render on appointment dates
                        job.appointments.forEach(appointment => {
                            if (appointment.date === dateString && appointment.engineerIds.includes(staff.id)) {
                                cell.appendChild(createJobCard(job, false, appointment));
                            }
                        });
                    } else {
                        // Regular jobs: check for engineer-specific date assignments (supports multiple periods)
                        const engineerAssignments = job.engineerAssignments?.filter(a => a.engineerId === staff.id) || [];
                        
                        // Check if this date falls within ANY of the engineer's assignment periods
                        let isWithinAssignment = false;
                        
                        if (engineerAssignments.length > 0) {
                            // Check each assignment period
                            isWithinAssignment = engineerAssignments.some(assignment => {
                                const startDate = parseDate(assignment.startDate);
                                const endDate = parseDate(assignment.endDate);
                                return dateOnlyFn(day) >= dateOnlyFn(startDate) && dateOnlyFn(day) <= dateOnlyFn(endDate);
                            });
                        } else {
                            // No specific assignments, use job dates as fallback
                            const startDate = parseDate(job.startDate);
                            const endDate = parseDate(job.endDate);
                            isWithinAssignment = dateOnlyFn(day) >= dateOnlyFn(startDate) && dateOnlyFn(day) <= dateOnlyFn(endDate);
                        }
                        
                        if (isWithinAssignment) {
                            const dayOfWeek = day.getDay();
                            if (job.allowWeekendWork || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
                                // Check if there's an exception for this date/engineer
                                const hasException = job.dailyExceptions && job.dailyExceptions.some(
                                    exc => exc.date === dateString && exc.engineerId === staff.id
                                );
                                cell.appendChild(createJobCard(job, hasException));
                            }
                        }
                    }
                });

            dom.scheduleGrid.appendChild(cell);
        });
    });
};

const renderEngineersSchedule = (dom, state, daysInView, bankHolidays, dateOnlyFn) => {
    const sortedSpecialisations = getSortedSpecialisations(state.engineers);
    const todayString = formatDate(new Date());

    sortedSpecialisations.forEach(type => {
        const activeEngineersOfType = state.engineers.filter(e => e.type === type && e.isActive);
        if (activeEngineersOfType.length === 0) return;

        dom.scheduleGrid.insertAdjacentHTML('beforeend', `<div class="specialisation-header"><span class="specialisation-header-text">${type}</span></div>`);

        activeEngineersOfType.sort((a, b) => a.name.localeCompare(b.name)).forEach(engineer => {
            const nameCell = document.createElement('div');
            nameCell.className = 'p-2 font-medium border-b border-r flex items-center';
            nameCell.style.position = 'sticky';
            nameCell.style.left = '0';
            nameCell.style.backgroundColor = 'white';
            nameCell.style.zIndex = '15';
            nameCell.style.minWidth = '12rem';
            nameCell.style.maxWidth = '12rem';
            nameCell.style.width = '12rem';
            nameCell.style.boxShadow = '2px 0 4px rgba(0, 0, 0, 0.1)';
            nameCell.textContent = engineer.name;
            dom.scheduleGrid.appendChild(nameCell);

            daysInView.forEach(day => {
                const dateString = formatDate(day);
                const cell = document.createElement('div');
                cell.className = 'border-b border-r drop-zone p-1 min-h-[3rem]';
                
                if (dateString === todayString) cell.classList.add('today-highlight');
                if (bankHolidays.has(dateString)) cell.classList.add('bank-holiday');
                else if ([0, 6].includes(day.getDay())) cell.classList.add('weekend-day');

                cell.dataset.date = dateString;
                cell.dataset.engineerId = engineer.id;

                // Render absences first (they go underneath jobs)
                state.absences
                    .filter(a => a.engineerId === engineer.id)
                    .forEach(absence => {
                        const startDate = parseDate(absence.startDate);
                        const endDate = parseDate(absence.endDate);
                        if (dateOnlyFn(day) >= dateOnlyFn(startDate) && dateOnlyFn(day) <= dateOnlyFn(endDate)) {
                            cell.appendChild(createAbsenceCard(absence));
                        }
                    });

                // Render jobs on top of absences
                state.jobs
                    .filter(j => j.engineerIds.includes(engineer.id) && j.isScheduled)
                    .forEach(job => {
                        // Handle appointment-based jobs differently
                        if (job.isAppointmentBased && job.appointments && job.appointments.length > 0) {
                            // For appointment-based jobs, only render on appointment dates
                            job.appointments.forEach(appointment => {
                                if (appointment.date === dateString && appointment.engineerIds.includes(engineer.id)) {
                                    cell.appendChild(createJobCard(job, false, appointment));
                                }
                            });
                        } else {
                            // Regular jobs: check for engineer-specific date assignments (supports multiple periods)
                            const engineerAssignments = job.engineerAssignments?.filter(a => a.engineerId === engineer.id) || [];
                            
                            // Check if this date falls within ANY of the engineer's assignment periods
                            let isWithinAssignment = false;
                            
                            if (engineerAssignments.length > 0) {
                                // Check each assignment period
                                isWithinAssignment = engineerAssignments.some(assignment => {
                                    const startDate = parseDate(assignment.startDate);
                                    const endDate = parseDate(assignment.endDate);
                                    return dateOnlyFn(day) >= dateOnlyFn(startDate) && dateOnlyFn(day) <= dateOnlyFn(endDate);
                                });
                            } else {
                                // No specific assignments, use job dates as fallback
                                const startDate = parseDate(job.startDate);
                                const endDate = parseDate(job.endDate);
                                isWithinAssignment = dateOnlyFn(day) >= dateOnlyFn(startDate) && dateOnlyFn(day) <= dateOnlyFn(endDate);
                            }
                            
                            if (isWithinAssignment) {
                                const dayOfWeek = day.getDay();
                                if (job.allowWeekendWork || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
                                    // Check if there's an exception for this date/engineer
                                    const hasException = job.dailyExceptions && job.dailyExceptions.some(
                                        exc => exc.date === dateString && exc.engineerId === engineer.id
                                    );
                                    cell.appendChild(createJobCard(job, hasException));
                                }
                            }
                        }
                    });

                dom.scheduleGrid.appendChild(cell);
            });
        });
    });
};

export const createAbsenceCard = (absence) => {
    const card = document.createElement('div');
    card.className = 'absence-card';
    
    // Add type-specific styling
    const typeClass = `absence-${absence.type.toLowerCase().replace(' ', '-')}`;
    card.classList.add(typeClass);
    
    // Create structured content
    const typeDiv = document.createElement('div');
    typeDiv.className = 'absence-card-type';
    typeDiv.textContent = absence.type;
    
    card.appendChild(typeDiv);
    
    if (absence.notes && absence.notes.trim()) {
        const notesDiv = document.createElement('div');
        notesDiv.className = 'absence-card-notes';
        notesDiv.textContent = absence.notes;
        card.appendChild(notesDiv);
    }
    
    card.dataset.absenceId = absence.id;
    
    return card;
};

export const createJobCard = (job, hasException = false, appointment = null) => {
    const card = document.createElement('div');
    card.className = 'job-card';
    if (!job.isScheduled) card.classList.add('not-scheduled');
    if (hasException) card.classList.add('has-exception');

    // Create structured content
    const companyDiv = document.createElement('div');
    companyDiv.className = 'job-card-company';
    companyDiv.textContent = job.company;
    
    // Add exception indicator if present
    if (hasException) {
        const exceptionBadge = document.createElement('span');
        exceptionBadge.className = 'exception-badge';
        exceptionBadge.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        exceptionBadge.title = 'Engineer not on site this day';
        companyDiv.appendChild(exceptionBadge);
    }
    
    // Add appointment status badge if this is an appointment-based job
    if (appointment) {
        const statusBadge = document.createElement('span');
        statusBadge.className = 'appointment-status-badge';
        const statusClass = `status-${appointment.status.toLowerCase()}`;
        statusBadge.classList.add(statusClass);
        statusBadge.textContent = appointment.status;
        statusBadge.title = `Appointment Status: ${appointment.status}`;
        companyDiv.appendChild(statusBadge);
    }
    
    const siteDiv = document.createElement('div');
    siteDiv.className = 'job-card-site';
    siteDiv.textContent = job.site;
    
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'job-card-category';
    categoryDiv.textContent = job.category;
    
    card.appendChild(companyDiv);
    card.appendChild(siteDiv);
    
    // Add appointment notes if present
    if (appointment && appointment.notes) {
        const notesDiv = document.createElement('div');
        notesDiv.className = 'job-card-site';
        notesDiv.style.fontStyle = 'italic';
        notesDiv.style.color = '#8b5cf6';
        notesDiv.textContent = appointment.notes;
        card.appendChild(notesDiv);
    }
    
    card.appendChild(categoryDiv);
    
    card.draggable = true;
    card.dataset.jobId = job.id;
    
    const { bgColour, borderColour } = getColourByCategory(job.category, job.id);
    card.style.backgroundColor = bgColour;
    card.style.borderColor = borderColour;

    return card;
};
