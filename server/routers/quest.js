const {Router} = require("express");
const authenticator = require('../middleware/authenticator.js');

const QuestController = require("../controllers/quest.js");
const AchievementsController = require("../controllers/achievements.js");
const MetricsController = require("../controllers/metrics.js")
const router = Router();

router.get("/quests", authenticator, QuestController.getQuests);
router.post("/quests", authenticator, QuestController.createQuest);
router.patch("/quests/:quest/complete", authenticator, QuestController.setQuestComplete);
router.patch("/quests/:quest", authenticator, QuestController.modifyQuest);
router.delete("/quests/:quest", authenticator, QuestController.destroyQuest);

// Achievements endpoint
router.get("/achievements", authenticator, AchievementsController.getUserAchievements);

// Metrics endpoint
router.get("/metrics/quests", authenticator, QuestController.getQuests);
router.get("/metrics/:quest", authenticator, MetricsController.getGraphs);
router.get("/metrics/data/:quest", authenticator, MetricsController.getSummaryStats);

module.exports = router;