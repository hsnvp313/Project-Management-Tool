// 📌 Load Navbar
async function loadNavbar() {
  const res = await fetch("/navbar.html");
  document.getElementById("navbar").innerHTML = await res.text();
}

// 📌 Load Projects
async function loadProjects() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Show Add Project form if Admin/Manager
  if (role === "ADMIN" || role === "MANAGER") {
    document.getElementById("addProjectSection").classList.remove("hidden");
    document.getElementById("addProjectForm").onsubmit = async (e) => {
      e.preventDefault();
      await addProject();
    };
  }

  const res = await fetch("/api/projects", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const projects = await res.json();

  const container = document.getElementById("projectList");
  container.innerHTML = "";

  projects.forEach(project => {
  // ✅ Safe tasks array
  let tasks = Array.isArray(project.tasks) ? project.tasks : [];
  let doneTasks = tasks.filter(t => t.status === "DONE").length;
  let totalTasks = tasks.length;
  let progressPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const card = document.createElement("div");
  card.className = "bg-white p-4 rounded shadow hover:shadow-lg";

  card.innerHTML = `
    <h2 class="text-lg font-bold">${project.title}</h2>
    <p class="text-gray-600">${project.description || ""}</p>

    <!-- Progress Bar -->
    <div class="w-full bg-gray-200 rounded-full h-3 my-3">
      <div class="bg-green-500 h-3 rounded-full" style="width: ${progressPercent}%;"></div>
    </div>
    <p class="text-sm text-gray-500">${progressPercent}% Completed</p>

    <div class="mt-3 flex gap-2">
      <button class="bg-green-500 text-white px-3 py-1 rounded"
        onclick="openTaskModal(${project.id}, '${project.title}', '${role}')">
        View Tasks
      </button>
      ${(role === "ADMIN" || role === "MANAGER") ? `
        <button class="bg-purple-500 text-white px-3 py-1 rounded"
          onclick="location.href='/team.html?projectId=${project.id}'">
          Manage Team
        </button>
      ` : ""}
    </div>
  `;

  container.appendChild(card);
});

}



// 📌 Add Project
async function addProject() {
  const token = localStorage.getItem("token");
  const title = document.getElementById("projectTitle").value;
  const description = document.getElementById("projectDesc").value;

  await fetch("/api/projects", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ title, description })
  });

  document.getElementById("projectTitle").value = "";
  document.getElementById("projectDesc").value = "";
  loadProjects(); // Reload list
}

// 📌 Open Task Modal
async function openTaskModal(projectId, projectTitle, role) {
  document.getElementById("modalProjectTitle").textContent = projectTitle;
  document.getElementById("taskModal").classList.remove("hidden");

  if (role === "ADMIN" || role === "MANAGER") {
    document.getElementById("addTaskSection").classList.remove("hidden");

    // 🔹 Fetch team members for dropdown
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const project = await res.json();

    const memberSelect = document.getElementById("assignedMember");
    memberSelect.innerHTML = `<option value="">Unassigned</option>`;
    project.members.forEach(member => {
      memberSelect.innerHTML += `<option value="${member.id}">${member.email}</option>`;
    });

    document.getElementById("addTaskForm").onsubmit = async (e) => {
      e.preventDefault();
      await addTask(projectId);
    };
  } else {
    document.getElementById("addTaskSection").classList.add("hidden");
  }

  loadTasks(projectId, role);
}

