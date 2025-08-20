const fs = require('fs');
jest.mock('fs');

jest.mock('../../database/connect.js', () => ({
  query: jest.fn(),
  end: jest.fn()
}));

const db = require("../../database/connect.js");
const setUpDatabase = require('../../database/setup.js');

describe('Set up the database', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        fs.readFileSync.mockReturnValue('CREATE TABLE test;');
        db.query.mockResolvedValue({});
    });

    it('Sets up and seeds the database', async () => {
        await setUpDatabase();

        expect(fs.readFileSync).toHaveBeenCalledWith("./database/database.sql");
        expect(db.query).toHaveBeenCalledWith('CREATE TABLE test;');
        expect(db.end).toHaveBeenCalled();
    });

    it('Logs error if any of the queries fail', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        fs.readFileSync.mockReturnValue('BAD SQL');
        db.query.mockRejectedValue(new Error('Query failed'));

        await setUpDatabase();

        expect(consoleSpy).toHaveBeenCalledWith(expect.any(Error));
        consoleSpy.mockRestore();
    });
});