const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const { authenticateToken, authorizeRoles } = require("../middleware/authMiddleware");

const prisma = new PrismaClient();
const router = express.Router();

// 📂 File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 📌 Add attachment to task
router.post("/:taskId", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    const { taskId } = req.params;

    const attachment = await prisma.attachment.create({
      data: {
        filename: req.file.filename,
        fileUrl: `/uploads/${req.file.filename}`,
        taskId: parseInt(taskId),
        userId: req.user.id
      }
    });

    res.json({ message: "Attachment uploaded", attachment });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload attachment", details: err.message });
  }
});

// 📌 Get all attachments for a task
router.get("/:taskId", authenticateToken, async (req, res) => {
  try {
    const { taskId } = req.params;

    const attachments = await prisma.attachment.findMany({
      where: { taskId: parseInt(taskId) },
      orderBy: { createdAt: "desc" }
    });

    res.json(attachments);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch attachments", details: err.message });
  }
});

// 📌 Delete attachment (Admin/Manager only)
router.delete("/:id", authenticateToken, authorizeRoles("ADMIN", "MANAGER"), async (req, res) => {
  try {
    const { id } = req.params;

    // Find attachment
    const attachment = await prisma.attachment.findUnique({ where: { id: parseInt(id) } });
    if (!attachment) return res.status(404).json({ error: "Attachment not found" });

    // Delete file from uploads folder
    const filePath = path.join(__dirname, "../uploads", attachment.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from DB
    await prisma.attachment.delete({ where: { id: parseInt(id) } });

    res.json({ message: "Attachment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete attachment", details: err.message });
  }
});

module.exports = router;
