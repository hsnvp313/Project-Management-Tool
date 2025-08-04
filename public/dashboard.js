async function loadDashboard() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must log in first!");
      window.location.href = "/login.html"; 
      return;
    }

    // Fetch Progress Data
    const progressRes = await fetch("/api/progress", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!progressRes.ok) throw new Error("Progress fetch failed");
    const progressData = await progressRes.json();

    // Fetch Tasks Data
    const tasksRes = await fetch("/api/tasks", {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!tasksRes.ok) throw new Error("Tasks fetch failed");
    const tasksData = await tasksRes.json();

    // Update Stats
    document.getElementById("completionPercentage").textContent = progressData.completionPercentage + "%";
    document.getElementById("totalTasks").textContent = progressData.totalTasks;
    document.getElementById("doneTasks").textContent = progressData.done;
    document.getElementById("todoTasks").textContent = progressData.todo;

    // Populate Table
    const table = document.getElementById("taskTable");
    table.innerHTML = "";
    tasksData.forEach(task => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="py-2 px-4 border">${task.title}</td>
        <td class="py-2 px-4 border">
          <span class="px-2 py-1 rounded-full text-white text-xs ${
            task.status === "DONE" ? "bg-green-500" :
            task.status === "IN_PROGRESS" ? "bg-yellow-500" : "bg-red-500"
          }">${task.status}</span>
        </td>
      `;
      table.appendChild(row);
    });

    // Chart
    new Chart(document.getElementById("taskChart"), {
      type: "doughnut",
      data: {
        labels: ["TODO", "In Progress", "Done"],
        datasets: [{
          data: [progressData.todo, progressData.inProgress, progressData.done],
          backgroundColor: ["#f87171", "#fbbf24", "#34d399"]
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } }
      }
    });

  } catch (err) {
    console.error(err);
    alert("Error loading dashboard data");
  }
}

loadDashboard();
