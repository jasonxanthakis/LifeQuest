const { beforeEach, expect } = require("@jest/globals");
const request = require("supertest");

let app;
let token;

let Enemy;

describe("Server-side: Dungeon flow", () => {
    beforeAll(async () => {
        jest.isolateModules(() => {
            jest.doMock("../../../database/connect.js", () => global.db);

            app = require("../../../app.js");
            Enemy = require("../../../models/Enemy.js");
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

        jest.clearAllMocks();
    });
    
    afterAll(() => jest.resetAllMocks());

    it("should fetch the dungeon level", async () => {
        const res = await request(app)
            .get("/dungeon")
            .set("Authorization", token);

        expect(res.status).toBe(200);
        expect(res.body.level).toBe(1);
        expect(res.body.hero).toStrictEqual({"att": 10, "def": 10, "hp": 120, "level": 1, "name": "user"});
        expect(res.body.enemy).toStrictEqual({"att": 12, "def": 8, "hp": 90, "name": "Goblin"});
    });

    it("should simulate a battle and return the winner", async () => {
        // Manually weaken the hero
        await global.db.query("UPDATE hero SET health = 1, damage = 1, defense = 1 WHERE user_id = (SELECT id FROM users WHERE username = $1);", ['user']);

        let res = await request(app)
            .patch("/dungeon/battle")
            .set("Authorization", token);

        expect(res.status).toBe(200);
        expect(res.body.won).toBe(false);
        expect(res.body.points_gained).toBe(0);
        expect(res.body.winner).toStrictEqual({"att": 12, "def": 8, "hp": 89, "name": "Goblin"});

        // Manually strengthen the hero
        await global.db.query("UPDATE hero SET health = 100, damage = 100, defense = 100 WHERE user_id = (SELECT id FROM users WHERE username = $1);", ['user']);

        res = await request(app)
            .patch("/dungeon/battle")
            .set("Authorization", token);

        expect(res.status).toBe(200);
        expect(res.body.won).toBe(true);
        expect(res.body.points_gained).toBe(10);
        expect(res.body.winner).toStrictEqual({"att": 100, "def": 100, "hp": 100, "level": 1, "name": "user"});
    });
});