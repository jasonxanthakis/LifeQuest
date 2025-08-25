window.alert = vi.fn();

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setLevel, setBattleImages, setCharacterStatistics, setupFightButton, loadDungeon, getRequest } from '../dungeon/dungeon.js';

// Mock globals
global.fetch = vi.fn();
global.alert = vi.fn();
global.localStorage = { setItem: vi.fn(), getItem: vi.fn() };
delete window.location;
window.location = { assign: vi.fn() };

class Dungeon {
  constructor(level, hero, enemy) {
    this.level = level;
    this.hero = hero;
    this.enemy = enemy;
  }
}

describe('getRequest', () => {
    beforeEach(() => {
        fetch.mockReset();
        localStorage.getItem.mockReset();
    });

    it('sends GET request with correct data', async () => {
        localStorage.getItem.mockReturnValue('fake-token-123');

        const mockResponse = new Dungeon(1, {}, {});

        fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => mockResponse
        });

        const url = 'http://localhost:3000/dungeon';

        const response = await getRequest(url);
        const json = await response.json();

        expect(fetch).toHaveBeenCalledWith(url, {
            method: 'GET',
            headers: {
                'Authorization': expect.anything(),
                'Content-Type': 'application/json'
            }
        });
        expect(json).toBeInstanceOf(Dungeon);
        expect(json).toEqual(mockResponse);
    });

    it('handles fetch rejection', async () => {
        fetch.mockRejectedValueOnce(new Error('Network failure'));

        await expect(getRequest('url')).rejects.toThrow('Network failure');
    });
});