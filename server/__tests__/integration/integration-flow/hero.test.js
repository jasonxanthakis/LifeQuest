const { beforeEach } = require("@jest/globals");
const request = require("supertest");

let app;
let token;
let userId;

describe("Server-side: Hero flow", () => {
    beforeAll(async () => {
        jest.isolateModules(() => {
            jest.doMock("../../../database/connect.js", () => global.db);

            app = require("../../../app.js");
        });
    });

    beforeEach(async () => {
        // Create user + login
        const signupRes = await request(app)
            .post("/user/signup")
            .send({
                fullname: "Eva Smith",
                username: "user",
                password: "password",
                email: "test@example.com",
                date_of_birth: "2000-01-01",
            });

        token = signupRes.body.token;
        userId = signupRes.body.user?.id || null;
    });

    it("should fetch shop items", async () => {
        const res = await request(app)
            .get("/hero/user/shop")
            .set("Authorization", token);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.items)).toBe(true);
        expect(res.body.items.length).toBeGreaterThan(0);

        // Save first item for later purchase
        global.firstItem = res.body.items[0];
    });

    it("should purchase an item if enough points", async () => {
        // Give hero some points
        await global.db.query("UPDATE hero SET total_points = 100 WHERE user_id = (SELECT id FROM users WHERE username = $1)", ["user"]);

        const res = await request(app)
            .post("/hero/user/shop/item")
            .set("Authorization", token)
            .send({ itemid: global.firstItem.item_id });

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
            expect.objectContaining({
                points: 95,
                items: expect.any(Array),
                shop_items: expect.any(Array),
            })
        );
    });

    it("should show purchased item in inventory", async () => {
        // Give hero some points
        await global.db.query("UPDATE hero SET total_points = 100 WHERE user_id = (SELECT id FROM users WHERE username = $1)", ["user"]);

        const _ = await request(app)
            .post("/hero/user/shop/item")
            .set("Authorization", token)
            .send({ itemid: global.firstItem.item_id });

        const res = await request(app)
            .get("/hero/user/inventory")
            .set("Authorization", token);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(
            expect.objectContaining({
                items: expect.any(Array),
            })
        );
        expect(res.body.items.length).toBeGreaterThan(0);
    });

    it("should equip an item", async () => {
        // Give hero some points
        await global.db.query("UPDATE hero SET total_points = 100 WHERE user_id = (SELECT id FROM users WHERE username = $1)", ["user"]);

        const _ = await request(app)
            .post("/hero/user/shop/item")
            .set("Authorization", token)
            .send({ itemid: global.firstItem.item_id });

        const res = await request(app)
            .get("/hero/user/inventory")
            .set("Authorization", token);
        
        const purchasedItem = res.body.items[0];

        const equipRes = await request(app)
            .patch("/hero/user/inventory/equip")
            .set("Authorization", token)
            .send({
                hero_items_id: purchasedItem.hero_items_id,
                is_equipped: true
            });

        expect(equipRes.status).toBe(200);
        expect(equipRes.body.message).toBe(`Item equipped successfully`);

        const unequipRes = await request(app)
            .patch("/hero/user/inventory/equip")
            .set("Authorization", token)
            .send({
                hero_items_id: purchasedItem.hero_items_id,
                is_equipped: false
            });

        expect(unequipRes.status).toBe(200);
        expect(unequipRes.body.message).toBe(`Item unequipped successfully`);
    });
});