require("dotenv").config();
const {expect, it, describe, beforeAll, afterAll} = require("@jest/globals");
const User = require('../../models/User.js');

describe('user database functions', () => {
    let testUser;
    beforeAll(async () => {
        testUser = await User.create({
            full_name: 'Eva Smith',
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
        const foundUser = await User.getOneByUsername('EvaSmith');
        expect(foundUser).toBeInstanceOf(User);
        expect(foundUser.full_name).toBe('Eva Smith');
    });

    it('throws error if duplicate username is created', async () => {
            await expect (User.create({
                full_name: 'Eva Smith',
                username: 'EvaSmith',
                password: 'testPassword2',
                email: 'email2',
                date_of_birth: '2002-08-30'
            })).rejects.toThrow()
        })

    afterAll(async ()=>{
        await testUser.destroy();
    });
    

    /* it('compares password correctly', async () => {
        const match = await testUser.comparePassword('testPassword');
        expect(match).toBe(true);

        const wrong = await testUser.comparePassword('wrongPassword');
        expect(wrong).toBe(false);
    });*/
});