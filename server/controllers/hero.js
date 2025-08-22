const Hero = require('../models/Hero.js');

// GET /hero/user/inventory/:userid
// Returns: { items: [all items for userid], points: number }
const getUserInventory = async (req, res) => {
  try {
    const username = req.user;
    
    // Use Hero model methods
    const userid = await Hero.getUserIdByUsername(username);
    const items = await Hero.getInventoryByUserId(userid);
    const points = await Hero.getPointsByUserId(userid);
    
    res.status(200).json({
      items: items,
      points: points
    });
  } catch (error) {
    // console.error('Error getting user inventory:', error);
    res.status(500).json({ error: 'Failed to get inventory' });
  }
};

// GET /hero/user/shop/:userid
// Returns: { items: [all items in shop], points: number }
const getShopItems = async (req, res) => {
  try {
    const username = req.user;
    
    // Use Hero model methods
    const userid = await Hero.getUserIdByUsername(username);
    const items = await Hero.getShopItems();
    const points = await Hero.getPointsByUserId(userid);
    
    res.status(200).json({
      items: items,
      points: points
    });
  } catch (error) {
    // console.error('Error getting shop items:', error);
    res.status(500).json({ error: 'Failed to get shop items' });
  }
};

// POST /hero/user/shop/item
// Body: { userid, itemid }
// Returns: { points: new_points, items: [all items for userid], shop_items: [all items in shop] }
const purchaseItem = async (req, res) => {
  try {
    const { itemid } = req.body;
    const username = req.user;

    const userid = await Hero.getUserIdByUsername(username);
    
    // Use Hero model to handle the purchase
    const result = await Hero.purchaseItem(userid, itemid);
    
    // Get updated data
    const items = await Hero.getInventoryByUserId(userid);
    const shop_items = await Hero.getShopItems();
    
    res.status(200).json({
      points: result.newPoints,
      items: items,
      shop_items: shop_items
    });
    
  } catch (error) {
    // console.error('Error purchasing item:', error);
    
    // Handle specific error types
    if (error.message === 'Hero not found') {
      return res.status(404).json({ error: error.message });
    } else if (error.message === 'Item not found') {
      return res.status(404).json({ error: error.message });
    } else if (error.message === 'Insufficient points') {
      return res.status(400).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'Failed to purchase item' });
    }
  }
};

// PUT /hero/user/inventory/equip
// Body: { userid, hero_items_id, is_equipped }
// Returns: { message: "Item equipped/unequipped successfully" }
const equipItem = async (req, res) => {
  try {
    const { hero_items_id, is_equipped } = req.body;
    const username = req.user;
    
    const userid = await Hero.getUserIdByUsername(username);

    // Use Hero model to equip/unequip the item
    await Hero.equipItem(userid, hero_items_id, is_equipped);
    
    const action = is_equipped ? 'equipped' : 'unequipped';
    res.status(200).json({ message: `Item ${action} successfully` });
    
  } catch (error) {
    // console.error('Error equipping item:', error);
    if (error.message.includes('not found') || error.message.includes('does not belong')) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to equip item' });
    }
  }
};

module.exports = {
  getUserInventory,
  getShopItems,
  purchaseItem,
  equipItem
};