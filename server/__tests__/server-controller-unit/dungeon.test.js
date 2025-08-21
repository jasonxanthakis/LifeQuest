const {expect, it, describe, beforeEach} = require("@jest/globals");
const {loadDungeon, simulateBattle} = require('../../controllers/dungeon.js')
const Dungeon = require('../../models/Dungeon.js');

const mockSend = jest.fn()
const mockJson = jest.fn()
const mockEnd = jest.fn()

const mockStatus = jest.fn(() => ({ 
    send: mockSend, 
    json: mockJson, 
    end: mockEnd 
}));

const mockRes = { status: mockStatus };

jest.mock('../../database/connect.js', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

describe('Dungeon Controller', () => {
    beforeEach(() => jest.clearAllMocks());

    afterAll(() => jest.resetAllMocks());

    describe('Load dungeon level', () => {
        let mockReq;
        beforeEach(() => mockReq = {
            user: 'EvaSmith'
        });

        it('should return a dungeon object with status code 200', async () => {
            mockDungeon = {
                level: 1,
                hero: {
                    name: 'EvaSmith',
                    hp: 100,
                    att: 10,
                    def: 10,
                    level: 1
                },
                enemy: {
                    id: 1,
                    enemy_name: 'goblin',
                    enemy_level: 1,
                    enemy_xp: 0
                }
            }

            jest.spyOn(Dungeon, 'getHeroByUsername').mockResolvedValueOnce({});

            jest.spyOn(Dungeon, 'loadLevel').mockResolvedValueOnce(mockDungeon);

            await loadDungeon(mockReq, mockRes);

            expect(Dungeon.getHeroByUsername).toHaveBeenCalledWith('EvaSmith');
            expect(Dungeon.loadLevel).toHaveBeenCalledWith({});

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith(mockDungeon);
        });

        it('should throw an error with status code 400 if something went wrong', async () => {
            jest.spyOn(Dungeon, 'getHeroByUsername').mockRejectedValue(new Error('oh no'));

            await loadDungeon(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'oh no' });
        });
    });

    describe('Run battle simulation', () => {
        let mockReq;
        beforeEach(() => mockReq = {
            user: 'EvaSmith'
        });

        it('should return the winner and the points they gained with status code 200 if user won', async () => {
            const mockDungeon = new Dungeon(1, 'me', 'goblin');

            jest.spyOn(Dungeon, 'getHeroByUsername').mockResolvedValueOnce({});

            jest.spyOn(Dungeon, 'loadLevel').mockResolvedValueOnce(mockDungeon);

            jest.spyOn(mockDungeon, 'simBattle').mockResolvedValueOnce(true);

            jest.spyOn(Dungeon, 'pointsWon').mockResolvedValueOnce(10);

            jest.spyOn(Dungeon, 'recordWin').mockResolvedValueOnce();

            await simulateBattle(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                'won': true,
                'points_gained': 10,
                'winner': 'me'
            });
        });

        it('should return the winner and the points they gained with status code 200 if user lost', async () => {
            const mockDungeon = new Dungeon(1, 'me', 'goblin');

            jest.spyOn(Dungeon, 'getHeroByUsername').mockResolvedValueOnce({});

            jest.spyOn(Dungeon, 'loadLevel').mockResolvedValueOnce(mockDungeon);

            jest.spyOn(mockDungeon, 'simBattle').mockResolvedValueOnce(false);

            await simulateBattle(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                'won': false,
                'points_gained': 0,
                'winner': 'goblin'
            });
        });

        it('should throw an error with status code 400 if something went wrong', async () => {
            jest.spyOn(Dungeon, 'getHeroByUsername').mockRejectedValue(new Error('oh no'));

            await simulateBattle(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'oh no' });
        });
    });
});