const request = require("supertest");
const bcrypt = require("bcrypt");

let app;

describe("Server-side: User flow", () => {
    beforeAll(async () => {
        jest.isolateModules(() => {
            jest.doMock("../../../database/connect.js", () => global.db);

            app = require("../../../app.js");
        });
    });
    
    it("should create a user via /user/signup and login via /user/login", async () => {
        // Signup
        const signupRes = await request(app)
        .post("/user/signup")
        .send({
            fullname: "Eva Smith",
            username: "user",
            password: "password",
            email: "test@example.com",
            date_of_birth: "2000-01-01",
        });

        expect(signupRes.status).toBe(201);
        expect(signupRes.body.success).toBe(true);
        expect(signupRes.body.token).toBeDefined();

        // Verify user exists in DB
        const user = await global.db.query("SELECT * FROM users WHERE username = $1", ["user"]);
        expect(user.rowCount).toBe(1);

        // Login
        const loginRes = await request(app)
        .post("/user/login")
        .send({
            username: "user",
            password: "password",
        });

        expect(loginRes.status).toBe(200);
        expect(loginRes.body.success).toBe(true);
        expect(loginRes.body.token).toBeDefined();
    });
});