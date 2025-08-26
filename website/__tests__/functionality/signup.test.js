window.alert = vi.fn();

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendPostRequest, handleSignup  } from '../../signup/signup.js';

// Mock globals
global.fetch = vi.fn();
global.alert = vi.fn();
global.localStorage = { setItem: vi.fn() };
delete window.location;
window.location = { assign: vi.fn() };

describe('sendPostRequest', () => {
    beforeEach(() => {
        fetch.mockReset();
    });

    it('sends POST request with correct data', async () => {
        const mockResponse = { token: 'abc123' };
        fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
        });

        const data = { username: 'user', password: 'pass' };
        const url = 'http://localhost:3000/user/login';

        const response = await sendPostRequest(url, data);
        const json = await response.json();

        expect(fetch).toHaveBeenCalledWith(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
        });
        expect(json).toEqual(mockResponse);
    });

    it('handles fetch rejection', async () => {
        fetch.mockRejectedValueOnce(new Error('Network failure'));

        await expect(sendPostRequest('url', {})).rejects.toThrow('Network failure');
    });
});

describe('Signup form submission', () => {
    let fullnameInput, usernameInput, date_of_birth_Input, emailInput, passwordInput;

    beforeEach(() => {
        vi.resetAllMocks();

        // Setup DOM
        document.body.innerHTML = `
        <form>
            <div class="mb-3 text-start">
                <label for="name" class="form-label text-black">Full Name</label>
                <input type="text" class="form-control" id="name" placeholder="Enter full name">
            </div>

            <div class="mb-3 text-start">
                <label for="username" class="form-label text-black">Username</label>
                <input type="text" class="form-control" id="username" placeholder="Choose a username">
            </div>

            <div class="mb-3 text-start">
                <label for="dob" class="form-label text-black">Date of Birth</label>
                <input type="date" class="form-control" id="dob">
            </div>

            <div class="mb-3 text-start">
                <label for="email" class="form-label text-black">Email</label>
                <input type="email" class="form-control" id="email" placeholder="Enter email">
            </div>

            <div class="mb-3 text-start">
                <label for="password" class="form-label text-black">Password</label>
                <input type="password" class="form-control" id="password" placeholder="Enter password">
            </div>

            <button type="submit" class="btn signup-btn w-100 mb-3">Sign Up</button>
        </form>
        `;

        fullnameInput = document.getElementById('name');
        usernameInput = document.getElementById('username');
        date_of_birth_Input = document.getElementById('dob');
        emailInput = document.getElementById('email');
        passwordInput = document.getElementById('password');
    });

    afterEach(() => {
        // Reset mock calls between tests
        vi.clearAllMocks();
    });

    it('alerts if fields are empty', async () => {
        fullnameInput.value = '';
        usernameInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';

        await handleSignup(fullnameInput, usernameInput, date_of_birth_Input, emailInput, passwordInput);

        expect(alert).toHaveBeenCalledWith('Please fill in all required fields.');
    });

    it('alerts if email is invalid', async () => {
        fullnameInput.value = 'Eva Smith';
        usernameInput.value = 'user';
        date_of_birth_Input.value = "2000-01-01";
        emailInput.value = 'invalid email';
        passwordInput.value = 'password';

        await handleSignup(fullnameInput, usernameInput, date_of_birth_Input, emailInput, passwordInput);

        expect(alert).toHaveBeenCalledWith('Please enter a valid email address.');
    });

    it('alerts if password is invalid', async () => {
        fullnameInput.value = 'Eva Smith';
        usernameInput.value = 'user';
        date_of_birth_Input.value = "2000-01-01";
        emailInput.value = 'test@example.org';
        passwordInput.value = 'pass';

        await handleSignup(fullnameInput, usernameInput, date_of_birth_Input, emailInput, passwordInput);

        expect(alert).toHaveBeenCalledWith('Password must be at least 6 characters long.');
    });

    it('should handle successful signup', async () => {
        fullnameInput.value = 'Eva Smith';
        usernameInput.value = 'user';
        date_of_birth_Input.value = "2000-01-01";
        emailInput.value = 'test@example.org';
        passwordInput.value = 'password';

        fetch.mockResolvedValueOnce({
            ok: false,
            status: 201,
            json: async () => ({ token: 'abc123', error: '' })
        });

        await handleSignup(fullnameInput, usernameInput, date_of_birth_Input, emailInput, passwordInput);

        expect(fetch).toHaveBeenCalledWith('http://localhost:3000/user/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullname: 'Eva Smith', username: 'user', date_of_birth: "2000-01-01", email: 'test@example.org', password: 'password' }),
        });
        expect(localStorage.setItem).toHaveBeenCalledWith('token', 'abc123');
        expect(fullnameInput.value).toBe('');
        expect(usernameInput.value).toBe('');
        expect(date_of_birth_Input.value).toBe('');
        expect(emailInput.value).toBe('');
        expect(passwordInput.value).toBe('');
        expect(window.location.assign).toHaveBeenCalledWith('../quests/quests-board/quests.html');
        expect(alert).not.toHaveBeenCalled();
    });

    it('should alert if login fails', async () => {
        fullnameInput.value = 'Eva Smith';
        usernameInput.value = 'user';
        date_of_birth_Input.value = "2000-01-01";
        emailInput.value = 'test@example.org';
        passwordInput.value = 'password';

        fetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({ error: 'Username already exists' })
        });

        await handleSignup(fullnameInput, usernameInput, date_of_birth_Input, emailInput, passwordInput);

        expect(alert).toHaveBeenCalledWith('Username already exists');
        expect(localStorage.setItem).not.toHaveBeenCalled();
        expect(window.location.assign).not.toHaveBeenCalled();
      });

    it('throws on network error', async () => {
        fullnameInput.value = 'Eva Smith';
        usernameInput.value = 'user';
        date_of_birth_Input.value = "2000-01-01";
        emailInput.value = 'test@example.org';
        passwordInput.value = 'password';

        fetch.mockRejectedValueOnce(new Error('Network failure'));

        await expect(
            handleSignup(fullnameInput, usernameInput, date_of_birth_Input, emailInput, passwordInput)
        ).rejects.toThrow('Network failure');
    });
});