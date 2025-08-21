const db = require('../database/connect');
const Enemy = require('./Enemy.js');

class Dungeon {
    constructor(level, heroname, herohp, heroatt, herodef, enemy) {
        this.level = level;
        this.hero = { 'name': heroname, 'hp': herohp, 'att': heroatt, 'def': herodef };
        this.enemy = enemy;
    }

    static async getHeroByUsername(username) {
        const response = null;
        try {
            response = await db.query("SELECT * from hero WHERE user_id = (SELECT id FROM users WHERE username = $1)", [username]);
        } catch {
            throw new Error(`User or hero ${username} doesn't exist...`);
        }
    }

    static async loadLevel(level) {
        if (level < 1) throw new Error('Invalid level. Something went wrong...');

        const response = await db.query("SELECT * FROM enemy WHERE enemy_level = $1", [level]);

        if (response.rowCount != 1) throw new Error('Database returned more than one enemy.');
        const values = response.rows[0];
        const enemy = new Enemy(values.enemy_name, 20, 10, 10);

        return new Dungeon(1, 'me', 100, 10, 10, enemy);
    }

    async simBattle() {
        
    }
}

module.exports = Dungeon;