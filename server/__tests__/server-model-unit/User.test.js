require("dotenv").config();
const {expect, it, describe, beforeAll, afterAll} = require("@jest/globals");
const User = require("../models/User");

describe('user database functions', () => {
    let testUser;
    beforeAll(async () => {
        testUser = await User.create({
            fullname: 'Eva Smith',
            username: 'EvaSmith',
            password: 'testPassword',
            email: 'email',
            date_of_birth: '2002-08-29'
        });
    });

    it('creates a user and retrieves by id', async () => {
        const foundUser = await User.getOneById(testUser.id);
        expect(foundUser).toBeInstanceOf(User);
        expect(foundUser.username).toBe('EvaSmith');
    });

    it('retrieves a user by username', async () => {
        const foundUser = await User.getOneByUsername('Eva Smith');
        expect(foundUser).toBeInstanceOf(User);
        expect(foundUser.fullname).toBe('Eva Smith');
    });

    it('compares password correctly', async () => {
        const match = await testUser.comparePassword('testPassword');
        expect(match).toBe(true);

        const wrong = await testUser.comparePassword('wrongPassword');
        expect(wrong).toBe(false);
    });
});