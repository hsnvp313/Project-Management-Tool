const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const { authenticateToken, authorizeRoles } = require("./middleware/authMiddleware");

// Load env
dotenv.config();

// Init app & DB
const app = express();
const prisma = new PrismaClient();


app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});


app.use(cors());
app.use(express.json());
app.use(express.static("public"));


// Routes
const authRoutes = require("./routes/auth");
const notificationRoutes = require("./routes/notifications");
const projectRoutes = require("./routes/project");
const taskRoutes = require("./routes/task");
const dashboardRoutes = require("./routes/dashboard");
const progressRoutes = require("./routes/progress");
const commentRoutes = require("./routes/comments");
const attachmentRoutes = require("./routes/attachments");

app.use("/api/comments", commentRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// Promote route (for testing role change)
app.put('/promote/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role: 'ADMIN' }
    });
    res.json({ message: 'User promoted to ADMIN', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong', details: error.message });
  }
});

// Dashboards
app.get('/admin-dashboard', authenticateToken, authorizeRoles('ADMIN'), (req, res) => {
  res.json({ message: "Welcome Admin! You have full control." });
});

app.get('/manager-dashboard', authenticateToken, authorizeRoles('MANAGER', 'ADMIN'), (req, res) => {
  res.json({ message: "Welcome Manager/Admin! You can manage projects." });
});

app.get('/team-dashboard', authenticateToken, (req, res) => {
  res.json({ message: `Welcome ${req.user.role}, you can view your tasks.` });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
