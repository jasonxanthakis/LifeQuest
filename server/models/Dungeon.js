const db = require('../database/connect');
const Enemy = require('./Enemy.js');

class Dungeon {
    constructor(level, hero, enemy) {
        this.level = level;
        this.hero = hero;
        this.enemy = enemy;
    }

    static async getHeroByUsername(username) {
        const response = await db.query("SELECT * from hero WHERE user_id = (SELECT id FROM users WHERE username = $1);", [username]);
        
        if (response.rowCount != 1) throw new Error('Database failed to return specified hero...');
        const values = response.rows[0];

        return { 'name': values.hero_name, 'hp': 100, 'att': 10, 'def': 10, 'level': values.current_level };
    }

    static async loadLevel(hero) {
        if (hero.level < 1) throw new Error('Invalid level. Something went wrong...');

        const response = await db.query("SELECT * FROM enemy WHERE enemy_level = $1;", [hero.level]);

        if (response.rowCount != 1) throw new Error('Database returned more than one enemy.');
        const values = response.rows[0];
        const enemy = new Enemy(values.enemy_name, 20, 10, 10);
        // const enemy = new Enemy(values.enemy_name, 2000, 10, 10);

        return new Dungeon(hero.level, hero, enemy);
    }

    async simBattle() {
        while (this.hero.hp > 0 && this.enemy.hp > 0) {
            let dmg = this.hero.att - this.enemy.def;
            if (dmg <= 0) dmg = 1;
            this.enemy.hp -= dmg;

            if (this.enemy.hp <= 0) {
                return true;
            }

            dmg = this.enemy.att - this.hero.def;
            if (dmg <= 0) dmg = 1;
            this.hero.hp -= dmg;

            if (this.hero.hp <= 0) {
                return false;
            }
        }
    }
}

module.exports = Dungeon;