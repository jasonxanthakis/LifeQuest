// Helper function to get user ID from JWT token
function getUserId() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        // Decode JWT token to get username
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload); // Debug what's actually in the token
        
        // Your JWT only has username, not user_id
        // For now, return a test user ID
        return '1'; // TODO: Update backend to include user_id in JWT
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadShopData();
});

let currentPoints = 0;

// Load shop items and user points from backend
async function loadShopData() {
  try {
    const url = `http://localhost:3000/hero/user/shop/${1}`;
    
    const response = await getRequest(url);
    
    const data = await response.json();
    
    if (response.ok) {
      currentPoints = data.points;
      updatePointsDisplay();
      renderShopItems(data.items);
    } else {
      console.error('Failed to load shop data:', data.error);
    }
  } catch (error) {
    console.error('Failed to load shop data:', error);
  }
}

// Render shop items in the UI
function renderShopItems(items) {
  // Target the specific row container that holds shop items (not the navbar row)
  const shopContainer = document.querySelector('main .row'); // More specific selector
  
  // Clear existing items (remove hardcoded items)
  if (shopContainer) {
    shopContainer.innerHTML = '';
    
    // Create dynamic shop items from database
    items.forEach(item => {
      const itemCard = createShopItemCard(item);
      shopContainer.appendChild(itemCard);
    });
  }
  
  // Add event listeners to all buy buttons after items are rendered
  setTimeout(() => {
    const buyButtons = document.querySelectorAll('.btn-buy');
    buyButtons.forEach(button => {
      button.addEventListener('click', handlePurchase);
    });
  }, 100);
}

// Create a shop item card
function createShopItemCard(item) {
  const col = document.createElement('div');
  col.className = 'col-md-4 mb-4';
  
  // Map item names to image files
  const imageMap = {
    'Health Potion': '../assets/health-potion.jpg',
    'Magic Sword': '../assets/magic-sword.jpeg',
    'Shield': '../assets/shield-of-protection.jpg',
    'Shield of Protection': '../assets/shield-of-protection.jpg',
    'Mana Crystal': '../assets/mana-crystal.jpg',
    'Lucky Charm': '../assets/lucky-charm.jpg',
    'Premium Quest Scroll': '../assets/premium-quest-scroll.jpg'
  };
  
  const imageSrc = imageMap[item.item_name] || '../assets/placeholder-item.png';
  
  col.innerHTML = `
    <div class="card h-100">
      <img src="${imageSrc}" class="card-img-top" alt="${item.item_name}" style="height: 200px; object-fit: cover;">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${item.item_name}</h5>
        <p class="card-text">${item.description || 'A valuable item for your adventure!'}</p>
        <div class="mt-auto">
          <div class="d-flex justify-content-between align-items-center">
            <span class="h5 text-success mb-0">💰 ${item.item_cost} points</span>
            <button class="btn btn-purple btn-buy" 
                    data-item-id="${item.item_id}" 
                    data-item-name="${item.item_name}" 
                    data-item-cost="${item.item_cost}">
              Buy
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  return col;
}

// Handle purchase with backend API
async function handlePurchase(event) {
  const button = event.target;
  const itemId = button.getAttribute('data-item-id');
  const itemName = button.getAttribute('data-item-name');
  const itemCost = parseInt(button.getAttribute('data-item-cost'));
  const card = button.closest('.card');
  const itemTitle = card.querySelector('.card-title').textContent;

  const url = 'http://localhost:3000/hero/user/shop/item';
  
  // Check if hero has enough points
  if (currentPoints < itemCost) {
    showInsufficientPoints(itemCost);
    return;
  }
  
  try {
    const dat = { itemid: itemId };

    const response = await sendPostRequest(url, dat);
    const data = await response.json();
    
    if (response.ok) {
      currentPoints = data.points;
      updatePointsDisplay();
      
      // Show success message
      showPurchaseSuccess(itemTitle, itemCost);
      
      // Disable button temporarily
      button.disabled = true;
      button.textContent = 'Purchased!';
      button.classList.remove('btn-purple');
      button.classList.add('btn-success');
      
      // Re-enable button after 2 seconds
      setTimeout(() => {
        button.disabled = false;
        button.textContent = 'Buy';
        button.classList.remove('btn-success');
        button.classList.add('btn-purple');
      }, 2000);
      
      // Trigger custom event for inventory update
      window.dispatchEvent(new CustomEvent('inventoryUpdated'));
      
    } else {
      alert(data.error || 'Purchase failed');
    }
  } catch (error) {
    console.error('Purchase failed:', error);
    alert('Purchase failed');
  }
}

function updatePointsDisplay() {
  const pointsElement = document.getElementById('pointsValue');
  if (pointsElement) {
    pointsElement.textContent = currentPoints;
  }
}

function showPurchaseSuccess(itemName, cost) {
  // Create and show a temporary success message
  const message = document.createElement('div');
  message.className = 'alert alert-success alert-dismissible fade show position-fixed';
  message.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
  message.innerHTML = `
    <strong>Purchase Successful!</strong><br>
    ${itemName} added to inventory.<br>
    -${cost} points
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

function showInsufficientPoints(requiredPoints) {
  // Create and show error message
  const message = document.createElement('div');
  message.className = 'alert alert-danger alert-dismissible fade show position-fixed';
  message.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
  message.innerHTML = `
    <strong>Insufficient Points!</strong><br>
    You need ${requiredPoints} points but only have ${currentPoints}.
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

const logout = document.getElementsByClassName('logout');
for (let btn of logout) {
  btn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.assign('../login/login.html');
  });
}

async function getRequest(url) {
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

async function sendPostRequest(url, data) {
    const options = {
        method: "POST",
        headers: {
          "Authorization": localStorage.getItem("token"),
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    }

    const resp = await fetch(url, options);

    return resp;
};