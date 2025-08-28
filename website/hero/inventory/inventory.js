const API_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async function() {
    await loadInventoryData();
});

// Load inventory from backend instead of localStorage
export async function loadInventoryData() {
    try {
        const url = API_URL + `/hero/user/inventory`;
        
        const response = await getRequest(url);
        const data = await response.json();
        
        if (response.ok) {
            loadPoints(data.points);
            loadInventory(data.items);
        } else {
            console.error('Failed to load inventory:', data.error);
            // Show empty message if API fails
            loadInventory([]);
            loadPoints(0);
        }
    } catch (error) {
        console.error('Failed to load inventory:', error);
        // Show empty message if request fails
        loadInventory([]);
        loadPoints(0);
    }
}

export function loadPoints(points) {
    document.getElementById('pointsValue').textContent = points;
}

export function loadInventory(items) {
    const inventoryList = document.getElementById('inventoryList');
    const emptyMessage = document.getElementById('emptyInventory');
    
    if (items.length === 0) {
        inventoryList.style.display = 'none';
        emptyMessage.style.display = 'block';
        return;
    }
    
    inventoryList.style.display = 'flex';
    emptyMessage.style.display = 'none';
    
    // Clear existing content
    inventoryList.innerHTML = '';
    
    // Create cards for each item (don't group since each has individual equip state)
    items.forEach(item => {
        const itemCard = createInventoryCard(item);
        inventoryList.appendChild(itemCard);
    });
    
    // Add event listeners to equip buttons
    const equipButtons = document.querySelectorAll('.btn-equip');
    equipButtons.forEach(button => {
        button.addEventListener('click', handleEquip);
    });
    
    // Update button states based on equipped items
    updateEquipButtons(items);
}

export function createInventoryCard(item) {
    const col = document.createElement('div');
    col.className = 'col-md-4 col-lg-3 mb-4';
    
    const isEquipped = item.is_equipped;
    const equipButtonClass = isEquipped ? 'btn-warning' : 'btn-success';
    const equipButtonText = isEquipped ? 'Unequip' : 'Equip';
    
    col.innerHTML = `
        <div class="card h-100">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${item.item_name}</h5>
                <p class="card-text">${item.description || 'Item from your collection'}</p>
                <div class="mt-auto">
                    <div class="d-flex justify-content-end align-items-center">
                        <button class="btn ${equipButtonClass} btn-sm btn-equip" data-item-id="${item.hero_items_id}" data-item-name="${item.item_name}">${equipButtonText}</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

export async function handleEquip(event) {
    const button = event.target;
    const itemId = button.getAttribute('data-item-id');
    const itemName = button.getAttribute('data-item-name');
    
    // Determine current state and toggle
    const isCurrentlyEquipped = button.textContent === 'Unequip';
    const newEquippedState = !isCurrentlyEquipped;

    const url = API_URL + '/hero/user/inventory/equip';
    const dat = {
        hero_items_id: itemId, 
        is_equipped: newEquippedState
    }
    
    try {
        const response = await sendPatchRequest(url, dat);
        const data = await response.json();
        
        if (response.ok) {
            // Update button state
            if (newEquippedState) {
                button.textContent = 'Unequip';
                button.classList.remove('btn-success');
                button.classList.add('btn-warning');
            } else {
                button.textContent = 'Equip';
                button.classList.remove('btn-warning');
                button.classList.add('btn-success');
            }
            
            // Show success message
            showEquipMessage(itemName, newEquippedState);
            
        } else {
            console.error('Failed to equip item:', data.error);
            alert(data.error || 'Failed to equip item');
        }
    } catch (error) {
        console.error('Error equipping item:', error);
        alert('Failed to equip item');
    }
}

export function updateEquipButtons(items) {
    const equipButtons = document.querySelectorAll('.btn-equip');
    
    for (let button of equipButtons) {
        const itemId = button.getAttribute('data-item-id');
        
        if (button.textContent == 'Unequip') {
            button.classList.remove('btn-success');
            button.classList.add('btn-warning');
        } else if (button.textContent == 'Equip') {
            button.classList.remove('btn-warning');
            button.classList.add('btn-success');
        }
    };
}

export function showEquipMessage(itemName, isEquipped) {
    const action = isEquipped ? 'equipped' : 'unequipped';
    const message = document.createElement('div');
    message.className = 'alert alert-info alert-dismissible fade show position-fixed';
    message.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    message.innerHTML = `
        <strong>Success!</strong><br>
        ${itemName} ${action} successfully.
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(message);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 3000);
}

// Listen for custom events (for same-tab updates)
window.addEventListener('inventoryUpdated', function() {
    loadInventoryData();
});

const logout = document.getElementsByClassName('logout');
for (let btn of logout) {
    btn.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.assign('../../login/login.html');
    });
}

export async function getRequest(url) {
  const options = {
    method: "GET",
    headers: {
      "Authorization": localStorage.getItem("token"),
      "Content-Type": "application/json"
    }
  }

  const resp = await fetch(url, options);

  return resp;
};

export async function sendPatchRequest(url, data) {
    const options = {
        method: "PATCH",
        headers: {
          "Authorization": localStorage.getItem("token"),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }

    const resp = await fetch(url, options);

    return resp;
};