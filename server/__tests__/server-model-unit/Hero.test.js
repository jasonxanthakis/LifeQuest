require("dotenv").config();
const {expect, it, describe, beforeAll, afterAll} = require("@jest/globals");
const Hero = require('../../models/Hero.js');

jest.mock('../../database/connect.js', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

const db = require("../../database/connect.js");

describe('Hero model functions', () => {
    beforeEach(() => jest.clearAllMocks());

    afterAll(() => jest.resetAllMocks());

    describe('getUserIdByUsername', () => {
        it('retrieves a user_id by username', async () => {
            db.query.mockResolvedValueOnce({
                rows: [
                    {
                        id: 1
                    }
                ],
                rowCount: 1
            });

            const userId = await Hero.getUserIdByUsername(1);

            expect(userId).toBe(1);
        });

        it('throws an error if user not found', async () => {
            db.query.mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            });

            await expect(Hero.getUserIdByUsername(999))
                .rejects
                .toThrow('Database failed to find specified user...');
        });
    });

    describe('getPointsByUserId', () => {
        it('returns hero points for valid user', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ total_points: 150 }],
                rowCount: 1
            });

            const points = await Hero.getPointsByUserId(1);

            expect(points).toBe(150);
        });

        it('returns 0 if hero not found', async () => {
            db.query.mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            });

            const points = await Hero.getPointsByUserId(999);

            expect(points).toBe(0);
        });

        it('returns 0 if total_points is null', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ total_points: null }],
                rowCount: 1
            });

            const points = await Hero.getPointsByUserId(1);

            expect(points).toBe(0);
        });
    });

    describe('getInventoryByUserId', () => {
        it('returns inventory items for user', async () => {
            const mockInventory = [
                {
                    hero_items_id: 1,
                    hero_id: 1,
                    item_id: 1,
                    is_equipped: true,
                    item_name: 'Magic Sword',
                    description: 'A powerful weapon',
                    item_cost: 50
                },
                {
                    hero_items_id: 2,
                    hero_id: 1,
                    item_id: 2,
                    is_equipped: false,
                    item_name: 'Health Potion',
                    description: 'Restores 50 HP',
                    item_cost: 20
                }
            ];

            db.query.mockResolvedValueOnce({
                rows: mockInventory,
                rowCount: 2
            });

            const inventory = await Hero.getInventoryByUserId(1);

            expect(inventory).toHaveLength(2);
            expect(inventory[0].item_name).toBe('Magic Sword');
            expect(inventory[0].is_equipped).toBe(true);
            expect(inventory[1].item_name).toBe('Health Potion');
            expect(inventory[1].is_equipped).toBe(false);
        });

        it('returns empty array if no items', async () => {
            db.query.mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            });

            const inventory = await Hero.getInventoryByUserId(1);

            expect(inventory).toHaveLength(0);
        });
    });

    describe('getShopItems', () => {
        it('returns all shop items', async () => {
            const mockShopItems = [
                {
                    item_id: 1,
                    item_name: 'Magic Sword',
                    description: 'A powerful weapon',
                    item_cost: 50
                },
                {
                    item_id: 2,
                    item_name: 'Health Potion',
                    description: 'Restores 50 HP',
                    item_cost: 20
                }
            ];

            db.query.mockResolvedValueOnce({
                rows: mockShopItems,
                rowCount: 2
            });

            const shopItems = await Hero.getShopItems();

            expect(shopItems).toHaveLength(2);
            expect(shopItems[0].item_name).toBe('Magic Sword');
            expect(shopItems[1].item_cost).toBe(20);
        });
    });

    describe('purchaseItem', () => {
        beforeEach(() => {
            // Mock transaction queries
            db.query.mockImplementation((query) => {
                if (query === 'BEGIN' || query === 'COMMIT' || query === 'ROLLBACK') {
                    return Promise.resolve();
                }
                return Promise.resolve({ rows: [] });
            });
        });

        it('successfully purchases an item', async () => {
            // Mock hero lookup
            db.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
            db.query.mockResolvedValueOnce({
                rows: [{ hero_id: 1, total_points: 100 }]
            }); // Hero query
            db.query.mockResolvedValueOnce({
                rows: [{ item_cost: 50 }]
            }); // Item query
            db.query.mockResolvedValueOnce({ rows: [] }); // Update points
            db.query.mockResolvedValueOnce({ rows: [] }); // Insert hero_items
            db.query.mockResolvedValueOnce({ rows: [] }); // COMMIT

            const result = await Hero.purchaseItem(1, 1);

            expect(result.newPoints).toBe(50);
            expect(result.heroId).toBe(1);
        });

        it('throws error if hero not found', async () => {
            db.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
            db.query.mockResolvedValueOnce({ rows: [] }); // Hero query - empty

            await expect(Hero.purchaseItem(999, 1))
                .rejects
                .toThrow("Hero not found");
        });

        it('throws error if item not found', async () => {
            db.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
            db.query.mockResolvedValueOnce({
                rows: [{ hero_id: 1, total_points: 100 }]
            }); // Hero query
            db.query.mockResolvedValueOnce({ rows: [] }); // Item query - empty

            await expect(Hero.purchaseItem(1, 999))
                .rejects
                .toThrow("Item not found");
        });

        it('throws error if insufficient points', async () => {
            db.query.mockResolvedValueOnce({ rows: [] }); // BEGIN
            db.query.mockResolvedValueOnce({
                rows: [{ hero_id: 1, total_points: 30 }]
            }); // Hero query
            db.query.mockResolvedValueOnce({
                rows: [{ item_cost: 50 }]
            }); // Item query

            await expect(Hero.purchaseItem(1, 1))
                .rejects
                .toThrow("Insufficient points");
        });
    });

    describe('equipItem', () => {
        it('successfully equips an item', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ id: 1 }]
            }); // Verify query
            db.query.mockResolvedValueOnce({ rows: [] }); // Update query

            const result = await Hero.equipItem(1, 1, true);

            expect(result.success).toBe(true);
        });

        it('throws error if item not found or does not belong to user', async () => {
            db.query.mockResolvedValueOnce({
                rows: []
            }); // Verify query - empty

            await expect(Hero.equipItem(1, 999, true))
                .rejects
                .toThrow("Item not found or does not belong to user");
        });
    });

    describe('create', () => {
        it('creates a new hero', async () => {
            const mockHero = {
                id: 1,
                user_id: 1,
                current_level: 1,
                hero_name: 'New Hero',
                total_points: 0,
                health: 50,
                damage: 10,
                defense: 10,
                next_enemy: 'Goblin'
            };

            db.query.mockResolvedValueOnce({
                rows: [mockHero],
                rowCount: 1
            });

            const newHero = await Hero.create(1, 'New Hero');

            expect(newHero).toBeInstanceOf(Hero);
            expect(newHero.hero_name).toBe('New Hero');
            expect(newHero.current_level).toBe(1);
            expect(newHero.total_points).toBe(0);
        });
    });
});
