const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const prisma = new PrismaClient();

/**
 * 📌 Create Task (Admin, Manager)
 */
router.post("/", authenticateToken, authorizeRoles("ADMIN", "MANAGER"), async (req, res) => {
  try {
    console.log("📩 Incoming Task Data:", req.body); // Debug log

    let { title, description, status, projectId, assignedToId } = req.body;

    projectId = parseInt(projectId);
    assignedToId = assignedToId ? parseInt(assignedToId) : null;

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        projectId,
        assignedToId
      },
      include: { assignedTo: true }
    });

    // ✅ Send Notification if Assigned
    if (assignedToId) {
      await prisma.notification.create({
        data: {
          message: `You have been assigned a new task: ${title}`,
          userId: assignedToId
        }
      });
    }

    res.json(task);
  } catch (err) {
    console.error("❌ Error creating task:", err);
    res.status(500).json({ error: "Failed to create task", details: err.message });
  }
});

// 📌 Update Task Status
router.put("/:id/status", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Fetch task to check assignment
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
      include: { project: { include: { owner: true } } }
    });

    if (!task) return res.status(404).json({ error: "Task not found" });

    // ✅ Permission check
    if (
      req.user.role !== "ADMIN" &&
      req.user.role !== "MANAGER" &&
      task.assignedToId !== req.user.id
    ) {
      return res.status(403).json({ error: "Not authorized to update this task" });
    }

    // Update status
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { status }
    });

    // ✅ Notify owner if DONE
    if (status === "DONE" && task.project.ownerId) {
      await prisma.notification.create({
        data: {
          message: `Task "${task.title}" is marked as DONE by ${req.user.name || 'Team Member'}.`,
          userId: task.project.ownerId
        }
      });
    }

    res.json({ message: "Task status updated", task: updatedTask });
  } catch (err) {
    res.status(500).json({ error: "Failed to update task", details: err.message });
  }
});


/**
 * 📌 Get Notifications for Logged-In User
 */
router.get("/notifications", authenticateToken, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json(notifications);
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ error: "Failed to fetch notifications", details: err.message });
  }
});

/**
 * 📌 Get All Tasks (Dashboard)
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      include: { tasks: true }
    });

    if (!project) {
      return res.status(404).json({ error: "No projects found" });
    }

    res.json(project.tasks);
  } catch (err) {
    console.error("❌ Error fetching tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks", details: err.message });
  }
});

/**
 * 📌 Get Tasks for a Specific Project
 */
router.get("/project/:projectId", authenticateToken, async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: { assignedTo: true }
    });

    res.json(tasks);
  } catch (err) {
    console.error("❌ Error fetching project tasks:", err);
    res.status(500).json({ error: "Failed to fetch tasks", details: err.message });
  }
});

/**
 * 📌 Delete Task (Admin/Manager)
 */
router.delete("/:id", authenticateToken, authorizeRoles("ADMIN", "MANAGER"), async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.task.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting task:", err);
    res.status(500).json({ error: "Failed to delete task", details: err.message });
  }
});

/**
 * 📌 Assign Task to a Member (Admin, Manager)
 */
router.put("/:id/assign", authenticateToken, authorizeRoles("ADMIN", "MANAGER"), async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedToId } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: parseInt(assignedToId) } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { assignedToId: parseInt(assignedToId) }
    });

    res.json(updatedTask);
  } catch (err) {
    console.error("❌ Error assigning task:", err);
    res.status(500).json({ error: "Failed to assign task", details: err.message });
  }
});



module.exports = router;
