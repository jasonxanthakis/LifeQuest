// Initialise Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://eoalkkofcmurezvvrzbi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvYWxra29mY211cmV6dnZyemJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTIwNjEsImV4cCI6MjA3MTI2ODA2MX0.CFUsfRhMPNtGqoleNDjTDcb95y7MDGolOgPwXJ6CKEc' 
const supabase = createClient(supabaseUrl, supabaseAnonKey)

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullname = document.getElementById('name').value.trim();
    const username = document.getElementById('username').value.trim();
    const date_of_birth = document.getElementById('dob').value;
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

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

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullname,
            username: username,
            date_of_birth: date_of_birth,
          }
        }
      })

      if (error) {
        alert(error.message || 'Signup failed.');
        console.error('Signup error:', error);
      } else {
        if (data.user && !data.user.email_confirmed_at) {
          alert('Signup successful!');
        } 
        window.location.href = '../login/login.html';
      }
    } catch (err) {
      alert('Signup error occurred.');
      console.error('Signup error:', err);
    }
  });
});
