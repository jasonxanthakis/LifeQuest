const express = require('express');
const authenticator = require('../middleware/authenticator.js');

const heroController = require('../controllers/hero.js');
const heroRouter = express.Router();

heroRouter.get('/user/inventory/:userid', heroController.getUserInventory);
heroRouter.get('/user/shop/:userid', heroController.getShopItems);
heroRouter.post('/user/shop/item', heroController.purchaseItem);
heroRouter.put('/user/inventory/equip', heroController.equipItem);

module.exports = heroRouter;
