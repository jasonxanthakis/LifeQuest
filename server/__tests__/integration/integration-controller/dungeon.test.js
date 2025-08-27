const { expect, beforeAll, beforeEach } = require("@jest/globals");
const bcrypt = require("bcrypt");

// Mock res object
function createResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

let DungeonController;
let Dungeon;
let User;
let Enemy;

describe("Dungeon controller integration with dungeon model and DB", () => {
    let res;
    let mockUser;

    beforeAll(async () => {
        jest.isolateModules(() => {
            jest.doMock("../../../database/connect.js", () => global.db);

            User = require("../../../models/User.js");
            Enemy = require("../../../models/Enemy.js");
            Dungeon = require("../../../models/Dungeon.js");
            DungeonController = require("../../../controllers/dungeon.js");
        });

        res = createResMock();
    });

    beforeEach(async () => {
        mockUser = await User.create({
            fullname: "Eva Smith",
            username: "user",
            hashedPassword: await bcrypt.hash("password", 12),
            email: "test@example.org",
            date_of_birth: "2000-01-01",
        });

        jest.clearAllMocks();
    });
    
    afterAll(() => jest.resetAllMocks());

    it("should load the dungeon level", async () => {
        const req = { user: mockUser.username };

        let hero = await Dungeon.getHeroByUsername(mockUser.username);
        let dungeon = await Dungeon.loadLevel(hero);

        await DungeonController.loadDungeon(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            {
                "enemy": {"att": 12, "def": 8, "hp": 90, "name": "Goblin"},
                "hero": {"att": 10, "def": 10, "hp": 120, "level": 1, "name": "user"},
                "level": 1
            }
        );
    });

    it("should run a battle simulation", async () => {
        const req = { user: mockUser.username };

        // Manually weaken the hero
        await global.db.query("UPDATE hero SET health = 1, damage = 1, defense = 1 WHERE user_id = (SELECT id FROM users WHERE username = $1);", [mockUser.username]);

        await DungeonController.simulateBattle(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            {
                "won": false,
                "points_gained": 0,
                "winner": new Enemy("Goblin", 89, 12, 8)
            }
        );

        jest.clearAllMocks();

        // Manually strengthen the hero
        await global.db.query("UPDATE hero SET health = 100, damage = 100, defense = 100 WHERE user_id = (SELECT id FROM users WHERE username = $1);", [mockUser.username]);

        await DungeonController.simulateBattle(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith(
            {
                "won": true,
                "points_gained": 10,
                "winner": {"att": 100, "def": 100, "hp": 100, "level": 1, "name": "user"},
            }
        );
    });
});