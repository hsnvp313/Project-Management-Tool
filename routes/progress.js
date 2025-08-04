// routes/progress.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { authenticateToken } = require("../middleware/authMiddleware");

const prisma = new PrismaClient();

// 📌 Default Progress (first project found)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      include: { tasks: true }
    });

    if (!project) {
      return res.status(404).json({ error: "No projects found" });
    }

    const totalTasks = project.tasks.length;
    const done = project.tasks.filter(t => t.status === "DONE").length;
    const inProgress = project.tasks.filter(t => t.status === "IN_PROGRESS").length;
    const todo = project.tasks.filter(t => t.status === "TODO").length;
    const completionPercentage = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0;

    res.json({
      projectTitle: project.title,
      totalTasks,
      done,
      inProgress,
      todo,
      completionPercentage
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch default progress", details: err.message });
  }
});

// 📌 Get project progress by ID
router.get("/:projectId", authenticateToken, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { tasks: true }
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const totalTasks = project.tasks.length;
    const done = project.tasks.filter(t => t.status === "DONE").length;
    const inProgress = project.tasks.filter(t => t.status === "IN_PROGRESS").length;
    const todo = project.tasks.filter(t => t.status === "TODO").length;
    const completionPercentage = totalTasks > 0 ? Math.round((done / totalTasks) * 100) : 0;

    res.json({
      projectTitle: project.title,
      totalTasks,
      done,
      inProgress,
      todo,
      completionPercentage
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch progress", details: err.message });
  }
});

module.exports = router;
