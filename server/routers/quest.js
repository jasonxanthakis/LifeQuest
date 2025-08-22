const {Router} = require("express");
const authenticator = require('../middleware/authenticator.js');

const QuestController = require("../controllers/quest")
const AchievementsController = require("../controllers/achievements")
const router = Router();

router.get("/main/:user/quests", authenticator, QuestController.getQuests);
router.post("/main/:user/quests", authenticator, QuestController.createQuest);
router.patch("/main/:user/quests/:quest/complete", authenticator, QuestController.completeQuest);
router.patch("/main/:user/quests/:quest", authenticator, QuestController.modifyQuest);
router.delete("/main/:user/quests/:quest", authenticator, QuestController.destroyQuest);

// Achievements endpoint
router.get("/main/:user/achievements", authenticator, AchievementsController.getUserAchievements);

module.exports = router;