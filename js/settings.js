export const renderSettingsLists = (dom, state, updateSettings, showAlert) => {
    renderEditableList(dom, 'category', state.categories, dom.categoryList, 'categories', updateSettings, showAlert);
    renderEditableList(dom, 'specialisation', state.specialisations, dom.specialisationList, 'specialisations', updateSettings, showAlert);
    renderEngineersInSettings(dom, state, updateSettings, showAlert);
};

export const switchSettingsTab = (dom, activeTab) => {
    ['categories', 'specialisations', 'engineers'].forEach(t => {
        dom[`${t}Tab`].classList.remove('border-red-500', 'text-red-600');
        dom[`${t}Panel`].classList.add('hidden');
    });
    activeTab.classList.add('border-red-500', 'text-red-600');
    dom[`${activeTab.id.replace('Tab', '')}Panel`].classList.remove('hidden');
};

export const renderEditableList = (dom, key, dataArray, listElement, firestoreField, updateSettings, showAlert) => {
    listElement.innerHTML = '';
    dataArray.sort().forEach(item => {
        const el = document.createElement('div');
        el.className = 'flex justify-between items-center bg-gray-100 p-2 rounded-md';
        el.innerHTML = `
            <span class="item-text">${item}</span>
            <div class="space-x-2">
               <button data-value="${item}" class="text-blue-500 hover:text-blue-700 edit-item-btn"><i class="fas fa-edit"></i></button>
               <button data-value="${item}" class="text-red-500 hover:text-red-700 remove-item-btn"><i class="fas fa-trash-alt"></i></button>
            </div>`;
        listElement.appendChild(el);
    });

    listElement.querySelectorAll('.remove-item-btn').forEach(btn => btn.addEventListener('click', async (e) => {
        const value = e.currentTarget.dataset.value;
        if (await showAlert(dom, `Are you sure you want to remove "${value}"? This cannot be undone.`, true)) {
            const updated = dataArray.filter(i => i !== value);
            try {
                await updateSettings(firestoreField, updated);
            } catch (error) {
                console.error(`Error removing ${firestoreField}:`, error);
            }
        }
    }));

    listElement.querySelectorAll('.edit-item-btn').forEach(btn => btn.addEventListener('click', async (e) => {
        const oldValue = e.currentTarget.dataset.value;
        const newValue = prompt(`Enter new name for "${oldValue}":`, oldValue);
        if (newValue && newValue.trim() !== '' && newValue !== oldValue) {
            const updated = dataArray.map(i => i === oldValue ? newValue.trim() : i);
            try {
                await updateSettings(firestoreField, updated);
                await showAlert(dom, `"${oldValue}" has been renamed to "${newValue}" for future use. This will not update existing records.`);
            } catch (error) {
                console.error(`Error updating ${firestoreField}:`, error);
            }
        }
    }));
};

export const renderEngineersInSettings = (dom, state, updateSettings, showAlert) => {
    dom.engineerList.innerHTML = '';
    state.engineers.sort((a, b) => a.name.localeCompare(b.name)).forEach(eng => {
        const el = document.createElement('div');
        el.className = `flex justify-between items-center p-2 rounded-md ${eng.isActive ? 'bg-gray-100' : 'bg-red-50 text-gray-400'}`;
        el.innerHTML = `
            <div>
                <span class="font-medium">${eng.name}</span>
                <span class="text-sm ml-2">(${eng.type})</span>
            </div>
            <div class="space-x-2">
               <button data-id="${eng.id}" class="text-blue-500 hover:text-blue-700 edit-engineer-btn"><i class="fas fa-edit"></i></button>
               <button data-id="${eng.id}" class="text-sm font-semibold py-1 px-2 rounded ${eng.isActive ? 'text-red-600 hover:bg-red-100' : 'text-green-600 hover:bg-green-100'} toggle-active-btn">${eng.isActive ? 'Deactivate' : 'Reactivate'}</button>
            </div>`;
        dom.engineerList.appendChild(el);
    });

    dom.engineerList.querySelectorAll('.edit-engineer-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const engineer = state.engineers.find(eng => eng.id === e.currentTarget.dataset.id);
        document.getElementById('engineerId').value = engineer.id;
        document.getElementById('engineerName').value = engineer.name;
        
        const select = document.getElementById('engineerType');
        select.innerHTML = '';
        state.specialisations.sort().forEach(spec => {
            const option = document.createElement('option');
            option.value = spec;
            option.textContent = spec;
            option.selected = spec === engineer.type;
            select.appendChild(option);
        });
        
        dom.engineerModal.querySelector('h2').textContent = 'Edit Engineer';
        const openModal = dom.jobModal?.closest('.modal-backdrop') ? null : null;
        // Opening engineer modal via direct method from main app
        window.engineerModalOpen?.(engineer);
    }));

    dom.engineerList.querySelectorAll('.toggle-active-btn').forEach(btn => btn.addEventListener('click', async (e) => {
        const engineer = state.engineers.find(eng => eng.id === e.currentTarget.dataset.id);
        try {
            // This will be handled by the database listener that updates engineers array
            window.toggleEngineerActive?.(engineer.id, !engineer.isActive);
        } catch (error) {
            console.error('Error toggling engineer active status:', error);
        }
    }));
};
