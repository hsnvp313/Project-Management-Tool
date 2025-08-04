const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { authenticateToken } = require("../middleware/authMiddleware");

const prisma = new PrismaClient();

// 📊 Dashboard API
router.get("/", authenticateToken, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "ADMIN" || req.user.role === "MANAGER") {
      // All tasks
      tasks = await prisma.task.findMany();
    } else {
      // Only tasks assigned to the logged-in team member
      tasks = await prisma.task.findMany({
        where: { assignedToId: req.user.id }
      });
    }

    // Group tasks by status
    const progress = {
      TODO: tasks.filter(t => t.status === "TODO").length,
      IN_PROGRESS: tasks.filter(t => t.status === "IN_PROGRESS").length,
      DONE: tasks.filter(t => t.status === "DONE").length
    };

    res.json({
      totalTasks: tasks.length,
      progress
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard", details: err.message });
  }
});

module.exports = router;
