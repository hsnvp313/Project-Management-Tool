document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim(); // 👈 Added name
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;
  const message = document.getElementById("message");

  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }) // 👈 Sending name
    });

    const data = await res.json();

    if (res.ok) {
      message.style.color = "green";
      message.textContent = "✅ Signup successful! Redirecting...";
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } else {
      message.style.color = "red";
      message.textContent = data.error || "Signup failed!";
    }
  } catch (err) {
    message.style.color = "red";
    message.textContent = "⚠️ Network error!";
  }
});
