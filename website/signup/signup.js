export async function handleSignup(fullnameInput, usernameInput, date_of_birth_Input, emailInput, passwordInput) {
  const API_URL = 'https://lifequest-api.onrender.com';

  const fullname = fullnameInput.value.trim();
  const username = usernameInput.value.trim();
  const date_of_birth = date_of_birth_Input.value;
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

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
};

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
      
      const fullnameInput = document.getElementById('name');
      const usernameInput = document.getElementById('username');
      const date_of_birth_Input = document.getElementById('dob');
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');

      handleSignup(fullnameInput, usernameInput, date_of_birth_Input, emailInput, passwordInput);
    });
  });
}