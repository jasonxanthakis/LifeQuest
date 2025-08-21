const { PassThrough } = require('supertest/lib/test.js');
const Dungeon = require('../models/Dungeon.js');

async function loadDungeon(req, res) {
    try {
        const username = req.user;
        const hero = await Dungeon.getHeroByUsername(username);
        const dungeon = await Dungeon.loadLevel(hero);
        res.status(200).json(dungeon);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: error.message });
    }
}

async function simulateBattle(req, res) {
    try {
        console.log('pass');
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

module.exports = {
    loadDungeon,
    simulateBattle
}