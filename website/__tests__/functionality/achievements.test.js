import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadAchievements, displayAchievements, setupLogout, getRequest } from '../../quests/achievements/achievements.js';

// Mock globals
global.fetch = vi.fn();
global.console = { error: vi.fn(), log: vi.fn() };
global.localStorage = { 
  setItem: vi.fn(), 
  getItem: vi.fn(),
  removeItem: vi.fn() 
};

// Mock window.location
delete window.location;
window.location = { assign: vi.fn() };

// Mock DOM
global.document = {
  querySelector: vi.fn(),
  getElementsByClassName: vi.fn()
};

describe('getRequest', () => {
  beforeEach(() => {
    fetch.mockReset();
    localStorage.getItem.mockReset();
  });

  it('sends GET request with correct data', async () => {
    localStorage.getItem.mockReturnValue('fake-token-123');

    const mockResponse = {
      achievements: [
        { id: 0, name: "Starting Your Journey", achieved: true }
      ],
      current_streak: 0
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse
    });

    const url = 'http://localhost:3000/main/achievements';

    const response = await getRequest(url);
    const json = await response.json();

    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'GET',
      headers: {
        'Authorization': 'fake-token-123',
        'Content-Type': 'application/json'
      }
    });
    expect(json).toEqual(mockResponse);
  });

  it('handles fetch rejection', async () => {
    fetch.mockRejectedValueOnce(new Error('Network failure'));

    await expect(getRequest('url')).rejects.toThrow('Network failure');
  });
});

describe('loadAchievements', () => {
  beforeEach(() => {
    fetch.mockReset();
    console.error.mockReset();
    
    const mockContent = { innerHTML: '' };
    document.querySelector.mockReturnValue(mockContent);
  });

  it('loads achievements successfully', async () => {
    const mockResponse = {
      achievements: [
        { id: 0, name: "Starting Your Journey", achieved: true }
      ],
      current_streak: 0
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    });

    await loadAchievements();

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/main/achievements', {
      method: 'GET',
      headers: {
        'Authorization': undefined, // localStorage.getItem returns undefined in test
        'Content-Type': 'application/json'
      }
    });
    expect(document.querySelector).toHaveBeenCalledWith('main.content');
  });

  it('handles API error response', async () => {
    const errorResponse = {
      error: 'Failed to get achievements'
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => errorResponse
    });

    await loadAchievements();

    expect(console.error).toHaveBeenCalledWith('Failed to load achievements:', 'Failed to get achievements');
  });

  it('handles network error', async () => {
    const networkError = new Error('Network error');
    fetch.mockRejectedValueOnce(networkError);

    await loadAchievements();

    expect(console.error).toHaveBeenCalledWith('Failed to load achievements:', networkError);
  });
});

describe('setupLogout', () => {
  it('sets up logout button event listeners', () => {
    const mockButton = {
      addEventListener: vi.fn()
    };

    document.getElementsByClassName.mockReturnValue([mockButton]);

    setupLogout();

    expect(document.getElementsByClassName).toHaveBeenCalledWith('logout');
    expect(mockButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
  });

  it('logout function clears localStorage and redirects', () => {
    const mockButton = {
      addEventListener: vi.fn()
    };

    document.getElementsByClassName.mockReturnValue([mockButton]);

    setupLogout();

    // Get the click handler and call it
    const clickHandler = mockButton.addEventListener.mock.calls[0][1];
    clickHandler();

    expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    expect(window.location.assign).toHaveBeenCalledWith('../../login/login.html');
  });
});
