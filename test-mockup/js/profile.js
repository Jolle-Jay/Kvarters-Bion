document.addEventListener('DOMContentLoaded', function () {
  const profileContent = document.getElementById('profile-content');

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const userName = localStorage.getItem('userName') || 'Användare';
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com';



  const profileLoading = document.getElementById('profile-loading');
  profileLoading.remove();

  if (isLoggedIn) {
    profileContent.innerHTML = `
<h2>Min Profil</h2>
<div class="profile-info">
<strong>Namn:</strong>
<p>${userName}</p>
</div>
<div class="profile-info">
<strong>E-post:</strong>
<p>${userEmail}</p>
</div>
<div class="profile-info">
<strong>Biljettyp</strong>
<p>Vuxen</p>
</div>
<div class="profile-info-drop">
<strong>Historik</strong>
<p>Din historik</p>
</div>
<div class="profile-info-drop">
<strong>Avbokningar</strong>
<p>Dina avbokningar</p>
</div>
<div class="profile-actions">
<a href="index.html" class="btn btn-secondary">Tillbaka till hem</a>
<button onclick="logout()" class="btn btn-logout">Logga ut</button>
</div>
`;

    const dropDowns = document.querySelectorAll('.profile-info-drop');

    dropDowns.forEach(function (dropdown) {
      dropdown.addEventListener('click', function () {
        this.classList.toggle('active');
      });
    });
  } else {
    profileContent.innerHTML = `
<div class="not-logged-in">
<h2>Du är inte inloggad</h2>
<p>Vänligen logga in för att se din profil</p>
<div class="profile-actions">
<a href="login.html" class="btn btn-primary">Logga in</a>
<a href="index.html" class="btn btn-secondary">Gå till hem</a>
</div>
</div>
`;
  }

  // Hamburger menu toggle
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.navbar nav');

  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    });
  }
});


function logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  window.location.href = 'index.html';
}


