const {Router} = require("express");
const authenticator = require('../middleware/authenticator.js');

const QuestController = require("../controllers/quest")
const router = Router();

router.get("/main/:user/quests", authenticator, QuestController.getQuests);
router.post("/main/:user/quests", authenticator, QuestController.createQuest);
router.patch("/main/:user/quests/:quest/complete", authenticator, QuestController.completeQuest);
router.patch("/main/:user/quests/:quest", authenticator, QuestController.modifyQuest);
router.delete("/main/:user/quests/:quest", authenticator, QuestController.destroyQuest);

module.exports = router;