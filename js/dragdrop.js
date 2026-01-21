import { formatDate, parseDate, diffDays } from './utils.js';
import { updateJob } from './db.js';

export const addDragAndDropListeners = (state, openJobModal, openAbsenceModal) => {
    addJobCardListeners(state, openJobModal);
    addAbsenceCardListeners(state, openAbsenceModal);
    addDropZoneListeners(state, openAbsenceModal);
};

const addJobCardListeners = (state, openJobModal) => {
    console.log('[DRAGDROP] addJobCardListeners called, openJobModal type:', typeof openJobModal);
    const cards = document.querySelectorAll('.job-card');
    console.log('[DRAGDROP] Found', cards.length, 'job cards');
    
    cards.forEach(card => {
        card.addEventListener('dragstart', (e) => {
            const job = state.jobs.find(j => j.id === e.target.dataset.jobId);
            const duration = diffDays(parseDate(job.startDate), parseDate(job.endDate));
            state.draggedJobInfo = { job, duration };
            e.target.classList.add('dragging');
        });

        card.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
            state.draggedJobInfo = null;
        });

        card.addEventListener('click', (e) => {
            e.stopPropagation();
            // Get the card element (could be clicked on child element)
            const cardElement = e.target.closest('.job-card');
            const jobId = cardElement ? cardElement.dataset.jobId : null;
            console.log('[DRAGDROP] Card clicked, jobId:', jobId, 'openJobModal:', typeof openJobModal);
            if (jobId && openJobModal) {
                console.log('[DRAGDROP] Opening job modal for:', jobId);
                openJobModal(jobId);
            } else {
                console.warn('[DRAGDROP] Cannot open modal - jobId:', jobId, 'openJobModal function:', typeof openJobModal);
            }
        });
    });
};

const addAbsenceCardListeners = (state, openAbsenceModal) => {
    const cards = document.querySelectorAll('.absence-card');
    console.log('[DRAGDROP] Found', cards.length, 'absence cards');
    
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            const absenceId = card.dataset.absenceId;
            console.log('[DRAGDROP] Absence card clicked:', absenceId);
            if (absenceId && openAbsenceModal) {
                openAbsenceModal(absenceId);
            }
        });
    });
};

const addDropZoneListeners = (state, openAbsenceModal) => {
    document.querySelectorAll('.drop-zone').forEach(zone => {
        zone.addEventListener('dragover', e => {
            e.preventDefault();
            zone.classList.add('drop-zone-hover');
        });

        zone.addEventListener('dragleave', () => zone.classList.remove('drop-zone-hover'));

        // Right-click to add absence
        zone.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const engineerId = zone.dataset.engineerId;
            const date = zone.dataset.date;
            if (engineerId && date && openAbsenceModal) {
                openAbsenceModal(null, engineerId, date);
            }
        });

        zone.addEventListener('drop', async (e) => {
            e.preventDefault();
            const dropTarget = e.target.closest('.drop-zone');
            dropTarget.classList.remove('drop-zone-hover');

            if (state.draggedJobInfo && dropTarget) {
                const { job, duration } = state.draggedJobInfo;
                const newStartDate = parseDate(dropTarget.dataset.date);
                const newEndDate = new Date(newStartDate);
                newEndDate.setDate(newStartDate.getDate() + duration);

                const updatedData = {
                    startDate: formatDate(newStartDate),
                    endDate: formatDate(newEndDate),
                    engineerIds: [dropTarget.dataset.engineerId]
                };

                try {
                    await updateJob(job.id, updatedData);
                } catch (error) {
                    console.error('Error updating job:', error);
                }
            }
        });
    });
};
