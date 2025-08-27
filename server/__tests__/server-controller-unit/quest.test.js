    // __tests__/server-controller-unit/quest.test.js
    const { expect, it, describe, beforeEach, afterAll } = require("@jest/globals");
    const questController = require('../../controllers/quest.js');
    const Quest = require('../../models/quest.js');

    // Mock Express response
    const mockJson = jest.fn();
    const mockStatus = jest.fn(() => ({ json: mockJson }));
    const mockRes = { status: mockStatus };

    // Mock the Quest model
    jest.mock('../../models/quest.js', () => ({
    create: jest.fn(),
    getByUserId: jest.fn(),
    getByUserAndQuest: jest.fn(),
    }));

    describe("Quest Controller", () => {
    let req;

    beforeEach(() => {
        jest.clearAllMocks();
        req = { user: { id: 42 }, body: {}, params: {} };
    });

    afterAll(() => jest.resetAllMocks());

    describe("getQuests", () => {
        it("returns quests for a user", async () => {
        const mockQuests = [{ id: 1, title: "Test Quest" }];
        Quest.getByUserId.mockResolvedValue(mockQuests);

        await questController.getQuests(req, mockRes);

        expect(Quest.getByUserId).toHaveBeenCalledWith(42);
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith(mockQuests);
        });

        it("handles errors", async () => {
        Quest.getByUserId.mockRejectedValue(new Error("DB Error"));

        await questController.getQuests(req, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({ error: "DB Error" });
        });
    });

    describe("createQuest", () => {
        it("creates a quest successfully", async () => {
        req.body = { title: "New Quest", description: "Desc", category: "Cat" };

        Quest.getByUserId.mockResolvedValue([]);

        const createdQuest = {
            id: 1,
            user_id: 42,
            title: "New Quest",
            description: "Desc",
            category: "Cat",
            points: 3,
            completed: 0
        };
        Quest.create.mockResolvedValue(createdQuest);

        await questController.createQuest(req, mockRes);
        expect(Quest.getByUserId).toHaveBeenCalledWith(42);
        expect(Quest.create).toHaveBeenCalledWith({
            user_id: 42,
            title: "New Quest",
            description: "Desc",
            category: "Cat",
            points: 3,
            completed: 0
        });
        expect(mockStatus).toHaveBeenCalledWith(201);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ title: "New Quest" }));
        });

        it("returns 400 if quest title already exists", async () => {
        req.body = { title: "Existing Quest", description: "Desc", category: "Cat" };
        Quest.getByUserId.mockResolvedValue([{ title: "Existing Quest" }]);

        await questController.createQuest(req, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({ error: "A quest with this title already exists." });
        });

        it("returns 400 for missing title", async () => {
        req.body = { description: "Desc", category: "Cat" };
        Quest.getByUserId.mockResolvedValue([]);

        await questController.createQuest(req, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({ error: "Quest title is required." });
        });

        it("handles Quest.create errors", async () => {
        req.body = { title: "New Quest", description: "Desc", category: "Cat" };
        Quest.getByUserId.mockResolvedValue([]);
        Quest.create.mockRejectedValue(new Error("Failed"));

        await questController.createQuest(req, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({ message: "Failed to create Quest" });
        });
    });

    describe("modifyQuest", () => {
        it("modifies quest successfully", async () => {
        req.params.quest = 1;
        req.body = { title: "Updated", description: "Desc", category: "Cat" };

        const mockQuest = { id: 1, user_id: 42, title: "Old", description: "Old", category: "Old", modify: jest.fn().mockResolvedValue() };
        Quest.getByUserAndQuest.mockResolvedValue(mockQuest);

        await questController.modifyQuest(req, mockRes);

        expect(mockQuest.modify).toHaveBeenCalledWith({ title: "Updated", description: "Desc", category: "Cat" });
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith(mockQuest);
        });

        it("returns 400 if no changes detected", async () => {
        req.params.quest = 1;
        req.body = { title: "Same", description: "Same", category: "Same" };
        const mockQuest = { id: 1, user_id: 42, title: "Same", description: "Same", category: "Same", modify: jest.fn() };
        Quest.getByUserAndQuest.mockResolvedValue(mockQuest);

        await questController.modifyQuest(req, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({ error: "No changes detected. Please modify at least one field." });
        });

        it("handles modify errors", async () => {
        req.params.quest = 1;
        req.body = { title: "New", description: "Desc", category: "Cat" };
        const mockQuest = { id: 1, user_id: 42, title: "Old", description: "Old", category: "Old", modify: jest.fn().mockRejectedValue(new Error("Fail")) };
        Quest.getByUserAndQuest.mockResolvedValue(mockQuest);

        await questController.modifyQuest(req, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({ error: "Fail" });
        });
    });

    describe("completeQuest", () => {
        it("marks quest as completed", async () => {
        req.params.quest = 1;
        const mockQuest = { id: 1, user_id: 42, quest_completed: jest.fn().mockResolvedValue({ id: 1 }) };
        Quest.getByUserAndQuest.mockResolvedValue(mockQuest);

        await questController.completeQuest(req, mockRes);

        expect(mockQuest.quest_completed).toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
        });

        it("handles errors", async () => {
        req.params.quest = 1;
        Quest.getByUserAndQuest.mockRejectedValue(new Error("Fail"));

        await questController.completeQuest(req, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({ error: "Fail" });
        });
    });

    describe("destroyQuest", () => {
        it("deletes quest successfully", async () => {
        req.params.quest = 1;
        const mockQuest = { id: 1, user_id: 42, destroy: jest.fn().mockResolvedValue({ id: 1 }) };
        Quest.getByUserAndQuest.mockResolvedValue(mockQuest);

        await questController.destroyQuest(req, mockRes);

        expect(mockQuest.destroy).toHaveBeenCalled();
        expect(mockStatus).toHaveBeenCalledWith(200);
        expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
        });

        it("handles errors", async () => {
        req.params.quest = 1;
        Quest.getByUserAndQuest.mockRejectedValue(new Error("Fail"));

        await questController.destroyQuest(req, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({ error: "Fail" });
        });
    });
    });
