

// const { getAllByText, getByText, fireEvent } = require("@testing-library/dom");
// require("@testing-library/jest-dom");

// const fs = require("fs");
// const path = require("path");

// // Mock window.location.assign
// window.location.assign = jest.fn();

// // Mock localStorage
// const localStorageMock = (() => {
//     let store = {};
//     return {
//         getItem: jest.fn((key) => store[key]),
//         setItem: jest.fn((key, value) => (store[key] = value)),
//         clear: jest.fn(() => (store = {}))
//     };
// })();
// Object.defineProperty(window, "localStorage", { value: localStorageMock });

// // Import script AFTER mocks
// let { sendPostRequest } = require("../login/login.js"); // <- path to your login file

// beforeEach(() => {
//     document.body.innerHTML = `
//     <form>
//         <input id="username" />
//         <input id="password" />
//         <button type="submit">Login</button>
//     </form>
//     `;

//     // jest.isolateModules(() => {
//     //   require("../login/login"); 
//     // });

// });

// describe("Login form", () => {
//     beforeEach(() => {
//         global.fetch = jest.fn(() =>
//             Promise.resolve({
//                 status: 400,
//                 json: () => Promise.resolve({ test: 100 }),
//             }),
//         );

//         document.dispatchEvent(new Event("DOMContentLoaded"));
//     });

//     afterEach(() => {
//         jest.restoreAllMocks();
//     });

    // it("alerts if fields are empty", async () => {
    //     global.alert = jest.fn();

    //     const form = document.querySelector("form");
    //     form.dispatchEvent(new Event("submit"));

    //     expect(global.alert).toHaveBeenCalledWith("Please fill in all fields.");
    // });

//     it("stores token and redirects on success", async () => {
//         // Mock fetch success
//         sendPostRequest = jest.fn(() =>
//             Promise.resolve({
//                 status: 200,
//                 json: () => Promise.resolve({ token: "mock-token" })
//             })
//         );

//         const mockResp = {
//             status: 200,
//             json: jest.fn().mockResolvedValueOnce({ token: "mocked.jwt.token" })
//         };
//         const mockSendPost = jest
//             .spyOn(require("../login/login"), "sendPostRequest")
//             .mockResolvedValueOnce(mockResp);

//         // sendPostRequest.mockResolvedValueOnce({
//         //     status: 200,
//         //     json: jest.fn().mockResolvedValueOnce({
//         //         token: "mocked.jwt.token"
//         //     })
//         // });

//         // Fill inputs
//         document.getElementById("username").value = "testuser";
//         document.getElementById("password").value = "testpass";

//         const form = document.querySelector("form");
//         // form.dispatchEvent(new Event("submit"));

//         // submit the form
//         form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));

//         // allow promises to flush
//         await new Promise(process.nextTick);

//         expect(mockSendPost).toHaveBeenCalledWith(
//             "http://localhost:3000/user/login",
//             { username: "EvaSmith", password: "testPassword" }
//         );
//         expect(localStorage.setItem).toHaveBeenCalledWith("token", "mock-token");
//         expect(window.location.assign).toHaveBeenCalledWith("../quests/quests-board/quests.html");
//     });

    // it("alerts error on failure", async () => {
    //     global.alert = jest.fn();

    //     fetch.mockResolvedValueOnce(Promise.resolve({ok: true, status: 400, json: () => Promise.resolve({ error: "Invalid credentials" })}));

    //     // // Mock fetch failure
    //     // global.fetch = jest.fn(() =>
    //     //     Promise.resolve({
    //     //         status: 401,
    //     //         json: () => Promise.resolve({ error: "Invalid credentials" })
    //     //     })
    //     // );

    //     document.getElementById("username").value = "baduser";
    //     document.getElementById("password").value = "badpass";

    //     const form = document.querySelector("form");
    //     form.dispatchEvent(new Event("submit"));

    //     const data = {
    //         username: 'baduser',
    //         password: 'badpass'
    //     }

    //     expect(fetch).toHaveBeenCalledTimes(1);

    //     expect(fetch).toHaveBeenCalledWith('http://localhost:3000/user/login', {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify(data),
    //     });
        
    //     expect(global.alert).toHaveBeenCalledWith("Invalid credentials");
    // });
