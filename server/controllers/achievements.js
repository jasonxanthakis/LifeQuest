const Achievements = require('../models/Achievements.js');
const Hero = require('../models/Hero.js');

// GET /main/:user/achievements
const getUserAchievements = async (req, res) => {
    try {
        const username = req.user;
        
        // Get user ID from username
        const userId = await Hero.getUserIdByUsername(username);
        
        // Get user achievements
        const result = await Achievements.getUserAchievements(userId);
        
        res.status(200).json({
            achievements: result.achievements,
            current_streak: result.current_streak,
            stats: await Achievements.getAchievementStats(userId)
        });
        
    } catch (error) {
        console.error('Error getting user achievements:', error);
        res.status(500).json({ 
            error: 'Failed to get achievements',
            achievements: [],
            current_streak: 0,
            stats: {
                achieved_count: 0,
                total_count: 9,
                completion_percentage: 0,
                current_streak: 0
            }
        });
    }
};

module.exports = {
    getUserAchievements
};
