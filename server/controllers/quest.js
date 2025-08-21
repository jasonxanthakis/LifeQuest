const Quest = require("../models/Quest");

const getQuests = async (req, res) => {
    const userId = req.params.user

    try {
        const quests =  await Quest.getByUserId(userId)
        res.status(200).json(quests)
    } catch (err) {
        res.status(500).json({error: err.message})
    };
};


const createQuest = async (req, res) => {
    const userId = req.params.user

    // check user is logged in

    // check if quest already exists

    // check user has entered value for title

    // check user has entered value for description

    // check user has selected a category

    // 

    try {
        const newQuest = await Quest.create({
            user_id: userId,
            title: req.body.title,
            description: req.body.description,
            category: req.body.category,
            points: 3,
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
    const userId = req.params.user
    const questId = req.params.quest

    // check quest exists for user

    // modification has to be different from original

    try {
        const quest = await Quest.getByUserAndQuest(userId, questId);
        
        quest = await Quest.modify({
            title: req.body.title,
            description: req.body.description,
            category: req.body.category
        });

        return res.status(204).json(edit);
    } catch (err) {
        return res.status(400).json({error: err.message});
    };
};

const completeQuest = async (req, res) => {
    const userId = req.params.user
    const questId = req.params.quest

    // Need to work out how this is connecting to the front end:
    // Need to check that toggle has been switched to complete

    try {
        const quest = await Quest.getByUserAndQuest(userId, questId);
        quest.quest_completed()
        res.status(204).json(quest)
        } catch (err) {
            res.status(400).json({error: err.message})
        }
    }


const destroyQuest = async (req, res) => {
    const userId = req.params.user
    const questId = req.params.quest

    try {
        const quest = await Quest.getByUserAndQuest(userId, questId);
        quest.destroy()
        res.status(204).json(quest)
    } catch (err) {
        res.status(400).json({error: err.message})
    }
}


module.exports = {
    createQuest, getQuests, modifyQuest, completeQuest, destroyQuest
}
