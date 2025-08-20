// Initialise Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://eoalkkofcmurezvvrzbi.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvYWxra29mY211cmV6dnZyemJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2OTIwNjEsImV4cCI6MjA3MTI2ODA2MX0.CFUsfRhMPNtGqoleNDjTDcb95y7MDGolOgPwXJ6CKEc'
const supabase = createClient(supabaseUrl, supabaseAnonKey)

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('username').value.trim(); 
    const password = document.getElementById('password').value.trim();

    // Basic validation
    if (!email || !password) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      })

      if (error) {
        alert(error.message || 'Login failed.');
        console.error('Login error:', error);
      } else {
        alert('Login successful!');
        window.location.href = '../quests/quests-board/quests.html'; 
      }
    } catch (err) {
      alert('Login error occurred.');
      console.error('Login error:', err);
    }
  });
});
