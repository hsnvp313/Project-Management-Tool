document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const message = document.getElementById("message");

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      // Save token, role, and userId in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId);

      message.style.color = "green";
      message.textContent = "✅ Login successful! Redirecting...";

      setTimeout(() => {
        window.location.href = "projects.html"; // Redirect to projects page
      }, 1500);
    } else {
      message.style.color = "red";
      message.textContent = data.error || "Invalid credentials!";
    }
  } catch (err) {
    message.style.color = "red";
    message.textContent = "⚠️ Network error!";
  }
});
