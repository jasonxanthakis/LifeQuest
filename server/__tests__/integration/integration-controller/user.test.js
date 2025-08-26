const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { expect } = require("@jest/globals");

// Mock res object
function createResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

let UserController;
let User;

describe("User controller integration with user model and DB", () => {
    let res;

    beforeAll(async () => {
        jest.isolateModules(() => {
            jest.mock("jsonwebtoken", () => ({
                sign: jest.fn((payload, secret, options, callback) => callback(null, "fake-token")),
            }));

            jest.doMock("../../../database/connect.js", () => global.db);

            User = require("../../../models/User.js");
            UserController = require("../../../controllers/user.js");
        });

        res = createResMock();
    });

    it("should create a new user and return a token", async () => {
        const req = {
            body: {
                fullname: "Eva Smith",
                username: "user",
                password: "password",
                email: "test@example.com",
                date_of_birth: "2000-01-01",
            },
        };

        // Spy on jwt.sign to avoid real token generation
        const jwtSpy = jest.spyOn(jwt, "sign").mockImplementation((payload, secret, options, callback) => {
            callback(null, "fake-token");
        });

        await UserController.createUser(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            token: "fake-token",
        });

        // Verify user persisted in DB
        const userData = await User.getOneByUsername("user");
        expect(userData.email).toBe("test@example.com");

        // Verify hero was created for this user
        const heroes = await global.db.query("SELECT * FROM hero WHERE user_id = $1", [userData.id]);
        expect(heroes.rowCount).toBe(1);
        expect(heroes.rows[0].hero_name).toBe("user");

        jwtSpy.mockRestore();
    });

    it("should log user in and return a token", async () => {
        // First create a user directly via model
        const hashedPassword = await bcrypt.hash("password", 12);
        await User.create({
            fullname: "Eva Smith",
            username: "user",
            hashedPassword: hashedPassword,
            email: "test@example.com",
            date_of_birth: "2000-01-01",
        });

        const req = {
            body: {
                username: "user",
                password: "password",
            },
        };

        const jwtSpy = jest.spyOn(jwt, "sign").mockImplementation((payload, secret, options, callback) => {
            callback(null, "fake-token");
        });

        await UserController.logUserIn(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            token: "fake-token",
        });

        jwtSpy.mockRestore();
    });
});