require("dotenv").config();
const { expect, it, describe, beforeAll, afterAll } = require("@jest/globals");
const Achievements = require('../../models/Achievements.js');

jest.mock('../../database/connect.js', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

const db = require("../../database/connect.js");

describe('Achievements model functions', () => {
    beforeEach(() => jest.clearAllMocks());

    afterAll(() => jest.resetAllMocks());

    describe('getAchievementMilestones', () => {
        it('should return all achievement milestones', () => {
            const milestones = Achievements.getAchievementMilestones();

            expect(milestones).toBeDefined();
            expect(Array.isArray(milestones)).toBe(true);
            expect(milestones.length).toBeGreaterThan(0);

            // Check the structure of milestones
            milestones.forEach(milestone => {
                expect(milestone).toHaveProperty('id');
                expect(milestone).toHaveProperty('name');
                expect(milestone).toHaveProperty('description');
                expect(milestone).toHaveProperty('days_required');
                expect(milestone).toHaveProperty('image');
                expect(typeof milestone.id).toBe('number');
                expect(typeof milestone.name).toBe('string');
                expect(typeof milestone.description).toBe('string');
                expect(typeof milestone.days_required).toBe('number');
                expect(typeof milestone.image).toBe('string');
            });
        });

        it('should include specific milestone achievements', () => {
            const milestones = Achievements.getAchievementMilestones();
            
            // Check for specific milestones
            const startingJourney = milestones.find(m => m.name === "Starting Your Journey");
            const firstStep = milestones.find(m => m.name === "First Step");
            const oneWeek = milestones.find(m => m.name === "One Week Sober");
            const oneYear = milestones.find(m => m.name === "One Year Sober");

            expect(startingJourney).toBeDefined();
            expect(startingJourney.days_required).toBe(0);
            
            expect(firstStep).toBeDefined();
            expect(firstStep.days_required).toBe(1);
            
            expect(oneWeek).toBeDefined();
            expect(oneWeek.days_required).toBe(7);
            
            expect(oneYear).toBeDefined();
            expect(oneYear.days_required).toBe(365);
        });

        it('should have milestones in ascending order of days_required', () => {
            const milestones = Achievements.getAchievementMilestones();
            
            for (let i = 1; i < milestones.length; i++) {
                expect(milestones[i].days_required).toBeGreaterThan(milestones[i-1].days_required);
            }
        });
    });

    describe('getUserAchievements', () => {
        it('should return achievements for user with no streak data', async () => {
            db.query.mockResolvedValueOnce({
                rows: [],
                rowCount: 0
            });

            const result = await Achievements.getUserAchievements(1);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT MAX(GREATEST(current_streak, best_streak))'),
                [1]
            );
            expect(result).toHaveProperty('achievements');
            expect(result).toHaveProperty('current_streak');
            expect(Array.isArray(result.achievements)).toBe(true);
            expect(result.current_streak).toBe(0);

            // Only the starting achievement should be achieved
            const achievedCount = result.achievements.filter(a => a.achieved).length;
            expect(achievedCount).toBe(1);
            expect(result.achievements[0].achieved).toBe(true); // Starting Your Journey
            expect(result.achievements[0].days_required).toBe(0);
        });

        it('should return achievements for user with low streak (2 days)', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ best_streak: 2 }],
                rowCount: 1
            });

            const result = await Achievements.getUserAchievements(1);

            expect(result.current_streak).toBe(2);
            
            // Should have starting journey (0 days) and first step (1 day) achieved
            const achievedAchievements = result.achievements.filter(a => a.achieved);
            expect(achievedAchievements.length).toBe(2);
            
            const achievedNames = achievedAchievements.map(a => a.name);
            expect(achievedNames).toContain("Starting Your Journey");
            expect(achievedNames).toContain("First Step");
        });

        it('should return achievements for user with medium streak (10 days)', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ best_streak: 10 }],
                rowCount: 1
            });

            const result = await Achievements.getUserAchievements(1);

            expect(result.current_streak).toBe(10);
            
            // Should have achievements up to 7 days achieved
            const achievedAchievements = result.achievements.filter(a => a.achieved);
            const unachievedAchievements = result.achievements.filter(a => !a.achieved);
            
            // Check specific achievements
            const oneWeekAchieved = result.achievements.find(a => a.name === "One Week Sober");
            const halfMonthAchieved = result.achievements.find(a => a.name === "Half a Month");
            
            expect(oneWeekAchieved.achieved).toBe(true);
            expect(halfMonthAchieved.achieved).toBe(false);
        });

        it('should return achievements for user with high streak (100 days)', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ best_streak: 100 }],
                rowCount: 1
            });

            const result = await Achievements.getUserAchievements(1);

            expect(result.current_streak).toBe(100);
            
            // Should have achievements up to 90 days achieved
            const achievedAchievements = result.achievements.filter(a => a.achieved);
            const threeMonthsAchieved = result.achievements.find(a => a.days_required === 90);
            const sixMonthsAchieved = result.achievements.find(a => a.days_required === 180);
            const oneYearAchieved = result.achievements.find(a => a.days_required === 365);
            
            expect(threeMonthsAchieved.achieved).toBe(true);
            expect(sixMonthsAchieved.achieved).toBe(false);
            expect(oneYearAchieved.achieved).toBe(false);
        });

        it('should return achievements for user with maximum streak (365+ days)', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ best_streak: 500 }],
                rowCount: 1
            });

            const result = await Achievements.getUserAchievements(1);

            expect(result.current_streak).toBe(500);
            
            // All achievements should be achieved
            const allAchieved = result.achievements.every(a => a.achieved);
            expect(allAchieved).toBe(true);
            
            const oneYearAchieved = result.achievements.find(a => a.name === "One Year Sober");
            expect(oneYearAchieved.achieved).toBe(true);
        });

        it('should handle null streak value from database', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ best_streak: null }],
                rowCount: 1
            });

            const result = await Achievements.getUserAchievements(1);

            expect(result.current_streak).toBe(0);
            
            // Only starting achievement should be achieved
            const achievedCount = result.achievements.filter(a => a.achieved).length;
            expect(achievedCount).toBe(1);
            expect(result.achievements[0].achieved).toBe(true);
        });

        it('should handle database query errors', async () => {
            const errorMessage = 'Database connection failed';
            db.query.mockRejectedValueOnce(new Error(errorMessage));

            await expect(Achievements.getUserAchievements(1))
                .rejects
                .toThrow('Failed to get user achievements: Database connection failed');
        });

        it('should correctly mark achievements as achieved based on exact day requirements', async () => {
            // Test edge case where streak exactly matches requirement
            db.query.mockResolvedValueOnce({
                rows: [{ best_streak: 7 }],
                rowCount: 1
            });

            const result = await Achievements.getUserAchievements(1);

            const oneWeekAchievement = result.achievements.find(a => a.days_required === 7);
            const halfMonthAchievement = result.achievements.find(a => a.days_required === 14);
            
            expect(oneWeekAchievement.achieved).toBe(true);
            expect(halfMonthAchievement.achieved).toBe(false);
        });

        it('should return all achievement properties correctly', async () => {
            db.query.mockResolvedValueOnce({
                rows: [{ best_streak: 5 }],
                rowCount: 1
            });

            const result = await Achievements.getUserAchievements(1);

            result.achievements.forEach(achievement => {
                expect(achievement).toHaveProperty('id');
                expect(achievement).toHaveProperty('name');
                expect(achievement).toHaveProperty('description');
                expect(achievement).toHaveProperty('days_required');
                expect(achievement).toHaveProperty('image');
                expect(achievement).toHaveProperty('achieved');
                expect(typeof achievement.achieved).toBe('boolean');
            });
        });

        it('should work with different user IDs', async () => {
            const userId = 999;
            db.query.mockResolvedValueOnce({
                rows: [{ best_streak: 3 }],
                rowCount: 1
            });

            const result = await Achievements.getUserAchievements(userId);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT MAX(GREATEST(current_streak, best_streak))'),
                [userId]
            );
            expect(result.current_streak).toBe(3);
        });
    });

    describe('Achievements constructor', () => {
        it('should create achievement instance with all properties', () => {
            const achievementData = {
                id: 1,
                name: "Test Achievement",
                description: "Test description",
                days_required: 7,
                image: "test.png",
                achieved: true
            };

            const achievement = new Achievements(achievementData);

            expect(achievement.id).toBe(1);
            expect(achievement.name).toBe("Test Achievement");
            expect(achievement.description).toBe("Test description");
            expect(achievement.days_required).toBe(7);
            expect(achievement.image).toBe("test.png");
            expect(achievement.achieved).toBe(true);
        });
    });
});
