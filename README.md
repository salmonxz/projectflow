# ProjectFlow — Modern SaaS Project & Team Workspace

ProjectFlow is a modern, full-stack SaaS web application built with **React (Vite)**, **Node.js (Express)**, and **MySQL**. It features complete multi-role team management, interactive Kanban boards, dynamic job position recommendations, automated audit activity logs, system workload reports, account profile management with direct file upload, and a portfolio demo login system.

---

## 🌟 Key Features

- **Portfolio Demo Access System**: 1-click access for 3 pre-configured demo roles (*Administrator*, *Project Manager*, *Member*) authenticating through full REST API & JWT security.
- **Multi-Role Access Control**:
  - **Administrator**: User management, Job Position definitions, System Activity Logs, and System Workload Reports.
  - **Project Manager**: Project lifecycle management (Create/Edit/Delete Project), Task assignment, Member management, Kanban board control, and Reports.
  - **Member**: Assigned task execution, Task status updates, Commenting, Attachment uploads, and Personal Workspace.
- **Job Position Recommendation Engine**: 1-click quick task assignment matching required positions (*Frontend Developer*, *UI/UX Designer*, etc.).
- **Interactive Kanban Board**: Drag-and-drop task status transitions with real-time audit logging.
- **System Reports & Visual Analytics**: Recharts donut/bar charts and print/export PDF functionality.
- **Account Profile & File Upload**: Edit name, email, avatar image uploads via Multer, and secure password updates (`bcrypt`).

---

## 🚀 Local Setup & Development

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **MySQL Database**: v8.0 or MariaDB (e.g., Laragon, XAMPP, or local MySQL instance)

### 2. Configure Environment Variables
Create `.env` inside `backend/`:
```env
PORT=5000
NODE_ENV=development
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=projectflow_db
JWT_SECRET=projectflow_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

Optionally create `.env` inside `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_UPLOAD_URL=http://localhost:5000
```

### 3. Database Initialization & Seeding
1. Open your MySQL client and create the database:
   ```sql
   CREATE DATABASE projectflow_db;
   ```
2. Import the schema:
   ```bash
   mysql -u root projectflow_db < backend/database/schema.sql
   ```
3. Run the idempotent database seeder to populate sample team members and demo data:
   ```bash
   cd backend
   npm run seed
   ```

### 4. Start Development Servers
- **Start Backend API** (Runs on `http://localhost:5000`):
  ```bash
  cd backend
  npm run dev
  ```

- **Start Frontend App** (Runs on `http://localhost:5173`):
  ```bash
  cd frontend
  npm run dev
  ```

- **Test Health Endpoint**:
  ```bash
  GET http://localhost:5000/api/health
  ```
  Expected Response:
  ```json
  {
    "success": true,
    "message": "ProjectFlow API is running",
    "database": "connected"
  }
  ```

---

## ☁️ Vercel Production Deployment

### 1. External MySQL Database Requirement
Vercel serverless functions do not host persistent database services. You must use an external cloud MySQL provider such as **Aiven for MySQL**, **PlanetScale**, **Railway**, **Clever Cloud**, or **Amazon RDS**.

1. Run `backend/database/schema.sql` on your external cloud MySQL instance.
2. Run `node backend/database/seed.js` to seed the initial demo accounts and positions into your external database.

### 2. Vercel Project Setup
Deploy the root repository to **Vercel**:

- **Framework Preset**: Vite
- **Root Directory**: `./` (Repository root)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`

### 3. Vercel Environment Variables
Set the following environment variables in your Vercel Project Settings (`Settings -> Environment Variables`):

| Variable Name | Environment | Description / Example |
| :--- | :--- | :--- |
| `DB_HOST` | Production | `your-cloud-mysql-host.com` |
| `DB_PORT` | Production | `3306` |
| `DB_USER` | Production | `your_db_username` |
| `DB_PASSWORD` | Production | `your_db_password` |
| `DB_NAME` | Production | `projectflow_db` |
| `JWT_SECRET` | Production | `random_secure_production_jwt_key` |
| `JWT_EXPIRES_IN` | Production | `7d` |
| `FRONTEND_URL` | Production | `https://your-projectflow.vercel.app` |
| `VITE_API_URL` | Production | `/api` (or `https://your-projectflow.vercel.app/api`) |

### 4. File Storage Deployment Considerations
- For local development, user profile avatars and task attachments are stored in `backend/uploads/`.
- On Vercel Serverless Functions, the local filesystem is ephemeral and read-only. For persistent file uploads in production, integrate cloud object storage such as **AWS S3**, **Cloudinary**, or **Supabase Storage**.

---

## 🛠️ Testing & Verification Commands

- **Run Automated Feature & Security Audit**:
  ```bash
  cd backend
  node test_all_features.js
  ```
- **Test Frontend Build**:
  ```bash
  cd frontend
  npm run build
  ```

---

## 📄 License
ISC License &copy; 2026 ProjectFlow Team.
