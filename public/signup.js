document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;
  const message = document.getElementById("message");

  try {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
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
