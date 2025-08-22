document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://lifequest-api.onrender.com';
  const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim(); 
    const password = document.getElementById('password').value.trim();

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

      document.getElementById('username').value = '';
      document.getElementById('password').value = '';

      window.location.assign("../quests/quests-board/quests.html");
    } else {
      alert(result.error);
      return;
    }

  });
});

async function sendPostRequest(url, data) {
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