// 📌 Load Attachments
async function loadAttachments(taskId, container, role) {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/attachments/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const attachments = await res.json();

  container.innerHTML = "";

  if (attachments.length === 0) {
    container.innerHTML = `<p class="text-gray-500 text-sm">No attachments</p>`;
    return;
  }

  attachments.forEach(att => {
    const div = document.createElement("div");
    div.className = "flex justify-between items-center bg-gray-100 p-2 rounded";

    div.innerHTML = `
      <a href="${att.fileUrl}" target="_blank" class="text-blue-500 underline">${att.filename}</a>
    `;

    if (role === "ADMIN" || role === "MANAGER") {
      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.className = "text-red-500 ml-2";
      delBtn.onclick = async () => {
        if (!confirm("Delete this attachment?")) return;
        await fetch(`/api/attachments/${att.id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        loadAttachments(taskId, container, role);
      };
      div.appendChild(delBtn);
    }

    container.appendChild(div);
  });
}

// 📌 Load Tasks
async function loadTasks(projectId, role) {
  const token = localStorage.getItem("token");
  const currentUserId = parseInt(localStorage.getItem("userId")); 
  const res = await fetch(`/api/tasks/project/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const tasks = await res.json();

  const taskList = document.getElementById("taskList");
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML = `<li class="text-gray-500 p-2">No tasks found</li>`;
    return;
  }

  tasks.forEach(task => {
    const li = document.createElement("li");
    li.className = `p-2 rounded flex justify-between items-center ${
  task.status === "DONE" ? "bg-green-100" :
  task.status === "IN_PROGRESS" ? "bg-yellow-100" : 
  "bg-red-100"
}`;


    li.innerHTML = `
      <div class="flex justify-between items-center">
        <span>
          ${task.title} - <strong>${task.status}</strong>
          ${task.assignedTo ? `<br><small class="text-gray-600">Assigned to: ${task.assignedTo.email}</small>` : ""}
        </span>
      </div>
    `;

    // Buttons for edit/delete
    if (role === "ADMIN" || role === "MANAGER" || (role === "TEAM" && task.assignedToId === currentUserId)) {
      const btns = document.createElement("div");
      btns.className = "flex gap-2 mt-1";

      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️ Edit Status";
      editBtn.className = "text-blue-500";
      editBtn.onclick = () => updateTaskStatus(task.id, projectId, task.status);
      btns.appendChild(editBtn);

      if (role === "ADMIN" || role === "MANAGER") {
        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️ Delete Task";
        delBtn.className = "text-red-500";
        delBtn.onclick = () => deleteTask(task.id, projectId);
        btns.appendChild(delBtn);
      }

      li.appendChild(btns);
    }

    // Attachments Section
    const attachmentContainer = document.createElement("div");
    attachmentContainer.className = "mt-2 space-y-1";
    li.appendChild(attachmentContainer);
    loadAttachments(task.id, attachmentContainer, role);

    // Upload Attachment Button
    if (role === "ADMIN" || role === "MANAGER" || (role === "TEAM" && task.assignedToId === currentUserId)) {
      const uploadForm = document.createElement("form");
      uploadForm.className = "mt-2";
      uploadForm.innerHTML = `
        <input type="file" class="border p-1 text-sm" id="file-${task.id}">
        <button type="submit" class="bg-blue-500 text-white px-2 py-1 rounded text-sm">Upload</button>
      `;
      uploadForm.onsubmit = async (e) => {
        e.preventDefault();
        const fileInput = document.getElementById(`file-${task.id}`);
        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        await fetch(`/api/attachments/${task.id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        loadAttachments(task.id, attachmentContainer, role);
      };
      li.appendChild(uploadForm);
    }

    taskList.appendChild(li);
  });
}

// 📌 Add Task
async function addTask(projectId) {
  const token = localStorage.getItem("token");
  const title = document.getElementById("taskTitle").value;
  const status = document.getElementById("taskStatus").value;
  const assignedToId = document.getElementById("assignedMember").value;

  await fetch("/api/tasks", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ 
      title, 
      status, 
      projectId,
      assignedToId: assignedToId || null
    })
  });

  loadTasks(projectId, localStorage.getItem("role"));
}

// 📌 Update Task Status
async function updateTaskStatus(taskId, projectId, currentStatus) {
  const token = localStorage.getItem("token");
  const newStatus = prompt("Enter new status (TODO / IN_PROGRESS / DONE):", currentStatus);
  if (!newStatus || !["TODO", "IN_PROGRESS", "DONE"].includes(newStatus.toUpperCase())) {
    alert("Invalid status");
    return;
  }

  await fetch(`/api/tasks/${taskId}/status`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}` 
    },
    body: JSON.stringify({ status: newStatus.toUpperCase() })
  });

  loadTasks(projectId, localStorage.getItem("role"));
}

// 📌 Delete Task
async function deleteTask(taskId, projectId) {
  const token = localStorage.getItem("token");
  if (!confirm("Are you sure you want to delete this task?")) return;

  const res = await fetch(`/api/tasks/${taskId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    alert("Failed to delete task");
    return;
  }
  loadTasks(projectId, localStorage.getItem("role"));
}

// 📌 Close Modal
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("taskModal").classList.add("hidden");
});

// Init
loadNavbar();
loadProjects();
