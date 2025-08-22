const db = require('../database/connect');

class Achievements {
    constructor({ id, name, description, days_required, image, achieved }) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.days_required = days_required;
        this.image = image;
        this.achieved = achieved;
    }

    // Define achievement milestones
    static getAchievementMilestones() {
        return [
            {
                id: 0,
                name: "Starting Your Journey",
                description: "Welcome to LifeQuest! Your adventure begins now.",
                days_required: 0,
                image: "starting-journey.png"
            },
            {
                id: 1,
                name: "First Step",
                description: "Completed your first day!",
                days_required: 1,
                image: "first-step.png"
            },
            {
                id: 2,
                name: "Strong Start",
                description: "3 days of progress!",
                days_required: 3,
                image: "strong-start.png"
            },
            {
                id: 3,
                name: "One Week Sober",
                description: "7 days of staying strong!",
                days_required: 7,
                image: "one-week.png"
            },
            {
                id: 4,
                name: "Half a Month",
                description: "14 days of dedication!",
                days_required: 14,
                image: "half-month.png"
            },
            {
                id: 5,
                name: "Milestone Month",
                description: "30 days of success!",
                days_required: 30,
                image: "milestone-month.png"
            },
            {
                id: 6,
                name: "Building Strength",
                description: "60 days of perseverance!",
                days_required: 60,
                image: "building-strength.png"
            },
            {
                id: 7,
                name: "Quarter Year",
                description: "90 days of commitment!",
                days_required: 90,
                image: "quarter-year.png"
            },
            {
                id: 8,
                name: "Half a Year Free",
                description: "180 days of freedom!",
                days_required: 180,
                image: "half-year.png"
            },
            {
                id: 9,
                name: "One Year Sober",
                description: "365 days of triumph!",
                days_required: 365,
                image: "one-year.png"
            }
        ];
    }

    // Get user achievements based on their quest completion streaks
    static async getUserAchievements(userId) {
        try {
            // Get user's best streaks from quest completion data
            const streakQuery = `
                SELECT MAX(current_streak) as best_streak
                FROM user_quest_streaks 
                WHERE user_id = $1
            `;
            const streakResult = await db.query(streakQuery, [userId]);
            
            let maxStreak = 0;
            if (streakResult.rows.length > 0 && streakResult.rows[0].best_streak) {
                maxStreak = streakResult.rows[0].best_streak;
            }

            // If no streak data, check completed quests as fallback
            if (maxStreak === 0) {
                const questQuery = `
                    SELECT COUNT(*) as completed_count
                    FROM quests 
                    WHERE complete = true
                `;
                const questResult = await db.query(questQuery);
                if (questResult.rows.length > 0) {
                    maxStreak = parseInt(questResult.rows[0].completed_count) || 0;
                }
            }

            // Get all achievement milestones
            const milestones = this.getAchievementMilestones();

            // Mark achievements as achieved based on user's progress
            const userAchievements = milestones.map(milestone => ({
                ...milestone,
                achieved: milestone.days_required === 0 || maxStreak >= milestone.days_required
            }));

            return {
                achievements: userAchievements,
                current_streak: maxStreak
            };

        } catch (error) {
            throw new Error(`Failed to get user achievements: ${error.message}`);
        }
    }

    // Get achievement statistics
    static async getAchievementStats(userId) {
        try {
            const achievements = await this.getUserAchievements(userId);
            const achievedCount = achievements.achievements.filter(a => a.achieved).length;
            const totalCount = achievements.achievements.length;
            
            return {
                achieved_count: achievedCount,
                total_count: totalCount,
                completion_percentage: Math.round((achievedCount / totalCount) * 100),
                current_streak: achievements.current_streak
            };
        } catch (error) {
            throw new Error(`Failed to get achievement stats: ${error.message}`);
        }
    }
}

module.exports = Achievements;
