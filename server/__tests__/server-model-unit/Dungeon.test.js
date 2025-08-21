require("dotenv").config();
const {expect, it, describe} = require("@jest/globals");
const Dungeon = require('../../models/Dungeon.js');

jest.mock('../../database/connect.js', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

const db = require("../../database/connect.js");

describe('Dungeon model functions', () => {
    beforeEach(() => jest.clearAllMocks());

    afterAll(() => jest.resetAllMocks());

    it('Retrieves a hero by user username', async () => {
        db.query.mockResolvedValueOnce({
            rows: [
                {
                id: 1,
                user_id: 1,
                current_level: 2,
                hero_name: 'EvaSmith',
                total_points: 10,
                total_xp: 0,
                next_enemy: '???'
                }
            ],
            rowCount: 1
        });

        const hero = await Dungeon.getHeroByUsername('EvaSmith');

        expect(hero.name).toBe('EvaSmith');
        expect(hero.level).toBe(2);
        expect(hero.hp).toBe(100);
    });

    it('Throws an error if more/less than one hero are returned', async () => {
        db.query.mockResolvedValueOnce({
            rows: [],
            rowCount: 0
        });

        await expect(Dungeon.getHeroByUsername('not_a_user'))
            .rejects
            .toThrow("Database failed to return specified hero...");
    });

    describe('Load the dungeon level', () => {
        it('Loads the current dungeon level', async () => {
            const testHero = {
                'name': 'EvaSmith',
                'hp': 100,
                'att': 10,
                'def': 10,
                'level': 1
            }

            db.query.mockResolvedValueOnce({
                rows: [
                    {
                    id: 1,
                    enemy_name: 'goblin',
                    enemy_level: 1,
                    enemy_xp: 0
                    }
                ],
                rowCount: 1
            });

            const dungeon = await Dungeon.loadLevel(testHero);

            expect(dungeon.level).toBe(1);
            expect(dungeon.hero.name).toBe('EvaSmith');
            expect(dungeon.enemy.name).toBe('goblin');
        });

        it('Throws an error if the level is invalid', async () => {
            const testHero = {
                'name': 'EvaSmith',
                'hp': 100,
                'att': 10,
                'def': 10,
                'level': -1
            }

            await expect(Dungeon.loadLevel(testHero))
                .rejects
                .toThrow("Invalid level. Something went wrong...");
        });

        it('Throws an error if more/less than one hero are returned', async () => {
            const testHero = {
                'name': 'EvaSmith',
                'hp': 100,
                'att': 10,
                'def': 10,
                'level': 1
            }

            db.query.mockResolvedValueOnce({
                rows: [

                ],
                rowCount: 0
            });

            await expect(Dungeon.loadLevel(testHero))
                .rejects
                .toThrow("Database failed to return specified enemy...");
        });
    });

    describe('Run a battle simulation', () => {
        it('Runs a battle simulation and returns true if the user won', async () => {
            const testHero = {
                'name': 'EvaSmith',
                'hp': 100,
                'att': 10,
                'def': 10,
                'level': 1
            }

            db.query.mockResolvedValueOnce({
                rows: [
                    {
                    id: 1,
                    enemy_name: 'goblin',
                    enemy_level: 1,
                    enemy_xp: 0
                    }
                ],
                rowCount: 1
            });

            const dungeon = await Dungeon.loadLevel(testHero);

            const won = await dungeon.simBattle();

            expect(won).toBe(true);
        });
    });

    it('Calculates the points won', () => {
        const testHero = {
            'name': 'EvaSmith',
            'hp': 100,
            'att': 10,
            'def': 10,
            'level': 1
        }

        const testEnemy = {
            'name': 'Goblin',
            'hp': 20,
            'att': 10,
            'def': 10
        }

        const testDungeon1 = new Dungeon(1, testHero, testEnemy);
        const points1 = Dungeon.pointsWon(testDungeon1);

        const testDungeon2 = new Dungeon(9, testHero, testEnemy);
        const points2 = Dungeon.pointsWon(testDungeon2);

        const testDungeon3 = new Dungeon(100, testHero, testEnemy);
        const points3 = Dungeon.pointsWon(testDungeon3);

        const testDungeon4 = new Dungeon(1234, testHero, testEnemy);
        const points4 = Dungeon.pointsWon(testDungeon4);

        expect(points1).toBe(10);
        expect(points2).toBe(90);
        expect(points3).toBe(30);
        expect(points4).toBe(160);
    });

    describe('Update the database if user won', () => {
        it('Updates the user points and level', async () => {
            const username = 'EvaSmith';
            const points = 100;

            db.query.mockResolvedValueOnce({
                rows: [
                    {
                    id: 1,
                    user_id: 1,
                    current_level: 2,
                    hero_name: 'EvaSmith',
                    total_points: 10,
                    total_xp: 0,
                    next_enemy: '???'
                    }
                ],
                rowCount: 1
            });

            jest.spyOn(db, 'query');

            await Dungeon.recordWin(username, points);

            expect(db.query).toHaveBeenCalledTimes(2);
        });

        it('Throws an error if more/less than one hero are returned', async () => {
            const username = 'EvaSmith';
            const points = 100;

            db.query.mockResolvedValueOnce({
                rows: [

                ],
                rowCount: 0
            });

            await expect(Dungeon.recordWin(username, points))
                .rejects
                .toThrow("Database failed to return specified hero...");
        });
    });
});