const {createUser, logUserIn} = require('../../controllers/user.js')
const User = require('../../models/User.js');

jest.mock('bcrypt');
const bcrypt = require('bcrypt');

jest.mock('jsonwebtoken');
const jwt = require('jsonwebtoken');

const mockSend = jest.fn()
const mockJson = jest.fn()
const mockEnd = jest.fn()

const mockStatus = jest.fn(() => ({ 
    send: mockSend, 
    json: mockJson, 
    end: mockEnd 
}));

const mockRes = { status: mockStatus };

jest.mock('../../database/connect.js', () => ({
    query: jest.fn(),
    end: jest.fn()
}));

describe('User Controller', () => {
    beforeEach(() => jest.clearAllMocks());

    afterAll(() => jest.resetAllMocks());

    describe('Create New User', () => {
        let mockReq;

        beforeEach(() => {
            mockReq = {
                body: {
                    fullname: 'eva smith',
                    username: 'testuser',
                    date_of_birth: '2021-08-01',
                    email: 'example@example.org',
                    password: 'pass'
                }
            };
        });

        it('should return a webtoken with status code 201', async () => {
            const mockUser = {
                fullname: 'eva smith',
                username: 'testuser',
                date_of_birth: '2021-08-01',
                email: 'example@example.org',
                hashedPassword: '$2b$12$AGyM1n66u6XpTauLSvaJeOek.0XiRnWMPMUApQrxNsAYXaL/8lbRK'
            };

            bcrypt.hash.mockResolvedValue('$2b$12$AGyM1n66u6XpTauLSvaJeOek.0XiRnWMPMUApQrxNsAYXaL/8lbRK');

            jest.spyOn(User, 'create').mockResolvedValue(mockUser);

            jwt.sign.mockImplementation((payload, secret, options, callback) => {
                callback(null, 'fake.jwt.token');
            });

            await createUser(mockReq, mockRes);

            expect(User.create).toHaveBeenCalledWith({
                fullname: 'eva smith',
                username: 'testuser',
                date_of_birth: '2021-08-01',
                email: 'example@example.org',
                hashedPassword: '$2b$12$AGyM1n66u6XpTauLSvaJeOek.0XiRnWMPMUApQrxNsAYXaL/8lbRK'
            });

            expect(jwt.sign).toHaveBeenCalledWith(
                { username: 'testuser' },
                process.env.SECRET_TOKEN,
                { expiresIn: 3600 },
                expect.any(Function)
            );

            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                token: 'fake.jwt.token',
            });
        });

        it('should throw an error if token fails to generate', async () => {
            const mockUser = {
                fullname: 'eva smith',
                username: 'testuser',
                date_of_birth: '2021-08-01',
                email: 'example@example.org',
                hashedPassword: '$2b$12$AGyM1n66u6XpTauLSvaJeOek.0XiRnWMPMUApQrxNsAYXaL/8lbRK'
            };

            bcrypt.hash.mockResolvedValue('$2b$12$AGyM1n66u6XpTauLSvaJeOek.0XiRnWMPMUApQrxNsAYXaL/8lbRK');

            jest.spyOn(User, 'create').mockResolvedValue(mockUser);

            jwt.sign.mockImplementation((payload, secret, options, callback) => {
                callback(new Error('failed to generate token'), null);
            });

            await createUser(mockReq, mockRes);

            expect(User.create).toHaveBeenCalledWith({
                fullname: 'eva smith',
                username: 'testuser',
                date_of_birth: '2021-08-01',
                email: 'example@example.org',
                hashedPassword: '$2b$12$AGyM1n66u6XpTauLSvaJeOek.0XiRnWMPMUApQrxNsAYXaL/8lbRK'
            });

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Error in token generation' });
        });

        it('should return an error if something went wrong', async () => {
            jest.spyOn(User, 'create').mockRejectedValue(new Error('oh no'));
            
            await createUser(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'oh no' });
        });
        
    });

    describe('Log Existing User In', () => {
        let mockReq;

        beforeEach(() => {
            mockReq = {
                body: {
                    username: 'testuser',
                    password: 'pass'
                }
            };
        });

        it('should return a webtoken with status code 200', async () => {
            const mockUser = new User({
                id: 1,
                full_name: 'eva smith',
                username: 'testuser',
                password: '$2b$12$AGyM1n66u6XpTauLSvaJeOek.0XiRnWMPMUApQrxNsAYXaL/8lbRK',
                email: 'example@example.org',
                date_of_birth: '2021-08-01'
            });

            jest.spyOn(User, 'getOneByUsername').mockResolvedValue(mockUser);

            bcrypt.compare.mockResolvedValue(true);

            jest.spyOn(mockUser, 'comparePassword');

            jwt.sign.mockImplementation((payload, secret, options, callback) => {
                callback(null, 'fake.jwt.token');
            });

            await logUserIn(mockReq, mockRes);

            expect(User.getOneByUsername).toHaveBeenCalledWith('testuser');

            expect(mockUser.comparePassword).toHaveBeenCalledWith('pass');

            expect(jwt.sign).toHaveBeenCalledWith(
                { username: 'testuser' },
                process.env.SECRET_TOKEN,
                { expiresIn: 3600 },
                expect.any(Function)
            );

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                token: 'fake.jwt.token',
            });
        });

        it('should throw an error if token fails to generate', async () => {
            const mockUser = new User({
                id: 1,
                full_name: 'eva smith',
                username: 'testuser',
                password: '$2b$12$AGyM1n66u6XpTauLSvaJeOek.0XiRnWMPMUApQrxNsAYXaL/8lbRK',
                email: 'example@example.org',
                date_of_birth: '2021-08-01'
            });

            jest.spyOn(User, 'getOneByUsername').mockResolvedValue(mockUser);

            bcrypt.compare.mockResolvedValue(true);

            jest.spyOn(mockUser, 'comparePassword');

            jwt.sign.mockImplementation((payload, secret, options, callback) => {
                callback(new Error('failed to generate token'), null);
            });

            await logUserIn(mockReq, mockRes);

            expect(User.getOneByUsername).toHaveBeenCalledWith('testuser');

            expect(mockUser.comparePassword).toHaveBeenCalledWith('pass');

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Error in token generation' });
        });

        it('should throw an error if authentication failed', async () => {
            const mockUser = new User({
                id: 1,
                full_name: 'eva smith',
                username: 'testuser',
                password: '$2b$12$AGyM1n66u6XpTauLSvaJeOek.0XiRnWMPMUApQrxNsAYXaL/8lbRK',
                email: 'example@example.org',
                date_of_birth: '2021-08-01'
            });

            jest.spyOn(User, 'getOneByUsername').mockResolvedValueOnce(mockUser);

            bcrypt.compare.mockResolvedValueOnce(false);

            jest.spyOn(mockUser, 'comparePassword');

            await logUserIn(mockReq, mockRes);

            expect(User.getOneByUsername).toHaveBeenCalledWith('testuser');

            expect(mockUser.comparePassword).toHaveBeenCalledWith('pass');

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'User could not be authenticated' });
        });

        it('should return an error if something went wrong', async () => {
            jest.spyOn(User, 'getOneByUsername').mockRejectedValue(new Error('oh no'));
            
            await logUserIn(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'oh no' });
        });
    });
});

