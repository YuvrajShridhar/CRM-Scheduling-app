import { CATEGORY_COLOURS, SPECIALISATION_ORDER } from './config.js';

// Date Utility Functions
export const formatDate = (date) => {
    // Handle string dates (from input fields) or Date objects
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!d || isNaN(d.getTime())) return 'Invalid Date';
    
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};

export const parseDate = (dateString) => new Date(dateString + 'T00:00:00');

export const diffDays = (date1, date2) => 
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

export const dateOnly = (dt) => {
    const d = new Date(dt);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
};

export const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
};

export const getDateOfISOWeek = (w, y) => {
    const simple = new Date(y, 0, 1 + (w - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
};

// Color Generation Utility
export const getColourByCategory = (category, jobId) => {
    let baseHue;
    
    // Determine base hue by category type
    if (category === 'Holiday') {
        baseHue = 280; // Purple
    } else if (category === 'Other') {
        baseHue = 140; // Green
    } else if (category.startsWith('FD')) {
        baseHue = 210; // Blue for Fire Doors
    } else if (category.startsWith('FS')) {
        baseHue = 25; // Orange for Fire Stopping
    } else {
        baseHue = CATEGORY_COLOURS[category] || 0;
    }
    
    let hash = 0;
    for (let i = 0; i < jobId.length; i++) {
        hash = jobId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const lightness = 85 + (hash % 10);
    const saturation = 65 + (hash % 10);
    return {
        bgColour: `hsl(${baseHue}, ${saturation}%, ${lightness}%)`,
        borderColour: `hsl(${baseHue}, ${saturation - 10}%, ${lightness - 10}%)`
    };
};

// Bank Holidays Fetcher
export const fetchBankHolidays = async () => {
    const bankHolidays = new Map();
    try {
        const response = await fetch('https://www.gov.uk/bank-holidays.json');
        const data = await response.json();
        data['england-and-wales'].events.forEach(h => bankHolidays.set(h.date, h.title));
    } catch (error) {
        console.error('Could not load bank holiday data:', error);
    }
    return bankHolidays;
};

// Specialisation Sorting
export const getSortedSpecialisations = (engineers) => {
    return [...new Set(engineers.map(e => e.type))].sort((a, b) => {
        const indexA = SPECIALISATION_ORDER.indexOf(a);
        const indexB = SPECIALISATION_ORDER.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });
};
