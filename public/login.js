document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorMsg = document.getElementById("errorMsg");

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorMsg.textContent = data.error || "Login failed";
      errorMsg.classList.remove("hidden");
      return;
    }

    // Save token, role, and userId
localStorage.setItem("token", data.token);
if (data.user) {
  localStorage.setItem("role", data.user.role.toUpperCase());
  localStorage.setItem("userId", data.user.id); // 👈 ADD THIS
}

    // Redirect to dashboard
    window.location.href = "/dashboard.html";

  } catch (err) {
    errorMsg.textContent = "Something went wrong";
    errorMsg.classList.remove("hidden");
  }
});
