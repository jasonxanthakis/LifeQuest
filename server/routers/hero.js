const express = require('express');
const authenticator = require('../middleware/authenticator.js');

const heroController = require('../controllers/hero.js');
const heroRouter = express.Router();

heroRouter.get('/user/inventory/:userid', authenticator, heroController.getUserInventory);
heroRouter.get('/user/shop/:userid', authenticator, heroController.getShopItems);
heroRouter.post('/user/shop/item', authenticator, heroController.purchaseItem);
heroRouter.patch('/user/inventory/equip', authenticator, heroController.equipItem);

module.exports = heroRouter;
