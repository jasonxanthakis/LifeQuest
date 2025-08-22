jest.mock('../../database/connect.js', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

const { expect } = require('@jest/globals');
const {getUserInventory, getShopItems, purchaseItem, equipItem} = require('../../controllers/hero.js');
const Hero = require('../../models/Hero.js');

jest.mock('../../models/Hero.js');

const mockSend = jest.fn();
const mockJson = jest.fn();
const mockEnd = jest.fn();

const mockStatus = jest.fn(() => ({ 
    send: mockSend, 
    json: mockJson, 
    end: mockEnd 
}));

const mockRes = { status: mockStatus };

describe('Hero Controller', () => {
    beforeEach(() => jest.clearAllMocks());

    afterAll(() => jest.resetAllMocks());

    describe('getUserInventory', () => {
        let mockReq;

        beforeEach(() => {
            mockReq = {
                user: 'EvaSmith'
            };
        });

        it('should return inventory items and points with status 200', async () => {
            const mockInventory = [
                {
                    hero_items_id: 1,
                    item_name: 'Magic Sword',
                    description: 'A powerful weapon',
                    is_equipped: true
                }
            ];
            const mockPoints = 100;

            Hero.getUserIdByUsername.mockResolvedValue(1);
            Hero.getInventoryByUserId.mockResolvedValue(mockInventory);
            Hero.getPointsByUserId.mockResolvedValue(mockPoints);

            await getUserInventory(mockReq, mockRes);

            expect(Hero.getUserIdByUsername).toHaveBeenCalledWith('EvaSmith');
            expect(Hero.getInventoryByUserId).toHaveBeenCalledWith(1);
            expect(Hero.getPointsByUserId).toHaveBeenCalledWith(1);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                items: mockInventory,
                points: mockPoints
            });
        });

        it('should return 500 status on error', async () => {
            Hero.getUserIdByUsername.mockRejectedValue(new Error('Database error'));

            await getUserInventory(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Failed to get inventory'
            });
        });
    });

    describe('getShopItems', () => {
        let mockReq;

        beforeEach(() => {
            mockReq = {
                user: 'EvaSmith'
            };
        });

        it('should return shop items and points with status 200', async () => {
            const mockShopItems = [
                {
                    item_id: 1,
                    item_name: 'Health Potion',
                    description: 'Restores 50 HP',
                    item_cost: 20
                }
            ];
            const mockPoints = 100;

            Hero.getUserIdByUsername.mockResolvedValue(1);
            Hero.getShopItems.mockResolvedValue(mockShopItems);
            Hero.getPointsByUserId.mockResolvedValue(mockPoints);

            await getShopItems(mockReq, mockRes);

            expect(Hero.getUserIdByUsername).toHaveBeenCalledWith('EvaSmith');
            expect(Hero.getShopItems).toHaveBeenCalled();
            expect(Hero.getPointsByUserId).toHaveBeenCalledWith(1);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                items: mockShopItems,
                points: mockPoints
            });
        });

        it('should return 500 status on error', async () => {
            Hero.getUserIdByUsername.mockRejectedValue(new Error('Database error'));

            await getShopItems(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Failed to get shop items'
            });
        });
    });

    describe('purchaseItem', () => {
        let mockReq;

        beforeEach(() => {
            mockReq = {
                user: 'EvaSmith',
                body: {
                    itemid: '1'
                }
            };
        });

        it('should successfully purchase item and return updated data', async () => {
            const mockPurchaseResult = { newPoints: 50, heroId: 1 };
            const mockInventory = [
                {
                    hero_items_id: 1,
                    item_name: 'Magic Sword',
                    is_equipped: false
                }
            ];
            const mockShopItems = [
                {
                    item_id: 1,
                    item_name: 'Health Potion',
                    item_cost: 20
                }
            ];

            Hero.getUserIdByUsername.mockResolvedValue(1);
            Hero.purchaseItem.mockResolvedValue(mockPurchaseResult);
            Hero.getInventoryByUserId.mockResolvedValue(mockInventory);
            Hero.getShopItems.mockResolvedValue(mockShopItems);

            await purchaseItem(mockReq, mockRes);

            expect(Hero.getUserIdByUsername).toHaveBeenCalledWith('EvaSmith');
            expect(Hero.purchaseItem).toHaveBeenCalledWith(1, '1');
            expect(Hero.getInventoryByUserId).toHaveBeenCalledWith(1);
            expect(Hero.getShopItems).toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                points: 50,
                items: mockInventory,
                shop_items: mockShopItems
            });
        });

        it('should return 404 if hero not found', async () => {
            Hero.getUserIdByUsername.mockResolvedValue(1);
            Hero.purchaseItem.mockRejectedValue(new Error('Hero not found'));

            await purchaseItem(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Hero not found'
            });
        });

        it('should return 404 if item not found', async () => {
            Hero.getUserIdByUsername.mockResolvedValue(1);
            Hero.purchaseItem.mockRejectedValue(new Error('Item not found'));

            await purchaseItem(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Item not found'
            });
        });

        it('should return 400 if insufficient points', async () => {
            Hero.getUserIdByUsername.mockResolvedValue(1);
            Hero.purchaseItem.mockRejectedValue(new Error('Insufficient points'));

            await purchaseItem(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Insufficient points'
            });
        });

        it('should return 500 for other errors', async () => {
            Hero.getUserIdByUsername.mockRejectedValue(new Error('Database connection failed'));

            await purchaseItem(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Failed to purchase item'
            });
        });
    });

    describe('equipItem', () => {
        let mockReq;

        beforeEach(() => {
            mockReq = {
                user: 'EvaSmith',
                body: {
                    hero_items_id: '1',
                    is_equipped: true
                }
            };
        });

        it('should successfully equip item', async () => {
            Hero.getUserIdByUsername.mockResolvedValue(1);
            Hero.equipItem.mockResolvedValue({ success: true });

            await equipItem(mockReq, mockRes);

            expect(Hero.getUserIdByUsername).toHaveBeenCalledWith('EvaSmith');
            expect(Hero.equipItem).toHaveBeenCalledWith(1, '1', true);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Item equipped successfully'
            });
        });

        it('should successfully unequip item', async () => {
            mockReq.body.is_equipped = false;
            Hero.getUserIdByUsername.mockResolvedValue(1);
            Hero.equipItem.mockResolvedValue({ success: true });

            await equipItem(mockReq, mockRes);

            expect(Hero.getUserIdByUsername).toHaveBeenCalledWith('EvaSmith');
            expect(Hero.equipItem).toHaveBeenCalledWith(1, '1', false);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Item unequipped successfully'
            });
        });

        it('should return 404 if item not found or does not belong to user', async () => {
            Hero.getUserIdByUsername.mockResolvedValue(1);
            Hero.equipItem.mockRejectedValue(new Error('Item not found or does not belong to user'));

            await equipItem(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Item not found or does not belong to user'
            });
        });

        it('should return 500 for other errors', async () => {
            Hero.getUserIdByUsername.mockRejectedValue(new Error('Database error'));

            await equipItem(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Failed to equip item'
            });
        });
    });
});
