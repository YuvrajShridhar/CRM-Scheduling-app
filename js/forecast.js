import { parseDate, getWeekNumber, getDateOfISOWeek } from './utils.js';

export const renderForecastChart = (dom, state) => {
    const today = new Date();
    const year = today.getFullYear();
    const currentWeek = getWeekNumber(today);
    const excludedCategories = ['Scoping', 'Holiday'];

    const table = dom.forecastTable;
    table.innerHTML = '';

    // Calculate week range: 4 weeks back + current + rest of year + 8 weeks into next year
    const startWeek = Math.max(1, currentWeek - 4);
    const endOfYearWeeks = 53 - currentWeek;
    const nextYearWeeks = 8;
    const totalWeeks = (currentWeek - startWeek + 1) + endOfYearWeeks + nextYearWeeks;

    // Build array of week objects with year and week number
    const weeks = [];
    for (let i = 0; i < totalWeeks; i++) {
        const weekOffset = startWeek + i;
        let weekYear = year;
        let weekNum = weekOffset;
        
        if (weekOffset > 53) {
            weekYear = year + 1;
            weekNum = weekOffset - 53;
        }
        
        weeks.push({ year: weekYear, week: weekNum });
    }

    const thead = table.createTHead();
    const headerRow = thead.insertRow();
    let headerHTML = `<th class="forecast-header">Project (Job No.)</th>`;
    
    weeks.forEach(({ year: wYear, week: wNum }) => {
        const weekStartDate = getDateOfISOWeek(wNum, wYear);
        const formattedDate = `${String(weekStartDate.getDate()).padStart(2, '0')}/${String(weekStartDate.getMonth() + 1).padStart(2, '0')}`;
        const isCurrent = (wYear === year && wNum === currentWeek);
        const yearLabel = `'${String(wYear).slice(-2)}`;
        headerHTML += `<th class="forecast-header ${isCurrent ? 'current-week-highlight' : ''}" data-week="${wNum}" data-year="${wYear}">W${wNum}${yearLabel}<br><span class="font-normal text-xs">${formattedDate}</span></th>`;
    });
    
    headerRow.innerHTML = headerHTML;

    const tbody = table.createTBody();
    
    // Filter jobs that fall within our week range (including both years if needed)
    const minYear = weeks[0].year;
    const maxYear = weeks[weeks.length - 1].year;
    
    const jobsInRange = state.jobs.filter(job => {
        if (!job.jobNo || excludedCategories.includes(job.category)) return false;
        const startYear = parseDate(job.startDate).getFullYear();
        const endYear = parseDate(job.endDate).getFullYear();
        return (startYear >= minYear && startYear <= maxYear) || (endYear >= minYear && endYear <= maxYear);
    });

    const allProjectsForTotals = jobsInRange.reduce((acc, job) => {
        const jobNo = job.jobNo.trim();
        if (jobNo === '') return acc;
        
        // Handle project jobs with applications
        if (job.isProject && job.applications && job.applications.length > 0) {
            job.applications.forEach(app => {
                if (app.date && app.cost) {
                    const appDate = parseDate(app.date);
                    const appWeek = getWeekNumber(appDate);
                    const appKey = `${jobNo}_app_${app.number}`;
                    if (!acc[appKey]) {
                        acc[appKey] = { 
                            company: job.company, 
                            site: job.site, 
                            jobNo: jobNo,
                            appNumber: app.number,
                            totalCost: 0, 
                            latestEndDate: appDate, 
                            isScheduled: true 
                        };
                    }
                    acc[appKey].totalCost += parseFloat(app.cost || 0);
                }
            });
        } else {
            // Regular job without applications
            if (!acc[jobNo]) {
                acc[jobNo] = { company: job.company, site: job.site, jobNo: jobNo, totalCost: 0, latestEndDate: parseDate('1970-01-01'), isScheduled: true };
            }
            acc[jobNo].totalCost += parseFloat(job.cost || 0);
            const endDate = parseDate(job.endDate);
            if (endDate > acc[jobNo].latestEndDate) acc[jobNo].latestEndDate = endDate;
            if (!job.isScheduled) acc[jobNo].isScheduled = false;
        }
        return acc;
    }, {});

    const projectsForTable = jobsInRange.filter(j => !j.isCompleted).reduce((acc, job) => {
        const jobNo = job.jobNo.trim();
        if (jobNo === '') return acc;
        
        // Handle project jobs with applications
        if (job.isProject && job.applications && job.applications.length > 0) {
            job.applications.forEach(app => {
                if (app.date && app.cost) {
                    const appDate = parseDate(app.date);
                    const appWeek = getWeekNumber(appDate);
                    const appKey = `${jobNo}_app_${app.number}`;
                    if (!acc[appKey]) {
                        acc[appKey] = { 
                            company: job.company, 
                            site: job.site, 
                            jobNo: jobNo,
                            appNumber: app.number,
                            totalCost: 0, 
                            latestEndDate: appDate, 
                            isScheduled: true 
                        };
                    }
                    acc[appKey].totalCost += parseFloat(app.cost || 0);
                }
            });
        } else {
            // Regular job without applications
            if (!acc[jobNo]) {
                acc[jobNo] = { company: job.company, site: job.site, jobNo: jobNo, totalCost: 0, latestEndDate: parseDate('1970-01-01'), isScheduled: true };
            }
            acc[jobNo].totalCost += parseFloat(job.cost || 0);
            const endDate = parseDate(job.endDate);
            if (endDate > acc[jobNo].latestEndDate) acc[jobNo].latestEndDate = endDate;
            if (!job.isScheduled) acc[jobNo].isScheduled = false;
        }
        return acc;
    }, {});

    // Initialize weekly totals array based on our dynamic weeks
    const weeklyTotals = Array(weeks.length).fill(0);
    Object.values(allProjectsForTotals).forEach(project => {
        const endWeek = getWeekNumber(project.latestEndDate);
        const endYear = project.latestEndDate.getFullYear();
        
        // Find the index in our weeks array
        const weekIndex = weeks.findIndex(w => w.year === endYear && w.week === endWeek);
        if (weekIndex !== -1) {
            weeklyTotals[weekIndex] += project.totalCost;
        }
    });

    Object.entries(projectsForTable)
        .sort(([, a], [, b]) => a.company.localeCompare(b.company))
        .forEach(([key, project]) => {
            const row = tbody.insertRow();
            const endWeek = getWeekNumber(project.latestEndDate);
            const endYear = project.latestEndDate.getFullYear();
            
            const displayText = project.appNumber 
                ? `${project.company} - ${project.site} (${project.jobNo} - App ${project.appNumber})`
                : `${project.company} - ${project.site} (${project.jobNo})`;

            let rowHTML = `<td title="${displayText}">${displayText}</td>`;
            
            weeks.forEach(({ year: wYear, week: wNum }) => {
                if (wYear === endYear && wNum === endWeek && project.totalCost > 0) {
                    rowHTML += `<td class="forecast-cost ${!project.isScheduled ? 'not-scheduled' : ''}">£${project.totalCost.toLocaleString()}</td>`;
                } else {
                    rowHTML += `<td></td>`;
                }
            });
            
            row.innerHTML = rowHTML;
        });

    const tfoot = table.createTFoot();
    const footerRow = tfoot.insertRow();
    let footerHTML = `<td>Total Forecast</td>`;
    weeklyTotals.forEach(total => {
        footerHTML += `<td>£${total.toLocaleString()}</td>`;
    });
    footerRow.innerHTML = footerHTML;

    // Scroll to current week
    const currentWeekCol = table.querySelector(`.forecast-header[data-week="${currentWeek}"][data-year="${year}"]`);
    if (currentWeekCol) {
        const container = dom.forecastContainer.querySelector('.forecast-outer-container');
        const scrollPos = currentWeekCol.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (currentWeekCol.clientWidth / 2);
        container.scroll({ left: scrollPos, behavior: 'smooth' });
    }

    // Render monthly totals chart
    const monthlyTotals = Array(12).fill(0);
    Object.values(allProjectsForTotals).forEach(project => {
        if (project.totalCost > 0) {
            const monthIndex = project.latestEndDate.getMonth();
            monthlyTotals[monthIndex] += project.totalCost;
        }
    });

    renderMonthlyChart(dom, monthlyTotals, state);
};

const renderMonthlyChart = (dom, monthlyTotals, state) => {
    const ctx = document.getElementById('monthlyForecastChart');
    if (!ctx) return;

    if (state.forecastChartInstance) state.forecastChartInstance.destroy();
    
    const Chart = window.Chart;
    state.forecastChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Total Forecasted Value',
                data: monthlyTotals,
                backgroundColor: 'rgba(220, 38, 38, 0.6)',
                borderColor: 'rgba(220, 38, 38, 1)',
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
