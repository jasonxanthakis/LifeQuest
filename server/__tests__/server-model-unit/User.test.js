require("dotenv").config();
const {expect, it, describe, beforeAll, afterAll} = require("@jest/globals");
const User = require('../../models/User.js');

jest.mock('../../database/connect.js', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

const db = require("../../database/connect.js");

describe('User model functions', () => {
    beforeEach(() => jest.clearAllMocks());

    afterAll(() => jest.resetAllMocks());

    it('retrieves a user by id', async () => {
        db.query.mockResolvedValueOnce({
            rows: [
                {
                id: 1,
                full_name: 'Eva Smith',
                username: 'EvaSmith',
                password: 'testPassword',
                email: 'test@example.org',
                date_of_birth: '2002-08-29'
                }
            ],
            rowCount: 1
        });

        const foundUser = await User.getOneById(1);

        expect(foundUser).toBeInstanceOf(User);
        expect(foundUser.username).toBe('EvaSmith');
        expect(foundUser.email).toBe('test@example.org');
    });

    it('throws an error if more/less than one row is returned (getOneById)', async () => {
        db.query.mockResolvedValueOnce({
            rows: [],
            rowCount: 0
        });

        await expect(User.getOneById(1))
            .rejects
            .toThrow("Unable to locate user.");
    });

    it('retrieves a user by username', async () => {
        db.query.mockResolvedValueOnce({
            rows: [
                {
                id: 1,
                full_name: 'Eva Smith',
                username: 'EvaSmith',
                password: 'testPassword',
                email: 'test@example.org',
                date_of_birth: '2002-08-29'
                }
            ],
            rowCount: 1
        });

        const foundUser = await User.getOneByUsername('EvaSmith');

        expect(foundUser).toBeInstanceOf(User);
        expect(foundUser.full_name).toBe('Eva Smith');
        expect(foundUser.email).toBe('test@example.org');
    });

    it('throws an error if more/less than one row is returned (getOneByUsername)', async () => {
        db.query.mockResolvedValueOnce({
            rows: [],
            rowCount: 0
        });

        await expect(User.getOneByUsername('examplename'))
            .rejects
            .toThrow("Unable to locate user.");
    });

    it('create a new user', async () => {
        db.query.mockResolvedValueOnce({
            rows: [],
            rowCount: 0
        });
        
        db.query.mockResolvedValueOnce({
            rows: [
                {
                id: 1,
                full_name: 'Eva Smith',
                username: 'EvaSmith',
                password: 'testPassword',
                email: 'test@example.org',
                date_of_birth: '2002-08-29'
                }
            ],
            rowCount: 1
        });

        db.query.mockResolvedValueOnce();

        db.query.mockResolvedValueOnce({
            rows: [
                {
                id: 1,
                full_name: 'Eva Smith',
                username: 'EvaSmith',
                password: 'testPassword',
                email: 'test@example.org',
                date_of_birth: '2002-08-29'
                }
            ],
            rowCount: 1
        });

        const foundUser = await User.create({
            full_name: 'Eva Smith',
            username: 'EvaSmith',
            password: 'testPassword',
            email: 'test@example.org',
            date_of_birth: '2002-08-29'
        });

        expect(foundUser).toBeInstanceOf(User);
        expect(foundUser.full_name).toBe('Eva Smith');
        expect(foundUser.email).toBe('test@example.org');
    });

    it('throws error if duplicate username is created', async () => {
        db.query.mockResolvedValueOnce({
            rows: [
                {
                id: 1,
                full_name: 'Eva Smith',
                username: 'EvaSmith',
                password: 'testPassword',
                email: 'test@example.org',
                date_of_birth: '2002-08-29'
                }
            ],
            rowCount: 1
        });

        await expect(User.create({
            full_name: 'Eva Smith',
            username: 'EvaSmith',
            password: 'testPassword',
            email: 'test@example.org',
            date_of_birth: '2002-08-29'
        }))
            .rejects
            .toThrow("Username already exists. Please choose another one.");
    });

    it('deletes a user by id', async () => {
        db.query.mockResolvedValueOnce({
            rows: [
                {
                id: 1,
                full_name: 'Eva Smith',
                username: 'EvaSmith',
                password: 'testPassword',
                email: 'test@example.org',
                date_of_birth: '2021-08-01'
                }
            ],
            rowCount: 1
        });

        const mockUser = new User({
            id: 1,
            full_name: 'Eva Smith',
            username: 'EvaSmith',
            password: 'testPassword',
            email: 'test@example.org',
            date_of_birth: '2021-08-01'
        });

        const result = await mockUser.destroy();

        expect(result.rows.length).toBe(1);
        expect(result.rows[0].id).toBe(1);
        expect(result.rows[0].username).toBe('EvaSmith');
        expect(result.rows[0].password).toBe('testPassword');
    });

    it('compares password correctly', async () => {
        const mockUser = new User({
            id: 1,
            full_name: 'eva smith',
            username: 'testuser',
            password: '$2b$12$AGyM1n66u6XpTauLSvaJeOek.0XiRnWMPMUApQrxNsAYXaL/8lbRK',
            email: 'example@example.org',
            date_of_birth: '2021-08-01'
        });

        const match = await mockUser.comparePassword('pass');
        expect(match).toBe(true);

        const wrong = await mockUser.comparePassword('wrongPassword');
        expect(wrong).toBe(false);
    });
});