// });

// describe("Test HTTP request functions", () => {
//     beforeEach(() => {
//         global.fetch = jest.fn(() =>
//             Promise.resolve({
//                 json: () => Promise.resolve({ test: 100 }),
//             }),
//         );
//     });

//     afterEach(() => {
//         jest.restoreAllMocks();
//     });

    // test('The POST request function is working', async () => {
    //     const mockResponse = { ok: true, status: 200 };
    //     fetch.mockResolvedValueOnce(mockResponse);

    //     const url = "https://example.com/api";
    //     const data = { name: "Alice" };

    //     const resp = await sendPostRequest(url, data);

    //     expect(fetch).toHaveBeenCalledTimes(1);
    //     expect(fetch).toHaveBeenCalledWith(url, {
    //         method: "POST",
    //         headers: { "Content-Type": "application/json" },
    //         body: JSON.stringify(data),
    //     });

    //     expect(resp).toBe(mockResponse);
    // });
// });

// import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
// import { sendPostRequest } from '../login/login.js';

// describe('Test HTTP request functions', () => {

// beforeEach(() => {
//     // Stub global fetch before each test
//     global.fetch = vi.fn(() =>
//     Promise.resolve({
//         ok: true,
//         status: 200,
//         json: () => Promise.resolve({ test: 100 }),
//     })
//     );
// });

// afterEach(() => {
//     // Restore all mocks after each test
//     vi.restoreAllMocks();
//     // clean up DOM
//     document.body.innerHTML = '';
// });

// it('The POST request function is working', async () => {
//     const mockResponse = { ok: true, status: 200 };
    
//     // Override the next call to fetch
//     fetch.mockResolvedValueOnce(mockResponse);

//     const url = 'https://example.com/api';
//     const data = { name: 'Alice' };

//     const resp = await sendPostRequest(url, data);

//     // Check fetch call
//     expect(fetch).toHaveBeenCalledTimes(1);
//     expect(fetch).toHaveBeenCalledWith(url, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(data),
//     });

//     // Check response
//     expect(resp).toBe(mockResponse);
// });

// it('Should handle fetch errors', async () => {
//     // Make fetch reject
//     fetch.mockRejectedValueOnce(new Error('Network error'));

//     const url = 'https://example.com/api';
//     const data = {};

//     await expect(sendPostRequest(url, data)).rejects.toThrow('Network error');
// });

// });

// global.fetch = vi.fn();
// global.alert = vi.fn();
// global.localStorage = {
//     setItem: vi.fn()
// };
// delete window.location;
// window.location = { assign: vi.fn() };

// describe('Login form submission', () => {
//     let form, usernameInput, passwordInput;

//     beforeEach(() => {
//         vi.resetAllMocks(); // reset all mocks before each test

//         // Set up DOM
//         document.body.innerHTML = `
//         <form id="loginForm">
//             <input id="username" />
//             <input id="password" />
//             <button type="submit">Submit</button>
//         </form>
//         `;

//         form = document.querySelector('form');
//         usernameInput = document.getElementById('username');
//         passwordInput = document.getElementById('password');

//         // Copy event listener (from the actual code)
//         form.addEventListener('submit', async (e) => {
//         e.preventDefault();

//         const username = usernameInput.value.trim();
//         const password = passwordInput.value.trim();

//         if (!username || !password) {
//             alert('Please fill in all fields.');
//             return;
//         }

//         const data = { username, password };
//         const url = 'http://localhost:3000/user/login';
//         const response = await sendPostRequest(url, data);
//         const result = await response.json();

//         alert(result.error);

//         if (response.status === 200) {
//             localStorage.setItem('token', result.token);
//             usernameInput.value = '';
//             passwordInput.value = '';
//             window.location.assign('../quests/quests-board/quests.html');
//         } else {
//             alert(result.error);
//             return;
//         }
//         });
//     });

