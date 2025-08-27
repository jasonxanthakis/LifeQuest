const Quest = require("../models/Quest");
const Hero = require('../models/Hero')

const getQuests = async (req, res) => {

    try {
        const username = req.user;
        const userId = await Quest.getUserIdByUsername(username);
        const quests =  await Quest.getByUserId(userId)
        const hero = await Hero.getByUserId(userId)

        res.status(200).json({quests, hero})
    } catch (err) {
        res.status(500).json({error: err.message})
    };
};


const createQuest = async (req, res) => {
    const username = req.user;
    const { title, description, category } = req.body;

    const userId = await Quest.getUserIdByUsername(username);

    // check if quest already exists
    const exisitingQuests = await Quest.getByUserId(userId);
    if (exisitingQuests.some(q => q.title === title)) {
        return res.status(400).json({error: "A quest with this title already exists."});
    }

    // check user has entered value for title
    if (!title || title.trim() === '') {
        return res.status(400).json({error: "Quest title is required."});
    }

    // check user has entered value for description
    if (!description || description.trim() === '') {
        return res.status(400).json({error: 'Quest description is required'});
    }

    // check user has selected a category
    // I have included trim eventhough categories are predetermined as future feature may include 'other' cateory selection in which user can input their own category
    if (!category || category.trim() === '') {
        return res.status(400).json({error: 'Must select a quest category'})
    }
    // 

    try {
        const newQuest = await Quest.create({
            user_id: userId,
            title,
            description,
            category,
            points_value: 3,
            completed: 0
        });

        return res.status(201).json(newQuest);

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: 'Failed to create Quest'
        });
    };
};

const modifyQuest = async (req, res) => {
    const username = req.user;
    const userId = await Quest.getUserIdByUsername(username);

    const questId = req.params.quest
    const { title, description, category } = req.body;

    // modification has to be different from original

    const quest = await Quest.getByUserAndQuest(userId, questId)

    if (title === quest.title && description === quest.description && category === quest.category) {
        return res.status(400).json({error: 'No changes detected. Please modify at least one field.'});
    }

    try {
        const modifiedQuest = await Quest.getByUserAndQuest(userId, questId);
        
        await modifiedQuest.modify({
            title,
            description,
            category
        });

        return res.status(200).json(modifiedQuest);
    } catch (err) {
        return res.status(400).json({error: err.message});
    };
};

const setQuestComplete = async (req, res) => {
    const username = req.user;
    const questId = req.params.quest
    const userId = await Quest.getUserIdByUsername(username);
    const { completed } = req.body;

    console.log("Patch body:", req.body);
    try {

        if (typeof completed != 'boolean') {
        return res.status(400).json({error: 'completed must be a boolean'});
        }

        const completedQuest = await Quest.getByUserAndQuest(userId, questId);
        await completedQuest.setCompleted(completed);

        // calculate new total_points - sum of all quest points for this user
        const allQuests = await Quest.getByUserId(userId);
        const totalPoints = allQuests
            .filter(q => q.completed)
            .reduce((sum, q) => sum + q.points, 0)

        const updatedHero = await Hero.updateTotalPoints(userId, totalPoints);

        // return quest and Hero in response

        return res.status(200).json({
            completedQuest,
            hero: updatedHero
        });
    } catch (err) {
        res.status(400).json({error: err.message})
    }
}


const destroyQuest = async (req, res) => {
    const username = req.user;
    const questId = req.params.quest

    try {
        const userId = await Quest.getUserIdByUsername(username);

        const deletedQuest = await Quest.getByUserAndQuest(userId, questId);
        await deletedQuest.destroy()
        res.status(200).json(deletedQuest)
    } catch (err) {
        res.status(400).json({error: err.message})
    }
}


module.exports = {
    createQuest, getQuests, modifyQuest, setQuestComplete, destroyQuest
}
