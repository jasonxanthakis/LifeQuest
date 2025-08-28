const API_URL = 'http://localhost:3000';

export async function handleLogin(usernameInput, passwordInput) {
  const username = usernameInput.value.trim(); 
  const password = passwordInput.value.trim();

  // Basic validation
  if (!username || !password) {
    alert('Please fill in all fields.');
    return;
  }

  const data = {
    username: username,
    password: password
  }

  let url = API_URL + '/user/login';

  const response = await sendPostRequest(url, data);
  const result = await response.json();

  if (response.status == 200) {
    localStorage.setItem("token", result.token);

    usernameInput.value = '';
    passwordInput.value = '';

    window.location.assign("../quests/quests-board/quests.html");
  } else {
    alert(result.error);
    return;
  }
}

export async function sendPostRequest(url, data) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  }

  const resp = await fetch(url, options);

  return resp;
};

if (typeof window !== undefined) {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const usernameInput = document.getElementById('username');
      const passwordInput = document.getElementById('password');

      handleLogin(usernameInput, passwordInput);
    });
  });
}