//     it('should handle successful login', async () => {
//         usernameInput.value = 'user';
//         passwordInput.value = 'pass';

//         fetch.mockResolvedValueOnce({
//             ok: true,
//             status: 200,
//             json: async () => ({ token: 'abc123', error: '' })
//         });

//         const event = new Event('submit');
//         Object.defineProperty(event, 'preventDefault', { value: () => {} });
//         form.dispatchEvent(event);

//         // Wait a tick for async code
//         await new Promise((r) => setTimeout(r, 0));

//         expect(fetch).toHaveBeenCalledWith('http://localhost:3000/user/login', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ username: 'user', password: 'pass' })
//         });
//         expect(localStorage.setItem).toHaveBeenCalledWith('token', 'abc123');
//         expect(usernameInput.value).toBe('');
//         expect(passwordInput.value).toBe('');
//         expect(window.location.assign).toHaveBeenCalledWith('../quests/quests-board/quests.html');
//     });

//     it('should alert if login fails', async () => {
//         usernameInput.value = 'user';
//         passwordInput.value = 'wrong';

//         fetch.mockResolvedValueOnce({
//             ok: false,
//             status: 401,
//             json: async () => ({ error: 'Invalid credentials' })
//         });

//         const event = new Event('submit');
//         Object.defineProperty(event, 'preventDefault', { value: () => {} });
//         form.dispatchEvent(event);

//         await new Promise((r) => setTimeout(r, 0));

//         expect(alert).toHaveBeenCalledWith('Invalid credentials');
//         expect(localStorage.setItem).not.toHaveBeenCalled();
//         expect(window.location.assign).not.toHaveBeenCalled();
//     });
// });

window.alert = vi.fn();

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendPostRequest, handleLogin  } from '../../login/login.js';

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

describe('Login form submission', () => {
  let usernameInput, passwordInput;

  beforeEach(() => {
    vi.resetAllMocks();

    // Setup DOM
    document.body.innerHTML = `
      <form>
        <div class="mb-3 text-start">
          <label for="username" class="form-label text-black">Username</label>
          <input type="text" class="form-control" id="username" placeholder="Enter username">
        </div>
        <div class="mb-3 text-start">
          <label for="password" class="form-label text-black">Password</label>
          <input type="password" class="form-control" id="password" placeholder="Enter password">
        </div>
        <button type="submit" class="btn login-btn w-100 mb-3">Login</button>
      </form>
    `;

    usernameInput = document.getElementById('username');
    passwordInput = document.getElementById('password');
  });

  afterEach(() => {
    // Reset mock calls between tests
    vi.clearAllMocks();
  });

  it('alerts if fields are empty', async () => {
    usernameInput.value = '';
    passwordInput.value = '';

    await handleLogin(usernameInput, passwordInput);

    expect(alert).toHaveBeenCalledWith('Please fill in all fields.');
  });

  it('should handle successful login', async () => {
    usernameInput.value = 'user';
    passwordInput.value = 'pass';

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ token: 'abc123', error: '' })
    });

    await handleLogin(usernameInput, passwordInput);

    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'user', password: 'pass' }),
    });
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'abc123');
    expect(usernameInput.value).toBe('');
    expect(passwordInput.value).toBe('');
    expect(window.location.assign).toHaveBeenCalledWith('../quests/quests-board/quests.html');
    expect(alert).not.toHaveBeenCalled();
  });

  it('should alert if login fails', async () => {
    usernameInput.value = 'user';
    passwordInput.value = 'wrong';

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid credentials' })
    });

    await handleLogin(usernameInput, passwordInput);

    expect(alert).toHaveBeenCalledWith('Invalid credentials');
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(window.location.assign).not.toHaveBeenCalled();
  });

  it('throws on network error', async () => {
    usernameInput.value = 'user';
    passwordInput.value = 'pass';

    fetch.mockRejectedValueOnce(new Error('Network failure'));

    await expect(
      handleLogin(usernameInput, passwordInput)
    ).rejects.toThrow('Network failure');
  });
});
