const Quest = require("../model/Quest");

const getQuest = async (req, res) => {
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

module.exports = {
    createQuest, getQuest
}
