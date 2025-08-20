document.addEventListener('DOMContentLoaded', function() {
    loadInventory();
    loadPoints();
});

function loadPoints() {
    const points = localStorage.getItem('heroTotalPoints') || 100;
    document.getElementById('pointsValue').textContent = points;
}

function loadInventory() {
    const inventoryList = document.getElementById('inventoryList');
    const emptyMessage = document.getElementById('emptyInventory');
    
    // Get hero_items from localStorage
    const heroItems = JSON.parse(localStorage.getItem('heroItems') || '[]');
    
    if (heroItems.length === 0) {
        inventoryList.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }
    
    inventoryList.style.display = 'flex';
    emptyMessage.style.display = 'none';
    
    // Clear existing content
    inventoryList.innerHTML = '';
    
    // Group items by item_name to show quantities
    const itemCounts = {};
    heroItems.forEach(item => {
        if (itemCounts[item.item_name]) {
            itemCounts[item.item_name].quantity += item.quantity || 1;
        } else {
            itemCounts[item.item_name] = {
                ...item,
                quantity: item.quantity || 1
            };
        }
    });
    
    // Create cards for each unique item
    Object.values(itemCounts).forEach(item => {
        const itemCard = createInventoryCard(item);
        inventoryList.appendChild(itemCard);
    });
    
    // Add event listeners to equip buttons
    const equipButtons = document.querySelectorAll('.btn-equip');
    equipButtons.forEach(button => {
        button.addEventListener('click', handleEquip);
    });
    
    // Update button states based on equipped items
    updateEquipButtons();
}

function createInventoryCard(item) {
    const col = document.createElement('div');
    col.className = 'col-md-4 col-lg-3 mb-4';
    
    col.innerHTML = `
        <div class="card h-100">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${item.item_name}</h5>
                <p class="card-text">Item from your collection</p>
                <div class="mt-auto">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-primary">Quantity: ${item.quantity}</span>
                        <button class="btn btn-success btn-sm btn-equip" data-item-id="${item.item_id}" data-item-name="${item.item_name}">
                            Equip
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

function handleEquip(event) {
    const button = event.target;
    const itemId = button.getAttribute('data-item-id');
    const itemName = button.getAttribute('data-item-name');
    
    // Get current hero_items from localStorage
    let heroItems = JSON.parse(localStorage.getItem('heroItems') || '[]');
    
    // Find the item in hero_items and toggle is_equipped
    const itemIndex = heroItems.findIndex(item => item.item_id === itemId);
    if (itemIndex > -1) {
        if (heroItems[itemIndex].is_equipped) {
            // Unequip the item
            heroItems[itemIndex].is_equipped = false;
            button.textContent = 'Equip';
            button.classList.remove('btn-warning');
            button.classList.add('btn-success');
        } else {
            // Equip the item
            heroItems[itemIndex].is_equipped = true;
            button.textContent = 'Unequip';
            button.classList.remove('btn-success');
            button.classList.add('btn-warning');
        }
        
        // Save updated hero_items to localStorage
        localStorage.setItem('heroItems', JSON.stringify(heroItems));
    }
}

function updateEquipButtons() {
    const heroItems = JSON.parse(localStorage.getItem('heroItems') || '[]');
    const equipButtons = document.querySelectorAll('.btn-equip');
    
    equipButtons.forEach(button => {
        const itemId = button.getAttribute('data-item-id');
        const item = heroItems.find(item => item.item_id === itemId);
        
        if (item && item.is_equipped) {
            button.textContent = 'Unequip';
            button.classList.remove('btn-success');
            button.classList.add('btn-warning');
        } else {
            button.textContent = 'Equip';
            button.classList.remove('btn-warning');
            button.classList.add('btn-success');
        }
    });
}

// Listen for storage changes to update inventory in real-time
window.addEventListener('storage', function(e) {
    if (e.key === 'heroItems' || e.key === 'heroTotalPoints') {
        loadInventory();
        loadPoints();
    }
});

// Also listen for custom events (for same-tab updates)
window.addEventListener('inventoryUpdated', function() {
    loadInventory();
    loadPoints();
});
