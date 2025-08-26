const db = require('../database/connect');

class Hero {
    constructor({ id, user_id, current_level, hero_name, total_points, health, damage, defense, next_enemy }) {
        this.id = id;
        this.user_id = user_id;
        this.current_level = current_level;
        this.hero_name = hero_name;
        this.total_points = total_points;
        this.hp = health;
        this.att = damage;
        this.def = defense;
        this.next_enemy = next_enemy;
    }


    // Get all by user_id

    static async getByUserId(userId) {
        const res = await db.query("SELECT * FROM hero WHERE user_id = $1;", [userId]);
        if (res.rows.length === 0) throw new Error("Hero not found");
        return res.rows[0];
    }

    // Get hero by username
    static async getUserIdByUsername(username) {
        const response = await db.query("SELECT id FROM users WHERE username = $1;", [username]);
        
        if (response.rowCount != 1) throw new Error('Database failed to find specified user...');

        return response.rows[0].id;
    }

    // Get hero's points
    static async getPointsByUserId(userId) {
        const response = await db.query('SELECT total_points FROM hero WHERE user_id = $1', [userId]);
        if (response.rows.length === 0) {
            return 0;
        }
        return response.rows[0].total_points || 0;
    }

    // Get hero's inventory items
    static async getInventoryByUserId(userId) {
        const query = `
            SELECT hi.id as hero_items_id, hi.hero_id, hi.item_id, hi.is_equipped, 
                   i.item_name, i.description, i.item_cost 
            FROM hero_items hi 
            JOIN items i ON hi.item_id = i.item_id 
            JOIN hero h ON hi.hero_id = h.id
            WHERE h.user_id = $1
        `;
        const response = await db.query(query, [userId]);
        return response.rows;
    }

    // Get all shop items
    static async getShopItems() {
        const query = 'SELECT item_id, item_name, description, item_cost FROM items ORDER BY item_cost ASC';
        const response = await db.query(query);
        return response.rows;
    }

    // Purchase an item (transaction-based)
    static async purchaseItem(userId, itemId) {
        try {
            await db.query('BEGIN');

            // Get hero_id and current points
            const heroQuery = 'SELECT id as hero_id, total_points FROM hero WHERE user_id = $1';
            const heroResult = await db.query(heroQuery, [userId]);

            if (heroResult.rows.length === 0) {
                await db.query('ROLLBACK');
                throw new Error('Hero not found');
            }

            const heroId = heroResult.rows[0].hero_id;
            const currentPoints = heroResult.rows[0].total_points || 0;

            // Get item cost
            const itemQuery = 'SELECT item_cost FROM items WHERE item_id = $1';
            const itemResult = await db.query(itemQuery, [itemId]);

            if (itemResult.rows.length === 0) {
                await db.query('ROLLBACK');
                throw new Error('Item not found');
            }

            const itemCost = itemResult.rows[0].item_cost;

            if (currentPoints < itemCost) {
                await db.query('ROLLBACK');
                throw new Error('Insufficient points');
            }

            // Deduct points from hero
            const newPoints = currentPoints - itemCost;
            await db.query('UPDATE hero SET total_points = $1 WHERE id = $2', [newPoints, heroId]);

            // Add item to hero_items (is_equipped defaults to false)
            await db.query(
                'INSERT INTO hero_items (hero_id, item_id, is_equipped) VALUES ($1, $2, false)',
                [heroId, itemId]
            );

            await db.query('COMMIT');
            return { newPoints, heroId };

        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    }

    // Equip/unequip an item
    static async equipItem(userId, heroItemsId, isEquipped) {
        // Verify the item belongs to this user
        const verifyQuery = `
            SELECT hi.id 
            FROM hero_items hi 
            JOIN hero h ON hi.hero_id = h.id 
            WHERE hi.id = $1 AND h.user_id = $2
        `;
        const verifyResult = await db.query(verifyQuery, [heroItemsId, userId]);

        if (verifyResult.rows.length === 0) {
            throw new Error('Item not found or does not belong to user');
        }

        // Update the is_equipped status
        let updateQuery = 'UPDATE hero_items SET is_equipped = $1 WHERE id = $2';
        await db.query(updateQuery, [isEquipped, heroItemsId]);

        // Get the item stats
        const itemQuery = 'SELECT * FROM items JOIN hero_items ON hero_items.item_id = items.item_id WHERE hero_items.id = $1;';
        const item = (await db.query(itemQuery, [heroItemsId])).rows[0];
        
        // Update the hero stats based on the equipment
        if (isEquipped) {
            updateQuery = 'UPDATE hero SET health = health + $1, damage = damage + $2, defense = defense + $3 WHERE user_id = $4';
        } else {
            updateQuery = 'UPDATE hero SET health = health - $1, damage = damage - $2, defense = defense - $3 WHERE user_id = $4';
        }
        await db.query(updateQuery, [item.item_health, item.item_damage, item.item_defense, userId]);

        return { success: true };
    }

    // Get hero's equipped items
    static async getEquippedItemsByUserId(userId) {
        const query = `
            SELECT hi.id as hero_items_id, hi.hero_id, hi.item_id, hi.is_equipped, 
                   i.item_name, i.description, i.item_cost 
            FROM hero_items hi 
            JOIN items i ON hi.item_id = i.item_id 
            JOIN hero h ON hi.hero_id = h.id
            WHERE h.user_id = $1 AND hi.is_equipped = true
        `;
        const response = await db.query(query, [userId]);
        return response.rows;
    }

    // // Create a new hero for a user
    // static async create(userId, heroName) {
    //     const query = `
    //         INSERT INTO hero (user_id, current_level, hero_name, total_points, health, damage, defense, next_enemy) 
    //         VALUES ($1, 1, $2, 0, 0, 0, 0, 'Goblin') 
    //         RETURNING *
    //     `;
    //     const response = await db.query(query, [userId, heroName]);
    //     return new Hero(response.rows[0]);
    // }

    // Update hero points when a quest is completed
    static async updateTotalPoints(userId, newTotal) {
        const res = db.query('UPDATE hero SET total_points = $1 WHERE user_id = $2 RETURNING *;',
            [newTotal, userId]
        );

        if (res.rows.length === 0) throw new Error("Points not be updated or Hero not found");
        return res.rows[0];
    }
}

module.exports = Hero;
