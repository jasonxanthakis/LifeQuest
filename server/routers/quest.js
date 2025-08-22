const {Router} = require("express");
const authenticator = require('../middleware/authenticator.js');

const QuestController = require("../controllers/quest")
const router = Router();

router.get("/quests", authenticator, QuestController.getQuests);
router.post("/quests", authenticator, QuestController.createQuest);
router.patch("/quests/:quest/complete", authenticator, QuestController.completeQuest);
router.patch("/quests/:quest", authenticator, QuestController.modifyQuest);
router.delete("/quests/:quest", authenticator, QuestController.destroyQuest);

module.exports = router;