const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const prisma = new PrismaClient();

// 📌 Create Project (Admin, Manager)
router.post("/", authenticateToken, authorizeRoles("ADMIN", "MANAGER"), async (req, res) => {
  try {
    const { title, description } = req.body;
    const project = await prisma.project.create({
      data: {
        title,
        description,
        ownerId: req.user.id,
      },
    });
    res.json(project);
  } catch (err) {
    console.error("❌ Create Project Error:", err);
    res.status(500).json({ error: "Failed to create project", details: err.message });
  }
});

// 📌 Get All Projects (with tasks for progress calculation)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: true,
        tasks: true // 👈 include tasks so frontend can calculate % done
      }
    });
    res.json(projects);
  } catch (err) {
    console.error("❌ Fetch Projects Error:", err);
    res.status(500).json({ error: "Failed to fetch projects", details: err.message });
  }
});

// 📌 Update Project (Admin, Manager)
router.put("/:id", authenticateToken, authorizeRoles("ADMIN", "MANAGER"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: { title, description },
    });

    res.json(project);
  } catch (err) {
    console.error("❌ Update Project Error:", err);
    res.status(500).json({ error: "Failed to update project", details: err.message });
  }
});

// 📌 Delete Project (Admin, Manager)
router.delete("/:id", authenticateToken, authorizeRoles("ADMIN", "MANAGER"), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Project Error:", err);
    res.status(500).json({ error: "Failed to delete project", details: err.message });
  }
});

// 📌 Get Project with Members
router.get("/:projectId", authenticateToken, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.projectId) },
      include: {
        owner: true,
        members: { include: { user: true } },
      },
    });

    if (!project) return res.status(404).json({ error: "Project not found" });

    res.json({
      id: project.id,
      title: project.title,
      description: project.description,
      members: project.members.map(m => ({
        id: m.user.id,
        email: m.user.email,
        role: m.user.role
      }))
    });
  } catch (err) {
    console.error("❌ Fetch Project Members Error:", err);
    res.status(500).json({ error: "Failed to fetch project", details: err.message });
  }
});

// 📌 Add Member
router.post("/:projectId/team", authenticateToken, authorizeRoles("ADMIN", "MANAGER"), async (req, res) => {
  try {
    const { email } = req.body;
    const projectId = parseInt(req.params.projectId);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if already added
    const existing = await prisma.projectMember.findFirst({
      where: { projectId, userId: user.id }
    });
    if (existing) return res.status(400).json({ error: "Member already in project" });

    await prisma.projectMember.create({
      data: { projectId, userId: user.id }
    });

    res.json({ message: "Member added successfully" });
  } catch (err) {
    console.error("❌ Add Member Error:", err);
    res.status(500).json({ error: "Failed to add member", details: err.message });
  }
});

// 📌 Remove Member
router.delete("/:projectId/team/:memberId", authenticateToken, authorizeRoles("ADMIN", "MANAGER"), async (req, res) => {
  try {
    await prisma.projectMember.deleteMany({
      where: { projectId: parseInt(req.params.projectId), userId: parseInt(req.params.memberId) }
    });

    res.json({ message: "Member removed successfully" });
  } catch (err) {
    console.error("❌ Remove Member Error:", err);
    res.status(500).json({ error: "Failed to remove member", details: err.message });
  }
});

module.exports = router;
