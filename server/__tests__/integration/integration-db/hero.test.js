const bcrypt = require("bcrypt");

const { expect, beforeAll } = require("@jest/globals");

let User;
let Hero;

describe("Hero model integration", () => {
    let mockUser;

    beforeAll(async () => {
        jest.isolateModules(() => {
            jest.doMock("../../../database/connect.js", () => global.db);

            User = require("../../../models/User.js");
            Hero = require("../../../models/Hero.js");
        });
    });

    it("should create a hero during account creation using User Model and verify associated hero exists", async () => {
        const data = {
            fullname: "Eva Smith",
            username: "user",
            hashedPassword: await bcrypt.hash("password", 12),
            email: "test@example.org",
            date_of_birth: "2000-01-01",
        };

        mockUser = await User.create(data);

        const heroes = await global.db.query(
            "SELECT * FROM hero WHERE user_id = $1",
            [mockUser.id]
        );

        expect(heroes.rowCount).toBe(1);
        expect(heroes.rows[0].hero_name).toBe("user");
        expect(heroes.rows[0].total_points).toBe(0);
    });

    it("should get user ID by username", async () => {
        const data = {
            fullname: "Eva Smith",
            username: "user",
            hashedPassword: await bcrypt.hash("password", 12),
            email: "test@example.org",
            date_of_birth: "2000-01-01",
        };

        mockUser = await User.create(data);

        const userId = await Hero.getUserIdByUsername("user");
        expect(userId).toBe(mockUser.id);
    });

    it("should get hero's points by user ID", async () => {
        const data = {
            fullname: "Eva Smith",
            username: "user",
            hashedPassword: await bcrypt.hash("password", 12),
            email: "test@example.org",
            date_of_birth: "2000-01-01",
        };

        await User.create(data);
        const userId = await Hero.getUserIdByUsername("user");

        let points = await Hero.getPointsByUserId(userId);
        expect(points).toBe(0);

        // Manually give hero some points
        await global.db.query("UPDATE hero SET total_points = 100 WHERE user_id = $1", [userId]);
        points = await Hero.getPointsByUserId(userId);
        expect(points).toBe(100);
    });

    it("should return the hero's empty inventory initially", async () => {
        const data = {
            fullname: "Eva Smith",
            username: "user",
            hashedPassword: await bcrypt.hash("password", 12),
            email: "test@example.org",
            date_of_birth: "2000-01-01",
        };

        await User.create(data);
        const userId = await Hero.getUserIdByUsername("user");

        const inventory = await Hero.getInventoryByUserId(userId);
        expect(Array.isArray(inventory)).toBe(true);
        expect(inventory.length).toBe(0);
    });

    it("should list shop items", async () => {
        const items = await Hero.getShopItems();
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBeGreaterThan(0);
    });

    it("should purchase an item if enough points", async () => {
        const data = {
            fullname: "Eva Smith",
            username: "user",
            hashedPassword: await bcrypt.hash("password", 12),
            email: "test@example.org",
            date_of_birth: "2000-01-01",
        };

        await User.create(data);
        const userId = await Hero.getUserIdByUsername("user");

        // Manually give hero some points
        await global.db.query("UPDATE hero SET total_points = 100 WHERE user_id = $1", [userId]);

        const shopItems = await Hero.getShopItems();
        const itemId = shopItems[0].item_id;
        const postPurchase = await Hero.purchaseItem(userId, itemId);

        expect(postPurchase.newPoints).toBeLessThanOrEqual(100);
        expect(postPurchase.heroId).toBeDefined();

        const heroItems = await Hero.getInventoryByUserId(userId);
        expect(heroItems.length).toBe(1);
        expect(heroItems[0].item_id).toBe(itemId);
    });

    it("should equip and unequip an item", async () => {
        const data = {
            fullname: "Eva Smith",
            username: "user",
            hashedPassword: await bcrypt.hash("password", 12),
            email: "test@example.org",
            date_of_birth: "2000-01-01",
        };

        await User.create(data);
        const userId = await Hero.getUserIdByUsername("user");

        // Manually give hero some points
        await global.db.query("UPDATE hero SET total_points = 100 WHERE user_id = $1", [userId]);

        const shopItems = await Hero.getShopItems();
        const itemId = shopItems[0].item_id;
        const postPurchase = await Hero.purchaseItem(userId, itemId);

        const heroItems = await Hero.getInventoryByUserId(userId);
        const heroItemId = heroItems[0].hero_items_id;

        const equip = await Hero.equipItem(userId, heroItemId, true);
        expect(equip.success).toBe(true);

        let equippedItems = await Hero.getEquippedItemsByUserId(userId);
        expect(equippedItems.length).toBe(1);

        const unequip = await Hero.equipItem(userId, heroItemId, false);
        expect(unequip.success).toBe(true);

        equippedItems = await Hero.getEquippedItemsByUserId(userId);
        expect(equippedItems.length).toBe(0);
    });
});