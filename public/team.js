// Load Navbar
async function loadNavbar() {
  const res = await fetch("/navbar.html");
  document.getElementById("navbar").innerHTML = await res.text();
}

// Get Project ID from URL
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("projectId");

// Load Project & Members
async function loadTeam() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  try {
    const res = await fetch(`/api/projects/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch project: ${res.status}`);
    }

    const project = await res.json();

    // Set Project Title (fallback if no title)
    document.getElementById("projectTitle").textContent =
      `Manage Team: ${project.title || "Untitled Project"}`;

    // Show Add Member section if Admin/Manager
    if (role === "ADMIN" || role === "MANAGER") {
      document.getElementById("addMemberSection").classList.remove("hidden");
      document.getElementById("addMemberForm").onsubmit = async (e) => {
        e.preventDefault();
        await addMember();
      };
    }

    // Display Members (safe check)
    const memberList = document.getElementById("memberList");
    memberList.innerHTML = "";

    const members = Array.isArray(project.members) ? project.members : [];

    if (members.length === 0) {
      memberList.innerHTML = `<li class="p-2 text-gray-500">No members yet</li>`;
      return;
    }

    members.forEach(member => {
      const li = document.createElement("li");
      li.className = "p-2 bg-white rounded shadow flex justify-between items-center";

      li.innerHTML = `<span>${member.email} - <strong>${member.role}</strong></span>`;

      if (role === "ADMIN" || role === "MANAGER") {
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.className = "bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600";
        removeBtn.onclick = () => removeMember(member.id);

        li.appendChild(removeBtn);
      }

      memberList.appendChild(li);
    });

  } catch (err) {
    console.error("❌ Error loading team:", err);
    document.getElementById("memberList").innerHTML =
      `<li class="p-2 text-red-500">Failed to load team members</li>`;
  }
}

// Add Member
async function addMember() {
  const token = localStorage.getItem("token");
  const email = document.getElementById("memberEmail").value;

  try {
    const res = await fetch(`/api/projects/${projectId}/team`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to add member");
      return;
    }

    document.getElementById("memberEmail").value = "";
    loadTeam();

  } catch (err) {
    console.error("❌ Add member error:", err);
    alert("Something went wrong while adding member");
  }
}

// Remove Member
async function removeMember(memberId) {
  const token = localStorage.getItem("token");

  if (!confirm("Are you sure you want to remove this member?")) return;

  try {
    const res = await fetch(`/api/projects/${projectId}/team/${memberId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Failed to remove member");
      return;
    }

    loadTeam();
  } catch (err) {
    console.error("❌ Remove member error:", err);
    alert("Something went wrong while removing member");
  }
}

// Init
loadNavbar();
loadTeam();
