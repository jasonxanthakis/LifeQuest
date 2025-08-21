const {Router} = require("express");
const QuestController = require("../controllers/quest")

const router = Router();

router.get("/main/:user/quests", QuestController.getQuest);
router.post("/main/:user/quests", QuestController.createQuest);
router.patch("/main/:user/quests/:quest/complete", QiestController.questCompleted);
router.patch("/main/:user/quests/:quest", QuestController.modifyQuest);
router.delete("/main/:user/quests/:quest", QuestController.destroyQuest);

module.exports = router;