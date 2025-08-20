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

describe('User Controller', () => {
    beforeEach(() => jest.clearAllMocks())

    afterAll(() => jest.resetAllMocks())

    describe('Create New User', () => {
        let mockReq;

        beforeEach(() => {
            mockReq = {
                body: {
                    fullname: 'eva smith',
                    username: 'testuser',
                    date_of_birth: '',
                    email: 'example@example.org',
                    password: 'testpass'
                }
            };
        })

        it('should return a webtoken with status code 200', async () => {
            const mockUser = {
                username: 'testuser',
                user_id: 1,
            };

            jest.spyOn(User, 'createUser').mockResolvedValue(mockUser);

            jwt.sign.mockImplementation((payload, secret, options, callback) => {
                callback(null, 'fake.jwt.token');
            });

            await createUser(mockReq, mockRes);

            expect(User.createUser).toHaveBeenCalledWith({
                username: 'testuser',
                password: 'testpass',
                is_teacher: false,
                school_name: 'None',
            });

            expect(jwt.sign).toHaveBeenCalledWith(
                { username: 'testuser' },
                process.env.SECRET_TOKEN,
                { expiresIn: 3600 },
                expect.any(Function)
            );

            expect(mockStatus).toHaveBeenCalledWith(200);
                expect(mockJson).toHaveBeenCalledWith({
                success: true,
                userID: 1,
                username: 'testuser',
                token: 'fake.jwt.token',
            });
        });

        it('should return a webtoken with status code 200', async () => {
            const mockUser = {
                username: 'testuser',
                user_id: 1,
            };

            jest.spyOn(User, 'createUser').mockResolvedValue(mockUser);

            jwt.sign.mockImplementation((payload, secret, options, callback) => {
                callback(null, 'fake.jwt.token');
            });

            await createUser(mockReq, mockRes);

            expect(User.createUser).toHaveBeenCalledWith({
                username: 'testuser',
                password: 'testpass',
                is_teacher: false,
                school_name: 'None',
            });

            expect(jwt.sign).toHaveBeenCalledWith(
                { username: 'testuser' },
                process.env.SECRET_TOKEN,
                { expiresIn: 3600 },
                expect.any(Function)
            );

            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                success: true,
                userID: 1,
                username: 'testuser',
                token: 'fake.jwt.token',
            });
        });


        it('should return an error if something went wrong', async () => {
            jest.spyOn(User, 'createUser').mockRejectedValue(new Error('oh no'));
            
            await createUser(mockReq, mockRes);

            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ error: 'oh no' });
        });

        
    });

    describe('Log Existing User In', () => {});
});

