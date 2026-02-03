function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const name = document.getElementById('name').value || email.split('@')[0];

  const errorMsg = document.getElementById('error-message');
  const successMsg = document.getElementById('success-message');

  // Clear messages
  errorMsg.style.display = 'none';
  successMsg.style.display = 'none';

  // Simple validation
  if (!email || !password) {
    errorMsg.textContent = 'Vänligen fyll i e-post och lösenord';
    errorMsg.style.display = 'block';
    return;
  }

  // Validate password length
  if (password.length < 6) {
    errorMsg.textContent = 'Lösenordet måste vara minst 6 tecken';
    errorMsg.style.display = 'block';
    return;
  }

  // Store login info in localStorage
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('userEmail', email);
  localStorage.setItem('userName', name);

  // Show success message
  successMsg.textContent = 'Inloggning lyckades! Omdirigerar...';
  successMsg.style.display = 'block';

  // Redirect to profile after 1.5 seconds
  setTimeout(() => {
    window.location.href = 'profile.html';
  }, 1500);
}
