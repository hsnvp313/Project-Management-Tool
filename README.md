# 🚀 Project Management System

A simple **role-based project & task management system** built with **Node.js (Express), Prisma, JWT Authentication, and Vanilla JS (with Tailwind CSS)**.  
Supports **Admin, Manager, and Team Member roles** with projects, tasks, attachments, notifications, and progress tracking.

---

## 📌 Features

### 🔑 Authentication
- User Signup & Login (JWT based)
- Role-based Access (ADMIN, MANAGER, TEAM)

### 📁 Project Management
- Admin/Manager can create, edit, and delete projects.
- Team members can view assigned projects.
- Progress bar based on completed tasks.

### ✅ Task Management
- Add tasks to projects.
- Assign tasks to team members.
- Change task status (TODO, IN_PROGRESS, DONE).
- Color-coded task status (Red, Yellow, Green).

### 📂 Attachments
- Upload files to tasks.
- Admin/Manager can delete uploaded attachments.

### 🔔 Notifications
- Real-time notifications for task assignment & status updates.
- Notifications visible in each user’s dashboard.

### 📊 Progress Tracking
- Project progress calculated based on completed tasks.
- Visible in the dashboard with percentage completion.

---

## 🛠️ Tech Stack

### **Backend**
- Node.js + Express
- Prisma ORM (PostgreSQL / MySQL / SQLite supported)
- JWT Authentication
- Multer (File uploads)

### **Frontend**
- HTML, TailwindCSS
- Vanilla JavaScript (No framework)

---

## 📂 Project Structure

