const db = require('../database/connect');

class Hero {
    constructor({ id, user_id, current_level, hero_name, total_points, total_XP, next_enemy }) {
        this.id = id;
        this.user_id = user_id;
        this.current_level = current_level;
        this.hero_name = hero_name;
        this.total_points = total_points;
        this.total_XP = total_XP;
        this.next_enemy = next_enemy;
    }

    // Get hero by user_id
    static async getByUserId(userId) {
        const response = await db.query('SELECT * FROM hero WHERE user_id = $1', [userId]);
        if (response.rows.length === 0) {
            throw new Error('Hero not found');
        }
        return new Hero(response.rows[0]);
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
            JOIN items i ON hi.item_id = i.id 
            JOIN hero h ON hi.hero_id = h.id
            WHERE h.user_id = $1
        `;
        const response = await db.query(query, [userId]);
        return response.rows;
    }

    // Get all shop items
    static async getShopItems() {
        const query = 'SELECT id as item_id, item_name, description, item_cost FROM items ORDER BY item_cost ASC';
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
            const itemQuery = 'SELECT item_cost FROM items WHERE id = $1';
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
        const updateQuery = 'UPDATE hero_items SET is_equipped = $1 WHERE id = $2';
        await db.query(updateQuery, [isEquipped, heroItemsId]);

        return { success: true };
    }

    // Get hero's equipped items
    static async getEquippedItemsByUserId(userId) {
        const query = `
            SELECT hi.id as hero_items_id, hi.hero_id, hi.item_id, hi.is_equipped, 
                   i.item_name, i.description, i.item_cost 
            FROM hero_items hi 
            JOIN items i ON hi.item_id = i.id 
            JOIN hero h ON hi.hero_id = h.id
            WHERE h.user_id = $1 AND hi.is_equipped = true
        `;
        const response = await db.query(query, [userId]);
        return response.rows;
    }

    // Create a new hero for a user
    static async create(userId, heroName) {
        const query = `
            INSERT INTO hero (user_id, current_level, hero_name, total_points, total_XP, next_enemy) 
            VALUES ($1, 1, $2, 0, 0, 'Goblin') 
            RETURNING *
        `;
        const response = await db.query(query, [userId, heroName]);
        return new Hero(response.rows[0]);
    }

    // Instance methods for updating hero properties
    async updatePoints(newPoints) {
        await db.query('UPDATE hero SET total_points = $1 WHERE id = $2', [newPoints, this.id]);
        this.total_points = newPoints;
    }

    async updateLevel(newLevel) {
        await db.query('UPDATE hero SET current_level = $1 WHERE id = $2', [newLevel, this.id]);
        this.current_level = newLevel;
    }

    async updateXP(newXP) {
        await db.query('UPDATE hero SET total_XP = $1 WHERE id = $2', [newXP, this.id]);
        this.total_XP = newXP;
    }
}

module.exports = Hero;
