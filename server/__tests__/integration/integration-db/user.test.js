const bcrypt = require("bcrypt");
const { GenericContainer } = require("testcontainers");
const { Pool } = require("pg");

const { expect, beforeAll } = require("@jest/globals");

let User;

describe("User model integration", () => {
    let mockUser;

    beforeAll(async () => {
        jest.isolateModules(() => {
            jest.doMock("../../../database/connect.js", () => global.db);

            User = require("../../../models/User.js");
        });
    });

    it("should create a new user and hero", async () => {
        const data = {
            fullname: "Eva Smith",
            username: "user",
            hashedPassword: await bcrypt.hash("password", 12),
            email: "test@example.org",
            date_of_birth: "2000-01-01",
        }

        mockUser = await User.create(data);

        expect(mockUser.username).toBe('user');
        expect(mockUser.email).toBe('test@example.org');

        const users = await global.db.query("SELECT * FROM users WHERE username = $1", [mockUser.username]);
        expect(users.rowCount).toBe(1);

        const heroes = await global.db.query("SELECT * FROM hero WHERE user_id = $1", [mockUser.id]);
        expect(heroes.rowCount).toBe(1);
        expect(heroes.rows[0].hero_name).toBe('user');
        expect(heroes.rows[0].total_points).toBe(0);
    });

    it("should fetch a user by username", async () => {
        const data = {
            fullname: "Eva Smith",
            username: "user",
            hashedPassword: await bcrypt.hash("password", 12),
            email: "test@example.org",
            date_of_birth: "2000-01-01",
        }

        mockUser = await User.create(data);

        const user = await User.getOneByUsername("user");
        expect(user.username).toBe(mockUser.username);
    });

    it("should compare passwords correctly", async () => {
        const data = {
            fullname: "Eva Smith",
            username: "user",
            hashedPassword: await bcrypt.hash("password", 12),
            email: "test@example.org",
            date_of_birth: "2000-01-01",
        }

        mockUser = await User.create(data);

        const user = await User.getOneByUsername("user");
        const correct = await user.comparePassword("password");
        const incorrect = await user.comparePassword("wrong");
        expect(correct).toBe(true);
        expect(incorrect).toBe(false);
    });

    it("should delete the user", async () => {
        const data = {
            fullname: "Eva Smith",
            username: "user",
            hashedPassword: await bcrypt.hash("password", 12),
            email: "test@example.org",
            date_of_birth: "2000-01-01",
        }

        mockUser = await User.create(data);
        
        const user = await User.getOneByUsername("user");
        const del = await user.destroy();
        expect(del.rowCount).toBe(1);
        
        const res = await db.query("SELECT * FROM users WHERE username = $1", ["user"]);
        expect(res.rows.length).toBe(0);
    });
});