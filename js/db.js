import { SPECIALISATION_ORDER, DEFAULT_CATEGORIES } from './config.js';

// Initialize Firebase references
let db = null;
let jobsCollection = null;
let engineersCollection = null;
let absencesCollection = null;
let quotesCollection = null;
let clientsCollection = null;
let suppliersCollection = null;
let purchaseOrdersCollection = null;
let settingsDocRef = null;
let firebaseAPI = null;

// Getters for external access
export const getDB = () => db;
export const getFirebaseAPI = () => firebaseAPI;

export const initializeDatabase = (firebaseData) => {
    firebaseAPI = firebaseData;
    db = firebaseData.db;
    jobsCollection = firebaseData.collection(db, 'jobs');
    engineersCollection = firebaseData.collection(db, 'engineers');
    absencesCollection = firebaseData.collection(db, 'absences');
    quotesCollection = firebaseData.collection(db, 'quotes');
    clientsCollection = firebaseData.collection(db, 'clients');
    suppliersCollection = firebaseData.collection(db, 'suppliers');
    purchaseOrdersCollection = firebaseData.collection(db, 'purchaseOrders');
    settingsDocRef = firebaseData.doc(db, 'settings', 'config');
};

// Database Listeners
export const listenForJobs = (callback, errorCallback) => {
    if (!firebaseAPI) {
        console.error('[DB] Firebase API not initialized for jobs listener');
        return;
    }
    console.log('[DB] Setting up jobs listener...');
    firebaseAPI.onSnapshot(jobsCollection, (snapshot) => {
        const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`[DB] Jobs listener fired: ${jobs.length} jobs`);
        callback(jobs);
    }, error => {
        console.error("[DB] Jobs listener error: ", error);
        if (errorCallback) errorCallback(error);
    });
};

export const listenForEngineers = (callback, errorCallback) => {
    if (!firebaseAPI) {
        console.error('[DB] Firebase API not initialized for engineers listener');
        return;
    }
    console.log('[DB] Setting up engineers listener...');
    firebaseAPI.onSnapshot(engineersCollection, (snapshot) => {
        const engineers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`[DB] Engineers listener fired: ${engineers.length} engineers`);
        callback(engineers);
    }, error => {
        console.error("[DB] Engineers listener error: ", error);
        if (errorCallback) errorCallback(error);
    });
};

export const listenForAbsences = (callback, errorCallback) => {
    if (!firebaseAPI) {
        console.error('[DB] Firebase API not initialized for absences listener');
        return;
    }
    console.log('[DB] Setting up absences listener...');
    firebaseAPI.onSnapshot(absencesCollection, (snapshot) => {
        const absences = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`[DB] Absences listener fired: ${absences.length} absences`);
        callback(absences);
    }, error => {
        console.error("[DB] Absences listener error: ", error);
        if (errorCallback) errorCallback(error);
    });
};

export const listenForSettings = (callback, errorCallback) => {
    if (!firebaseAPI) {
        console.error('[DB] Firebase API not initialized for settings listener');
        return;
    }
    console.log('[DB] Setting up settings listener...');
    firebaseAPI.onSnapshot(settingsDocRef, (doc) => {
        if (doc.exists()) {
            const data = doc.data();
            console.log('[DB] Settings listener fired with existing data');
            callback({
                categories: data.categories || [],
                specialisations: data.specialisations || [],
                customerCategories: data.customerCategories || [],
                equipmentClasses: data.equipmentClasses || [],
                leadSources: data.leadSources || []
            });
        } else {
            console.log('[DB] Settings doc does not exist, creating with defaults');
            // Create default settings
            firebaseAPI.setDoc(settingsDocRef, {
                categories: DEFAULT_CATEGORIES,
                specialisations: [...SPECIALISATION_ORDER, 'Admin']
            }).catch(e => console.error("[DB] Error creating default settings:", e));
            
            callback({
                categories: DEFAULT_CATEGORIES,
                specialisations: [...SPECIALISATION_ORDER, 'Admin'],
                customerCategories: [],
                equipmentClasses: [],
                leadSources: []
            });
        }
    }, error => {
        console.error("[DB] Settings listener error: ", error);
        if (errorCallback) errorCallback(error);
    });
};

