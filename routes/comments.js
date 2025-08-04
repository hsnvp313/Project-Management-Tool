// routes/comments.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const { authenticateToken } = require("../middleware/authMiddleware");

const prisma = new PrismaClient();

// 📌 Add comment to a task
router.post("/:taskId", authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    const comment = await prisma.comment.create({
  data: {
    content,
    taskId: parseInt(taskId),
    authorId: req.user.id  // ✅ Use authorId, not userId
  }
});


    res.json({ message: "Comment added", comment });
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment", details: err.message });
  }
});

module.exports = router;
