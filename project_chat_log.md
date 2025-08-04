
# Project Management App Development Chat Log

## Timeline
- **Start Date:** July 30, 2025
- **End Date:** July 30, 2025 (Functional Completion)

---

## **Major Features Implemented**

### **1. Authentication & Roles**
- Implemented `/signup` and `/login` with bcrypt + JWT.
- Roles: `ADMIN`, `MANAGER`, `TEAM`.
- Role stored in localStorage for frontend access.

### **2. Projects**
- Create, Edit, Delete (Admin & Manager only).
- Assign Members.
- Progress bar calculation from completed tasks.

### **3. Tasks**
- Create, Edit, Delete tasks (Admin & Manager).
- Team members can edit status of assigned tasks.
- Color codes: `TODO` (red), `IN_PROGRESS` (yellow), `DONE` (green).

### **4. Notifications**
- Trigger when tasks are assigned or status changes.
- Team receives notification on assignment.
- Admin & Manager receive status change notifications.

### **5. Attachments**
- Upload attachments to tasks with Multer.
- View attachments list.
- Admin & Manager can delete attachments.

### **6. Dashboard**
- Shows all projects with progress percentage.
- Task modal with assignments & attachments.

---

## **Backend Routes Created**
- `/api/auth` (Login, Signup)
- `/api/projects` (CRUD, Assign Members, Remove Members, Include Tasks for Progress)
- `/api/tasks` (CRUD, Status Update)
- `/api/notifications` (List, Mark Read)
- `/api/attachments` (Upload, Delete)

---

## **Frontend JS**
- `login.js` (handles login, stores token/role)
- `projects.js` (handles project loading, modal, task CRUD, attachment view/delete)
- `notifications.js` (handles fetching notifications)
- `dashboard.js` (shows project list with progress bar)

---

## **Key Fixes**
- Fixed role checks for TEAM edit permissions.
- Added scroll to modal.
- Fixed project progress calculation (was always 0%).
- Added attachment delete for Admin/Manager.
- Improved modal styling.

---

✅ **All functional requirements completed.**
⚠️ Optional: UI polish for better presentation.

---

**Ready for submission.**
