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

        return { 'name': values.hero_name, 'hp': values.health, 'att': values.damage, 'def': values.defense, 'level': values.current_level };
    }

    static async loadLevel(hero) {
        if (hero.level < 1) throw new Error('Invalid level. Something went wrong...');

        const response = await db.query("SELECT * FROM enemy WHERE enemy_level = $1;", [hero.level % 10]);

        if (response.rowCount != 1) throw new Error('Database failed to return specified enemy...');
        const values = response.rows[0];
        const enemy = new Enemy(values.enemy_name, values.enemy_health, values.enemy_damage, values.enemy_defense);

        return new Dungeon(hero.level, hero, enemy);
    }

    static pointsWon(dungeon) {
        const unitValue = dungeon.level % 10;
        if (unitValue == 0) {
            const powersOf10 = Math.floor(Math.log10(dungeon.level)) + 1;
            console.log(`(${unitValue + 1} * 10) * ${powersOf10}`);
            const points = ((unitValue + 1) * 10 ) * powersOf10;
            return points;
        }
        const powersOf10 = Math.floor(Math.log10(dungeon.level)) + 1;
        console.log(`(${unitValue} * 10) * ${powersOf10}`);
        const points = (unitValue * 10 ) * powersOf10;
        return points;
    }

    static async recordWin(username, points) {
        const response = await db.query("SELECT * from hero WHERE user_id = (SELECT id FROM users WHERE username = $1);", [username]);
        if (response.rowCount != 1) throw new Error('Database failed to return specified hero...');
        const hero = response.rows[0];

        await db.query("UPDATE hero SET current_level = current_level + 1, total_points = total_points + $1 WHERE user_id = $2", [points, hero.id]);
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