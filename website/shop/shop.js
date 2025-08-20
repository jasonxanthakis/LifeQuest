document.addEventListener('DOMContentLoaded', () => {
  // Get hero total_points from localStorage or set default
  let currentPoints = parseInt(localStorage.getItem('heroTotalPoints')) || 100;
  updatePointsDisplay();

  // Add event listeners to all buy buttons
  const buyButtons = document.querySelectorAll('.btn-buy');
  buyButtons.forEach(button => {
    button.addEventListener('click', handlePurchase);
  });

  function handlePurchase(event) {
    const button = event.target;
    const itemId = button.getAttribute('data-item-id');
    const itemName = button.getAttribute('data-item-name');
    const itemCost = parseInt(button.getAttribute('data-item-cost'));
    const card = button.closest('.card');
    const itemTitle = card.querySelector('.card-title').textContent;

    // Check if hero has enough total_points
    if (currentPoints >= itemCost) {
      // Deduct points
      currentPoints -= itemCost;
      updatePointsDisplay();
      
      // Save updated points to localStorage
      localStorage.setItem('heroTotalPoints', currentPoints);
      
      // Add item to hero_items
      addToHeroItems(itemId, itemName);
      
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
      
    } else {
      // Not enough points
      showInsufficientPoints(itemCost);
    }
  }

  function updatePointsDisplay() {
    const pointsElement = document.getElementById('pointsValue');
    if (pointsElement) {
      pointsElement.textContent = currentPoints;
    }
  }

  function addToHeroItems(itemId, itemName) {
    // Get current hero_items from localStorage
    let heroItems = JSON.parse(localStorage.getItem('heroItems')) || [];
    
    // Add new item (matches hero_items table structure)
    const newItem = {
      item_id: itemId,
      item_name: itemName,
      quantity: 1,
      is_equipped: false
    };
    
    // Check if item already exists in hero_items
    const existingItemIndex = heroItems.findIndex(item => item.item_id === itemId);
    if (existingItemIndex > -1) {
      // Increase quantity if item exists
      heroItems[existingItemIndex].quantity += 1;
    } else {
      // Add new item if it doesn't exist
      heroItems.push(newItem);
    }
    
    // Save updated hero_items to localStorage
    localStorage.setItem('heroItems', JSON.stringify(heroItems));
    
    // Trigger custom event for inventory update
    window.dispatchEvent(new CustomEvent('inventoryUpdated'));
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
});
