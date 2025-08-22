const db = require('../database/connect');

class Enemy {
    constructor(enemyname, enemyhp, enemyatt, enemydef) {
        this.name = enemyname;
        this.hp = enemyhp;
        this.att = enemyatt;
        this.def = enemydef;
    }
}

module.exports = Enemy;