export const listenForQuotes = (callback, errorCallback) => {
    if (!firebaseAPI) {
        console.error('[DB] Firebase API not initialized for quotes listener');
        return;
    }
    console.log('[DB] Setting up quotes listener...');
    const q = firebaseAPI.query(quotesCollection, firebaseAPI.orderBy('createdAt', 'desc'));
    firebaseAPI.onSnapshot(q, (snapshot) => {
        const quotes = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        console.log(`[DB] Quotes listener fired: ${quotes.length} quotes`);
        callback(quotes);
    }, error => {
        console.error("[DB] Quotes listener error: ", error);
        if (errorCallback) errorCallback(error);
    });
};

// Job Operations
export const addJob = async (jobData) => {
    if (!firebaseAPI) return;
    return firebaseAPI.addDoc(jobsCollection, jobData);
};

export const updateJob = async (jobId, jobData) => {
    if (!firebaseAPI) return;
    return firebaseAPI.updateDoc(firebaseAPI.doc(jobsCollection, jobId), jobData);
};

export const deleteJob = async (jobId) => {
    if (!firebaseAPI) return;
    return firebaseAPI.deleteDoc(firebaseAPI.doc(jobsCollection, jobId));
};

// Engineer Operations
export const addEngineer = async (engineerData) => {
    if (!firebaseAPI) return;
    engineerData.isActive = true;
    return firebaseAPI.addDoc(engineersCollection, engineerData);
};

export const updateEngineer = async (engineerId, engineerData) => {
    if (!firebaseAPI) return;
    return firebaseAPI.updateDoc(firebaseAPI.doc(engineersCollection, engineerId), engineerData);
};

// Absence Operations
export const addAbsence = async (absenceData) => {
    if (!firebaseAPI) return;
    return firebaseAPI.addDoc(absencesCollection, absenceData);
};

export const updateAbsence = async (absenceId, absenceData) => {
    if (!firebaseAPI) return;
    return firebaseAPI.updateDoc(firebaseAPI.doc(absencesCollection, absenceId), absenceData);
};

export const deleteAbsence = async (absenceId) => {
    if (!firebaseAPI) return;
    return firebaseAPI.deleteDoc(firebaseAPI.doc(absencesCollection, absenceId));
};

// Settings Operations
export const updateSettings = async (field, value) => {
    if (!firebaseAPI) return;
    return firebaseAPI.updateDoc(settingsDocRef, { [field]: value });
};

// Client Operations
export const listenForClients = (callback, errorCallback) => {
    if (!firebaseAPI) {
        console.error('[DB] Firebase API not initialized for clients listener');
        return;
    }
    console.log('[DB] Setting up clients listener...');
    firebaseAPI.onSnapshot(clientsCollection, (snapshot) => {
        const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`[DB] Clients listener fired: ${clients.length} clients`);
        callback(clients);
    }, error => {
        console.error("[DB] Clients listener error: ", error);
        if (errorCallback) errorCallback(error);
    });
};

export const addClient = async (clientData) => {
    if (!firebaseAPI) return;
    clientData.createdAt = firebaseAPI.Timestamp ? firebaseAPI.Timestamp.now() : new Date();
    clientData.updatedAt = firebaseAPI.Timestamp ? firebaseAPI.Timestamp.now() : new Date();
    clientData.isActive = clientData.isActive !== undefined ? clientData.isActive : true;
    clientData.activityLog = clientData.activityLog || [];
    clientData.scheduledServices = clientData.scheduledServices || [];
    return firebaseAPI.addDoc(clientsCollection, clientData);
};

export const updateClient = async (clientId, clientData) => {
    if (!firebaseAPI) return;
    clientData.updatedAt = firebaseAPI.Timestamp ? firebaseAPI.Timestamp.now() : new Date();
    return firebaseAPI.updateDoc(firebaseAPI.doc(clientsCollection, clientId), clientData);
};

export const deleteClient = async (clientId) => {
    if (!firebaseAPI) return;
    return firebaseAPI.deleteDoc(firebaseAPI.doc(clientsCollection, clientId));
};

// Supplier Operations
export const listenForSuppliers = (callback, errorCallback) => {
    if (!firebaseAPI) {
        console.error('[DB] Firebase API not initialized for suppliers listener');
        return;
    }
    console.log('[DB] Setting up suppliers listener...');
    firebaseAPI.onSnapshot(suppliersCollection, (snapshot) => {
        const suppliers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`[DB] Suppliers listener fired: ${suppliers.length} suppliers`);
        callback(suppliers);
    }, error => {
        console.error("[DB] Suppliers listener error: ", error);
        if (errorCallback) errorCallback(error);
    });
};

