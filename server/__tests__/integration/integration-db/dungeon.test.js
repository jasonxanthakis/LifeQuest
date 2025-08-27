const bcrypt = require("bcrypt");

const { expect, beforeAll, beforeEach } = require("@jest/globals");

let User;
let Dungeon;

describe("Dungeon model integration", () => {
    let mockUser;

    beforeAll(async () => {
        jest.isolateModules(() => {
            jest.doMock("../../../database/connect.js", () => global.db);

            User = require("../../../models/User.js");
            Dungeon = require("../../../models/Dungeon.js");
        });
    });

    beforeEach(async () => {
        const data = {
            fullname: "Eva Smith",
            username: "user",
            hashedPassword: await bcrypt.hash("password", 12),
            email: "test@example.org",
            date_of_birth: "2000-01-01",
        };

        mockUser = await User.create(data);

        jest.clearAllMocks();
    });

    afterAll(() => jest.resetAllMocks());

    it("should get hero data by username", async () => {
        const test = await global.db.query("SELECT * from hero WHERE user_id = (SELECT id FROM users WHERE username = $1);", [mockUser.username]);

        const hero = await Dungeon.getHeroByUsername(mockUser.username);

        expect(hero.name).toBe(test.rows[0].hero_name);
        expect(hero.hp).toBe(test.rows[0].health);
        expect(hero.att).toBe(test.rows[0].damage);
        expect(hero.def).toBe(test.rows[0].defense);
        expect(hero.level).toBe(test.rows[0].current_level);
        expect(hero.level).toBe(1);
    });

    it("should successfully load the dungeon level", async () => {
        let hero = await Dungeon.getHeroByUsername(mockUser.username);

        let dungeon = await Dungeon.loadLevel(hero);
        
        expect(dungeon.level).toBe(1);
        expect(dungeon.hero).toBe(hero);
        expect(dungeon.enemy.name).toBe("Goblin");

        // Manually increment the hero's level
        await global.db.query("UPDATE hero SET current_level = 10 WHERE user_id = (SELECT id FROM users WHERE username = $1);", [mockUser.username]);

        hero = await Dungeon.getHeroByUsername(mockUser.username);

        dungeon = await Dungeon.loadLevel(hero);
        
        expect(dungeon.level).toBe(10);
        expect(dungeon.hero).toBe(hero);
        expect(dungeon.enemy.name).toBe("Dragon");
    });

    it("should calculate the points gained when the hero wins a battle", async () => {
        let hero = await Dungeon.getHeroByUsername(mockUser.username);

        let points = Dungeon.pointsWon(hero);

        expect(points).toBe(10);

        // Manually increment the hero's level
        await global.db.query("UPDATE hero SET current_level = 10 WHERE user_id = (SELECT id FROM users WHERE username = $1);", [mockUser.username]);

        hero = await Dungeon.getHeroByUsername(mockUser.username);

        points = Dungeon.pointsWon(hero);

        expect(points).toBe(200);
    });

    it("should record a win in the database by incrementing level and points accordingly", async () => {
        let data = await global.db.query("SELECT * FROM hero WHERE user_id = (SELECT id FROM users WHERE username = $1);", [mockUser.username]);

        expect(data.rows[0].current_level).toBe(1);
        expect(data.rows[0].total_points).toBe(0);

        const hero = await Dungeon.getHeroByUsername(mockUser.username);
        const points = Dungeon.pointsWon(hero);

        await Dungeon.recordWin(mockUser.username, points);

        data = await global.db.query("SELECT * FROM hero WHERE user_id = (SELECT id FROM users WHERE username = $1);", [mockUser.username]);

        expect(data.rows[0].current_level).toBe(2);
        expect(data.rows[0].total_points).toBe(10);
    });

    it("should run a battle simulation and return the winner", async () => {
        // Manually weaken the hero
        await global.db.query("UPDATE hero SET health = 1, damage = 1, defense = 1 WHERE user_id = (SELECT id FROM users WHERE username = $1);", [mockUser.username]);

        let hero = await Dungeon.getHeroByUsername(mockUser.username);
        let dungeon = await Dungeon.loadLevel(hero);

        let won = await dungeon.simBattle();

        expect(won).toBe(false);

        // Manually strengthen the hero
        await global.db.query("UPDATE hero SET health = 100, damage = 100, defense = 100 WHERE user_id = (SELECT id FROM users WHERE username = $1);", [mockUser.username]);

        hero = await Dungeon.getHeroByUsername(mockUser.username);
        dungeon = await Dungeon.loadLevel(hero);

        won = await dungeon.simBattle();

        expect(won).toBe(true);
    });
});