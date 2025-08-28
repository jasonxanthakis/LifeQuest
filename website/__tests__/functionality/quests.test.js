import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteQuest, getRequest, sendPatchRequest, sendDeleteRequest } from '../../quests/quests-board/quests.js';

// Mock globals
global.fetch = vi.fn();
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn()
};
global.confirm = vi.fn();
global.alert = vi.fn();
global.console = { error: vi.fn(), log: vi.fn() };

// Mock DOM
const card = { remove: vi.fn() };
global.card = card;

describe('getRequest', () => {
  beforeEach(() => {
    fetch.mockReset();
    localStorage.getItem.mockReset();
  });

  it('sends GET request with correct headers', async () => {
    localStorage.getItem.mockReturnValue('token123');
    fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });

    const url = 'http://localhost:3000/main/quests';
    const resp = await getRequest(url);

    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'GET',
      headers: {
        'Authorization': 'token123',
        'Content-Type': 'application/json'
      }
    });
    expect(resp.status).toBe(200);
  });
});

describe('sendPatchRequest', () => {
  beforeEach(() => {
    fetch.mockReset();
    localStorage.getItem.mockReset();
  });

  it('sends PATCH request with correct headers and body', async () => {
    localStorage.getItem.mockReturnValue('token456');
    fetch.mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });

    const url = 'http://localhost:3000/main/quests/1/';
    const data = { title: 'Test', description: 'Desc', category: 'Cat' };
    const resp = await sendPatchRequest(url, data);

    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'PATCH',
      headers: {
        'Authorization': 'token456',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    expect(resp.status).toBe(200);
  });
});

describe('sendDeleteRequest', () => {
  beforeEach(() => {
    fetch.mockReset();
    localStorage.getItem.mockReset();
  });

  it('sends DELETE request with correct headers', async () => {
    localStorage.getItem.mockReturnValue('token789');
    fetch.mockResolvedValueOnce({ ok: true, status: 200 });

    const url = 'http://localhost:3000/main/quests/1/';
    const resp = await sendDeleteRequest(url);

    expect(fetch).toHaveBeenCalledWith(url, {
      method: 'DELETE',
      headers: {
        'Authorization': 'token789',
        'Content-Type': 'application/json'
      }
    });
    expect(resp.status).toBe(200);
  });
});

describe('deleteQuest', () => {
  beforeEach(() => {
    fetch.mockReset();
    confirm.mockReset();
    alert.mockReset();
    card.remove.mockReset();
  });

  it('removes card on successful delete', async () => {
    confirm.mockReturnValue(true);
    fetch.mockResolvedValueOnce({ status: 200 });

    await deleteQuest(1);

    expect(card.remove).toHaveBeenCalled();
    expect(alert).not.toHaveBeenCalled();
  });

  it('alerts on failed delete', async () => {
    confirm.mockReturnValue(true);
    fetch.mockResolvedValueOnce({ status: 500 });

    await deleteQuest(1);

    expect(card.remove).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith('Failed to delete the quest.');
  });

  it('does nothing if not confirmed', async () => {
    confirm.mockReturnValue(false);

    await deleteQuest(1);

    expect(card.remove).not.toHaveBeenCalled();
    expect(alert).not.toHaveBeenCalled();
  });
});