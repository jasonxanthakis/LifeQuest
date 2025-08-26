const { expect, beforeAll, beforeEach } = require("@jest/globals");
const bcrypt = require("bcrypt");

// Mock res object
function createResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

let HeroController;
let Hero;
let User;

describe("Hero controller integration with hero model and DB", () => {
    let res;
    let mockUser;

    beforeAll(async () => {
        jest.isolateModules(() => {
            jest.mock("jsonwebtoken", () => ({
                sign: jest.fn((payload, secret, options, callback) => callback(null, "fake-token")),
            }));

            jest.doMock("../../../database/connect.js", () => global.db);

            User = require("../../../models/User.js");
            Hero = require("../../../models/Hero.js");
            HeroController = require("../../../controllers/hero.js");
        });

        res = createResMock();
    });

    beforeEach(async () => {
        // Create a user for Hero tests
        mockUser = await User.create({
            fullname: "Eva Smith",
            username: "user",
            hashedPassword: await bcrypt.hash("password", 12),
            email: "test@example.org",
            date_of_birth: "2000-01-01",
        });
    });

    it("should get user inventory", async () => {
        const req = { user: mockUser.username };

        await HeroController.getUserInventory(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                points: expect.any(Number),
                items: expect.any(Array),
            })
        );
    });

    it("should get shop items", async () => {
        const req = { user: mockUser.username };

        await HeroController.getShopItems(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                points: expect.any(Number),
                items: expect.any(Array),
            })
        );
    });

    it("should purchase an item if enough points", async () => {
        const shopItems = await Hero.getShopItems();
        const itemId = shopItems[0].item_id;

        const req = { user: mockUser.username, body: { itemid: itemId } };

        // Give hero points manually
        await global.db.query("UPDATE hero SET total_points = 100 WHERE user_id = $1", [mockUser.id]);

        await HeroController.purchaseItem(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const lastJsonCall = res.json.mock.calls.at(-1)[0];
        expect(lastJsonCall.points).toBe(95);
        expect(Array.isArray(lastJsonCall.items)).toBe(true);

        const heroItems = await Hero.getInventoryByUserId(mockUser.id);
        expect(heroItems.length).toBeGreaterThanOrEqual(1);
    });

      it("should equip and unequip an item", async () => {
        const shopItems = await Hero.getShopItems();
        const itemId = shopItems[0].item_id;

        let req = { user: mockUser.username, body: { itemid: itemId } };

        // Give hero points manually
        await global.db.query("UPDATE hero SET total_points = 100 WHERE user_id = $1", [mockUser.id]);

        await HeroController.purchaseItem(req, res);

        const heroItems = await Hero.getInventoryByUserId(mockUser.id);
        const heroItemId = heroItems[0].hero_items_id;

        req = { user: mockUser.username, body: { hero_items_id: heroItemId, is_equipped: true } };
        await HeroController.equipItem(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: "Item equipped successfully"
            })
        );

        req = { user: mockUser.username, body: { hero_items_id: heroItemId, is_equipped: false } };
        await HeroController.equipItem(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                message: `Item unequipped successfully`
            })
        );
    });
});