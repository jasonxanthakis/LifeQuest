const jwt = require('jsonwebtoken');

const authenticator = require('../../middleware/authenticator.js');

jest.mock('jsonwebtoken');

describe('Authenticator middleware', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            headers: {
                authorization: 'valid_token'
            }
        };

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        next = jest.fn();

        process.env.SECRET_TOKEN = 'test_secret';
    });

    it('calls next() if token is valid', () => {
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, {id: 1});
        });

        authenticator(req, res, () => {
            expect(res.status).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
            //done();
        });
    });

    it('Returns 403:Invalid token if token is not valid', () => {
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(new Error('Invalid token'), null);
        });

        authenticator(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ err: 'Invalid token' });
    });

    it('Returns 403:Missing token if token is not found', async () => {
        req.headers.authorization = undefined;

        await authenticator(req, res, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ err: 'Missing token' });
    });
});