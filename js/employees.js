import { appState } from './config.js';
import { formatDate } from './utils.js';
import { updateEmployee as updateEmployeeDB } from './db.js';

// Render employees list page
export function renderEmployeesPage() {
    console.log('[EMPLOYEES] renderEmployeesPage called');
    console.log('[EMPLOYEES] appState.employees:', appState.employees);
    
    const employeesList = document.getElementById('employeesList');
    if (!employeesList) {
        console.error('[EMPLOYEES] employeesList element not found!');
        return;
    }

    const searchTerm = document.getElementById('employeeSearch')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('employeeTypeFilter')?.value || '';
    const roleFilter = document.getElementById('employeeRoleFilter')?.value || '';

    let filteredEmployees = appState.employees || [];
    console.log('[EMPLOYEES] Total employees before filter:', filteredEmployees.length);

    // Apply filters
    if (searchTerm) {
        filteredEmployees = filteredEmployees.filter(emp => 
            (emp.firstName?.toLowerCase().includes(searchTerm)) ||
            (emp.lastName?.toLowerCase().includes(searchTerm)) ||
            (emp.email?.toLowerCase().includes(searchTerm)) ||
            (emp.phone?.includes(searchTerm))
        );
    }

    if (typeFilter) {
        filteredEmployees = filteredEmployees.filter(emp => emp.employmentType === typeFilter);
    }

    if (roleFilter) {
        filteredEmployees = filteredEmployees.filter(emp => emp.role === roleFilter);
    }

    if (filteredEmployees.length === 0) {
        employeesList.innerHTML = `
            <div class="text-center py-12 text-gray-500 col-span-full">
                <i class="fas fa-users text-6xl mb-4 opacity-30"></i>
                <p class="text-lg font-medium">No employees found</p>
                <p class="text-sm mt-2">Add your first employee to get started</p>
            </div>
        `;
        return;
    }

    console.log('[EMPLOYEES] Rendering', filteredEmployees.length, 'employees');

    try {
        employeesList.innerHTML = filteredEmployees.map(emp => {
            console.log('[EMPLOYEES] Rendering employee:', emp);
            const typeColor = (emp.employmentType === 'employee') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700';
            const expiringCerts = getExpiringCertifications(emp.id);
            const employmentTypeLabel = (emp.employmentType === 'employee') ? 'Employee' : 'Subcontractor';
            
            // Convert Firebase Timestamp to Date if needed
            let startDateStr = 'N/A';
            if (emp.startDate) {
                try {
                    const date = emp.startDate.toDate ? emp.startDate.toDate() : new Date(emp.startDate);
                    startDateStr = formatDate(date);
                } catch (e) {
                    startDateStr = emp.startDate;
                }
            }
            
            return `
                <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer" onclick="window.openEmployeePage('${emp.id}')">
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                                <i class="fas fa-user text-pink-600 text-xl"></i>
                            </div>
                            <div>
                                <h3 class="font-bold text-gray-800">${emp.firstName || 'N/A'} ${emp.lastName || 'N/A'}</h3>
                                <p class="text-sm text-gray-600">${emp.role || 'N/A'}</p>
                            </div>
                        </div>
                        <span class="text-xs px-2 py-1 rounded-full font-semibold ${typeColor}">
                            ${employmentTypeLabel}
                        </span>
                    </div>
                    <div class="space-y-2 text-sm text-gray-600">
                        <p><i class="fas fa-envelope w-4 mr-2 text-pink-500"></i>${emp.email || 'N/A'}</p>
                        <p><i class="fas fa-phone w-4 mr-2 text-pink-500"></i>${emp.phone || 'N/A'}</p>
                        <p><i class="fas fa-calendar w-4 mr-2 text-pink-500"></i>Started: ${startDateStr}</p>
                        ${emp.dayRate ? `<p><i class="fas fa-pound-sign w-4 mr-2 text-blue-500"></i>Day Rate: £${emp.dayRate.toFixed(2)}</p>` : ''}
                    </div>
                    ${expiringCerts > 0 ? `
                        <div class="mt-4 pt-4 border-t">
                            <p class="text-xs text-orange-600 font-semibold">
                                <i class="fas fa-exclamation-triangle mr-1"></i>${expiringCerts} certification(s) expiring soon
                            </p>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        console.log('[EMPLOYEES] Successfully rendered employees');
    } catch (error) {
        console.error('[EMPLOYEES] Error rendering employees:', error);
        employeesList.innerHTML = `
            <div class="text-center py-12 text-red-500 col-span-full">
                <i class="fas fa-exclamation-triangle text-6xl mb-4"></i>
                <p class="text-lg font-medium">Error loading employees</p>
                <p class="text-sm mt-2">${error.message}</p>
            </div>
        `;
    }
}

// Get count of expiring certifications (within 60 days)
function getExpiringCertifications(employeeId) {
    const employee = appState.employees?.find(e => e.id === employeeId);
    if (!employee || !employee.certifications) return 0;

    // Ensure certifications is an array
    const certs = Array.isArray(employee.certifications) ? employee.certifications : [];
    if (certs.length === 0) return 0;

    const today = new Date();
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(today.getDate() + 60);

    return certs.filter(cert => {
        if (!cert.dateExpires) return false;
        const expiryDate = new Date(cert.dateExpires);
        return expiryDate >= today && expiryDate <= sixtyDaysFromNow;
    }).length;
}

// Render individual employee page
export function renderEmployeePage(employeeId) {
    const employee = appState.employees?.find(e => e.id === employeeId);
    if (!employee) {
        console.error('Employee not found:', employeeId);
        return;
    }

    // Update main title with employee name
    const mainTitle = document.getElementById('mainTitle');
    if (mainTitle) {
        mainTitle.textContent = `PFSN Management System - ${employee.firstName} ${employee.lastName}`;
    }

    // Update page details
    document.getElementById('employeeDetailName').textContent = `${employee.firstName} ${employee.lastName}`;
    document.getElementById('employeeDetailRole').textContent = employee.role || 'N/A';
    document.getElementById('employeeDetailType').textContent = employee.employmentType === 'employee' ? 'Employee' : 'Subcontractor';
    document.getElementById('employeeDetailEmail').textContent = employee.email || 'N/A';
    document.getElementById('employeeDetailPhone').textContent = employee.phone || 'N/A';
    
    const addressParts = [employee.address, employee.city, employee.postcode].filter(Boolean);
    document.getElementById('employeeDetailAddress').textContent = addressParts.length > 0 ? addressParts.join(', ') : 'N/A';
    
    // Convert Firebase Timestamp to Date if needed
    let startDateStr = 'N/A';
    if (employee.startDate) {
        try {
            const date = employee.startDate.toDate ? employee.startDate.toDate() : new Date(employee.startDate);
            startDateStr = formatDate(date);
        } catch (e) {
            startDateStr = employee.startDate;
        }
    }
    document.getElementById('employeeDetailStartDate').textContent = startDateStr;
    document.getElementById('employeeDetailEmergencyContact').textContent = employee.emergencyContactName || 'N/A';
    document.getElementById('employeeDetailEmergencyPhone').textContent = employee.emergencyContactPhone || 'N/A';

    // Update labour cost fields
    document.getElementById('employeeDetailDayRate').textContent = employee.dayRate ? `£${employee.dayRate.toFixed(2)}` : '-';
    document.getElementById('employeeDetailHourlyRate').textContent = employee.hourlyRate ? `£${employee.hourlyRate.toFixed(2)}` : '-';

    // Update type badge color
    const typeBadge = document.getElementById('employeeDetailType');
    if (employee.employmentType === 'employee') {
        typeBadge.className = 'inline-block px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700';
    } else {
        typeBadge.className = 'inline-block px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700';
    }

    // Render certifications
    renderCertifications(employee);
}

// Render certifications for an employee
function renderCertifications(employee) {
    const container = document.getElementById('certificationsContainer');
    if (!container) return;

    // Ensure certifications is an array
    const certifications = Array.isArray(employee.certifications) ? employee.certifications : [];

    if (certifications.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <i class="fas fa-certificate text-6xl mb-4 opacity-30"></i>
                <p>No certifications recorded</p>
                <p class="text-sm mt-2">Add certifications to track expiry dates</p>
            </div>
        `;
        return;
    }

    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    container.innerHTML = certifications.map((cert, index) => {
        const expiryDate = cert.dateExpires ? new Date(cert.dateExpires) : null;
        let expiryClass = 'text-gray-600';
        let expiryIcon = 'fa-calendar';
        
        if (expiryDate) {
            if (expiryDate < today) {
                expiryClass = 'text-red-600 font-semibold';
                expiryIcon = 'fa-exclamation-circle';
            } else if (expiryDate <= thirtyDaysFromNow) {
                expiryClass = 'text-orange-600 font-semibold';
                expiryIcon = 'fa-exclamation-triangle';
            } else {
                expiryClass = 'text-green-600';
                expiryIcon = 'fa-check-circle';
            }
        }

        return `
            <div class="border rounded-lg p-4 mb-4 hover:shadow-md transition">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex-1">
                        <h4 class="font-bold text-gray-800 text-lg">${cert.name}</h4>
                        ${cert.issuer ? `<p class="text-sm text-gray-600">Issued by: ${cert.issuer}</p>` : ''}
                        ${cert.number ? `<p class="text-xs text-gray-500">Certificate #: ${cert.number}</p>` : ''}
                    </div>
                    <button onclick="window.editCertification('${employee.id}', ${index})" class="text-pink-600 hover:text-pink-700 p-2">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm mb-3">
                    <div>
                        <p class="text-xs text-gray-500">Obtained</p>
                        <p class="text-gray-800">${cert.dateObtained ? formatDate(cert.dateObtained) : 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500">Expires</p>
                        <p class="${expiryClass}">
                            <i class="fas ${expiryIcon} mr-1"></i>
                            ${cert.dateExpires ? formatDate(cert.dateExpires) : 'N/A'}
                        </p>
                    </div>
                </div>
                ${cert.comments ? `<p class="text-sm text-gray-600 border-t pt-3">${cert.comments}</p>` : ''}
                ${cert.fileURL ? `
                    <div class="mt-3 pt-3 border-t">
                        <a href="${cert.fileURL}" target="_blank" rel="noopener noreferrer" class="text-pink-600 hover:text-pink-700 text-sm inline-flex items-center gap-2">
                            <i class="fas fa-file-pdf"></i>
                            <span>View Certificate Document</span>
                            <i class="fas fa-external-link-alt text-xs"></i>
                        </a>
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Save certification to employee
export async function saveCertification(employeeId, certificationData, certificationIndex = null) {
    try {
        console.log('[EMPLOYEES] saveCertification called with:', { employeeId, certificationData, certificationIndex });
        
        const employee = appState.employees.find(e => e.id === employeeId);
        if (!employee) {
            console.error('[EMPLOYEES] Employee not found:', employeeId);
            throw new Error('Employee not found');
        }

        console.log('[EMPLOYEES] Found employee:', employee);
        
        let certifications = employee.certifications || [];
        console.log('[EMPLOYEES] Current certifications:', certifications);

        if (certificationIndex !== null && certificationIndex >= 0) {
            // Update existing certification
            console.log('[EMPLOYEES] Updating certification at index:', certificationIndex);
            certifications[certificationIndex] = certificationData;
        } else {
            // Add new certification
            console.log('[EMPLOYEES] Adding new certification');
            certifications.push(certificationData);
        }

        console.log('[EMPLOYEES] Updated certifications array:', certifications);
        console.log('[EMPLOYEES] Calling updateEmployeeDB with certifications');
        
        await updateEmployeeDB(employeeId, { certifications: certifications });
        
        console.log('[EMPLOYEES] Certification saved successfully for employee:', employeeId);
        return true;
    } catch (error) {
        console.error('[EMPLOYEES] Error saving certification:', error);
        throw error;
    }
}

// Delete certification from employee
export async function deleteCertification(employeeId, certificationIndex) {
    try {
        const employee = appState.employees.find(e => e.id === employeeId);
        if (!employee) throw new Error('Employee not found');

        let certifications = employee.certifications || [];
        certifications.splice(certificationIndex, 1);

        await updateEmployeeDB(employeeId, { certifications: certifications });
        console.log('Certification deleted from employee:', employeeId);
        return true;
    } catch (error) {
        console.error('Error deleting certification:', error);
        throw error;
    }
}
