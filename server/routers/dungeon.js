const express = require('express');
const authenticator = require('../middleware/authenticator.js');

const dungeonController = require('../controllers/dungeon.js');
const dungeonRouter = express.Router();

dungeonRouter.get('/:user', authenticator, dungeonController.loadDungeon);
dungeonRouter.patch('/:user/battle', dungeonController.simulateBattle);

module.exports = dungeonRouter;