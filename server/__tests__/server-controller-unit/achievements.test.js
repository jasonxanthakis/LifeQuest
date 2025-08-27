jest.mock('../../database/connect.js', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

const { expect } = require('@jest/globals');
const { getUserAchievements } = require('../../controllers/achievements.js');
const Achievements = require('../../models/Achievements.js');
const Hero = require('../../models/Hero.js');

jest.mock('../../models/Achievements.js');
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

describe('Achievements Controller', () => {
    let consoleErrorSpy;

    beforeEach(() => {
        jest.clearAllMocks();
        // Suppress console.error during tests
        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore console.error after each test
        if (consoleErrorSpy) {
            consoleErrorSpy.mockRestore();
        }
    });

    afterAll(() => jest.resetAllMocks());

    describe('getUserAchievements', () => {
        let mockReq;

        beforeEach(() => {
            mockReq = {
                user: 'TestUser'
            };
        });

        it('should return user achievements and current streak with status 200', async () => {
            const mockUserId = 1;
            const mockAchievements = [
                {
                    id: 0,
                    name: "Starting Your Journey",
                    description: "Welcome to LifeQuest! Your adventure begins now.",
                    days_required: 0,
                    image: "starting-journey.png",
                    achieved: true
                },
                {
                    id: 1,
                    name: "First Step",
                    description: "Completed your first day!",
                    days_required: 1,
                    image: "first-step.png",
                    achieved: true
                },
                {
                    id: 2,
                    name: "Strong Start",
                    description: "3 days of progress!",
                    days_required: 3,
                    image: "3-days.png",
                    achieved: false
                }
            ];
            const mockCurrentStreak = 2;

            Hero.getUserIdByUsername.mockResolvedValue(mockUserId);
            Achievements.getUserAchievements.mockResolvedValue({
                achievements: mockAchievements,
                current_streak: mockCurrentStreak
            });

            await getUserAchievements(mockReq, mockRes);

            expect(Hero.getUserIdByUsername).toHaveBeenCalledWith('TestUser');
            expect(Achievements.getUserAchievements).toHaveBeenCalledWith(mockUserId);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                achievements: mockAchievements,
                current_streak: mockCurrentStreak
            });
        });

        it('should return achievements for user with no progress', async () => {
            const mockUserId = 2;
            const mockAchievements = [
                {
                    id: 0,
                    name: "Starting Your Journey",
                    description: "Welcome to LifeQuest! Your adventure begins now.",
                    days_required: 0,
                    image: "starting-journey.png",
                    achieved: true
                },
                {
                    id: 1,
                    name: "First Step",
                    description: "Completed your first day!",
                    days_required: 1,
                    image: "first-step.png",
                    achieved: false
                }
            ];
            const mockCurrentStreak = 0;

            Hero.getUserIdByUsername.mockResolvedValue(mockUserId);
            Achievements.getUserAchievements.mockResolvedValue({
                achievements: mockAchievements,
                current_streak: mockCurrentStreak
            });

            await getUserAchievements(mockReq, mockRes);

            expect(Hero.getUserIdByUsername).toHaveBeenCalledWith('TestUser');
            expect(Achievements.getUserAchievements).toHaveBeenCalledWith(mockUserId);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                achievements: mockAchievements,
                current_streak: mockCurrentStreak
            });
        });

        it('should handle error when user is not found', async () => {
            const errorMessage = 'User not found';
            Hero.getUserIdByUsername.mockRejectedValue(new Error(errorMessage));

            await getUserAchievements(mockReq, mockRes);

            expect(Hero.getUserIdByUsername).toHaveBeenCalledWith('TestUser');
            expect(Achievements.getUserAchievements).not.toHaveBeenCalled();
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting user achievements:', expect.any(Error));
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Failed to get achievements',
                achievements: [],
                current_streak: 0
            });
        });

        it('should handle error when achievements retrieval fails', async () => {
            const mockUserId = 1;
            const errorMessage = 'Database connection failed';
            
            Hero.getUserIdByUsername.mockResolvedValue(mockUserId);
            Achievements.getUserAchievements.mockRejectedValue(new Error(errorMessage));

            await getUserAchievements(mockReq, mockRes);

            expect(Hero.getUserIdByUsername).toHaveBeenCalledWith('TestUser');
            expect(Achievements.getUserAchievements).toHaveBeenCalledWith(mockUserId);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting user achievements:', expect.any(Error));
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Failed to get achievements',
                achievements: [],
                current_streak: 0
            });
        });

        it('should handle missing username in request', async () => {
            mockReq.user = undefined;

            await getUserAchievements(mockReq, mockRes);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Error getting user achievements:', expect.any(Error));
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({
                error: 'Failed to get achievements',
                achievements: [],
                current_streak: 0
            });
        });

        it('should return achievements for user with high streak', async () => {
            const mockUserId = 3;
            const mockAchievements = [
                {
                    id: 0,
                    name: "Starting Your Journey",
                    description: "Welcome to LifeQuest! Your adventure begins now.",
                    days_required: 0,
                    image: "starting-journey.png",
                    achieved: true
                },
                {
                    id: 1,
                    name: "First Step",
                    description: "Completed your first day!",
                    days_required: 1,
                    image: "first-step.png",
                    achieved: true
                },
                {
                    id: 2,
                    name: "Strong Start",
                    description: "3 days of progress!",
                    days_required: 3,
                    image: "3-days.png",
                    achieved: true
                },
                {
                    id: 3,
                    name: "One Week Sober",
                    description: "7 days of staying strong!",
                    days_required: 7,
                    image: "one-week.png",
                    achieved: true
                },
                {
                    id: 4,
                    name: "Half a Month",
                    description: "14 days of dedication!",
                    days_required: 14,
                    image: "14-days.png",
                    achieved: false
                }
            ];
            const mockCurrentStreak = 10;

            Hero.getUserIdByUsername.mockResolvedValue(mockUserId);
            Achievements.getUserAchievements.mockResolvedValue({
                achievements: mockAchievements,
                current_streak: mockCurrentStreak
            });

            await getUserAchievements(mockReq, mockRes);

            expect(Hero.getUserIdByUsername).toHaveBeenCalledWith('TestUser');
            expect(Achievements.getUserAchievements).toHaveBeenCalledWith(mockUserId);
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                achievements: mockAchievements,
                current_streak: mockCurrentStreak
            });
        });
    });
});