export const addSupplier = async (supplierData) => {
    if (!firebaseAPI) return;
    supplierData.createdAt = firebaseAPI.Timestamp ? firebaseAPI.Timestamp.now() : new Date();
    supplierData.updatedAt = firebaseAPI.Timestamp ? firebaseAPI.Timestamp.now() : new Date();
    supplierData.isActive = supplierData.isActive !== undefined ? supplierData.isActive : true;
    return firebaseAPI.addDoc(suppliersCollection, supplierData);
};

export const updateSupplier = async (supplierId, supplierData) => {
    if (!firebaseAPI) return;
    supplierData.updatedAt = firebaseAPI.Timestamp ? firebaseAPI.Timestamp.now() : new Date();
    return firebaseAPI.updateDoc(firebaseAPI.doc(suppliersCollection, supplierId), supplierData);
};

export const deleteSupplier = async (supplierId) => {
    if (!firebaseAPI) return;
    return firebaseAPI.deleteDoc(firebaseAPI.doc(suppliersCollection, supplierId));
};

// Purchase Order Operations
export const listenForPurchaseOrders = (callback, errorCallback) => {
    if (!firebaseAPI) {
        console.error('[DB] Firebase API not initialized for purchase orders listener');
        return;
    }
    console.log('[DB] Setting up purchase orders listener...');
    firebaseAPI.onSnapshot(purchaseOrdersCollection, (snapshot) => {
        const pos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`[DB] Purchase orders listener fired: ${pos.length} POs`);
        callback(pos);
    }, error => {
        console.error("[DB] Purchase orders listener error: ", error);
        if (errorCallback) errorCallback(error);
    });
};

export const addPurchaseOrder = async (poData) => {
    if (!firebaseAPI) return;
    poData.createdAt = firebaseAPI.Timestamp ? firebaseAPI.Timestamp.now() : new Date();
    poData.updatedAt = firebaseAPI.Timestamp ? firebaseAPI.Timestamp.now() : new Date();
    return firebaseAPI.addDoc(purchaseOrdersCollection, poData);
};

export const updatePurchaseOrder = async (poId, poData) => {
    if (!firebaseAPI) return;
    poData.updatedAt = firebaseAPI.Timestamp ? firebaseAPI.Timestamp.now() : new Date();
    return firebaseAPI.updateDoc(firebaseAPI.doc(purchaseOrdersCollection, poId), poData);
};

export const deletePurchaseOrder = async (poId) => {
    if (!firebaseAPI) return;
    return firebaseAPI.deleteDoc(firebaseAPI.doc(purchaseOrdersCollection, poId));
};

// Employee Operations
export const listenForEmployees = (callback, errorCallback) => {
    if (!firebaseAPI) {
        console.error('[DB] Firebase API not initialized for employees listener');
        return;
    }
    console.log('[DB] Setting up employees listener...');
    const employeesCollection = firebaseAPI.collection(db, 'employees');
    firebaseAPI.onSnapshot(employeesCollection, (snapshot) => {
        const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`[DB] Employees listener fired: ${employees.length} employees`);
        callback(employees);
    }, error => {
        console.error("[DB] Employees listener error: ", error);
        if (errorCallback) errorCallback(error);
    });
};

export const addEmployee = async (employeeData) => {
    if (!firebaseAPI) return;
    const employeesCollection = firebaseAPI.collection(db, 'employees');
    employeeData.createdAt = firebaseAPI.Timestamp ? firebaseAPI.Timestamp.now() : new Date();
    employeeData.updatedAt = firebaseAPI.Timestamp ? firebaseAPI.Timestamp.now() : new Date();
    employeeData.certifications = employeeData.certifications || [];
    return firebaseAPI.addDoc(employeesCollection, employeeData);
};

export const updateEmployee = async (employeeId, employeeData) => {
    if (!firebaseAPI) return;
    const employeesCollection = firebaseAPI.collection(db, 'employees');
    employeeData.updatedAt = firebaseAPI.Timestamp ? firebaseAPI.Timestamp.now() : new Date();
    return firebaseAPI.updateDoc(firebaseAPI.doc(employeesCollection, employeeId), employeeData);
};

export const deleteEmployee = async (employeeId) => {
    if (!firebaseAPI) return;
    const employeesCollection = firebaseAPI.collection(db, 'employees');
    return firebaseAPI.deleteDoc(firebaseAPI.doc(employeesCollection, employeeId));
};
