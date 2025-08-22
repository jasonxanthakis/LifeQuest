const logger = require('../../middleware/logger.js');

describe('Logger Middleware', () => {
    const mockReq = {
        method: 'GET',
        hostname: 'localhost',
        path: '/test',
        time: '2025-07-29T16:13:00Z'
    };

    const mockRes = {};
    const mockNext = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    it('should log the method, hostname, path and time', () => {
        logger(mockReq, mockRes, mockNext);

        expect(console.log).toHaveBeenCalledWith(
            mockReq.method,
            mockReq.hostname,
            mockReq.path,
            mockReq.time
        );
    });

    it('should call next()', () => {
        logger(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });
});