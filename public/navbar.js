document.addEventListener("DOMContentLoaded", () => {
  const navbarDiv = document.getElementById("navbar");

  if (navbarDiv) {
    fetch('/navbar.html')
      .then(res => res.text())
      .then(html => {
        navbarDiv.innerHTML = html;

        // Attach Logout button event after navbar is loaded
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
          logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            window.location.href = "/login.html";
          });
        }
      })
      .catch(err => console.error("Failed to load navbar:", err));
  }
});
