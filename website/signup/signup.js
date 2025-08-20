document.addEventListener('DOMContentLoaded', () => {
  const API_URL = 'http://localhost:3000';
  const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullname = document.getElementById('name').value.trim();
    const username = document.getElementById('username').value.trim();
    const date_of_birth = document.getElementById('dob').value;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    console.log(fullname, username, date_of_birth, email, password);

    // Basic validation
    if (!fullname || !username || !email || !password) {
      alert('Please fill in all required fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Password validation
    if (password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }

    const data = {
      fullname: fullname,
      username: username,
      date_of_birth: date_of_birth,
      email: email,
      password: password
    }

    let url = API_URL + '/user/signup';

    const response = await sendPostRequest(url, data);
    const result = await response.json();

    console.log(response.status);

    if (response.status == 201) {
      localStorage.setItem("token", result.token);

      document.getElementById('name').value = '';
      document.getElementById('username').value = '';
      document.getElementById('dob').value = '';
      document.getElementById('email').value = '';
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
