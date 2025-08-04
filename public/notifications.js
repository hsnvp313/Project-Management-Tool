async function loadNavbar() {
  const res = await fetch("/navbar.html");
  document.getElementById("navbar").innerHTML = await res.text();
}

async function loadNotifications() {
  const token = localStorage.getItem("token");

  const res = await fetch("/api/tasks/notifications", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const notifications = await res.json();

  const container = document.getElementById("notificationContainer");
  container.innerHTML = "";

  if (notifications.length === 0) {
    container.innerHTML = `
      <div class="p-6 text-center text-gray-500">
        <span class="text-5xl block mb-2">📭</span>
        <p class="text-lg font-medium">No new notifications</p>
      </div>`;
    return;
  }

  notifications.forEach(n => {
    const div = document.createElement("div");
    div.className = "flex items-start p-4 hover:bg-gray-50 transition";

    div.innerHTML = `
      <div class="flex-shrink-0 text-blue-500 text-xl mr-3">🔵</div>
      <div class="flex-grow">
        <p class="text-gray-800 font-medium">${n.message}</p>
        <p class="text-xs text-gray-400 mt-1">${new Date(n.createdAt).toLocaleString()}</p>
      </div>
      <button class="ml-3 bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded-full hover:bg-blue-200">
        View
      </button>
    `;

    container.appendChild(div);
  });
}

loadNavbar();
loadNotifications();
