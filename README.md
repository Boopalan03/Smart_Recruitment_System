# 🚀 Smart Recruitment System

A full-stack **Smart Recruitment System** built with the **MERN stack** (MongoDB, Express.js, React, Node.js). The platform connects **Job Seekers** and **Employers** through an intuitive interface — enabling job posting, searching, applying with resume uploads, application tracking, and real-time notifications.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)

---

## ✨ Features

### 👤 Job Seeker
- **Register & Login** with secure authentication (JWT-based)
- **Browse & Search Jobs** with filters (keyword, location, salary, job type)
- **Apply to Jobs** with resume upload (PDF)
- **Track Application Status** — view pending, accepted, and rejected applications
- **Real-Time Notifications** — get notified when an application is accepted or rejected
- **My Account** — view and update profile (name, contact, gender, DOB)
- **Delete Account** — permanently remove account and data

### 🏢 Employer
- **Post New Jobs** with details (title, company, location, description, salary range, experience level, job type)
- **Manage Job Listings** — view, and delete posted jobs
- **Review Applications** — view applicants per job with resume download
- **Accept / Reject Applicants** — update application status with automatic seeker notifications
- **Global Inbox** — view all applications across all posted jobs
- **Download Accepted Applicants** — export accepted applicants as CSV

### 🔐 Admin
- **Create Employer Accounts** — dedicated admin route to onboard employers

### 🔔 Notification System
- Employers receive notifications when a new resume is submitted
- Seekers receive notifications when their application is accepted or rejected
- Notifications can be individually deleted

---

## 🛠 Tech Stack

| Layer        | Technology                                                    |
| ------------ | ------------------------------------------------------------- |
| **Frontend** | React 19, Vite 7, React Router v7, Axios                     |
| **Backend**  | Node.js, Express 5, Mongoose 9                                |
| **Database** | MongoDB (Atlas)                                               |
| **Auth**     | JWT (jsonwebtoken), bcryptjs                                  |
| **Uploads**  | Multer (resume PDF uploads)                                   |
| **Deployment** | Vercel (Frontend), Render (Backend)                         |

---

## 📁 Project Structure

```
smart-job-portal/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js      # Register, Login, Profile, Password Reset
│   │   ├── jobController.js       # CRUD Jobs, Applications, Notifications, CSV Export
│   │   └── userController.js      # User-related operations
│   ├── middleware/
│   │   ├── authMiddleware.js      # JWT authentication middleware
│   │   └── uploadMiddleware.js    # Multer file upload config
│   ├── models/
│   │   ├── Application.js         # Application schema (job, applicant, status, resume)
│   │   ├── Job.js                 # Job schema (title, company, salary, type, etc.)
│   │   ├── Notification.js        # Notification schema (user, message, read status)
│   │   └── User.js                # User schema (seeker/employer, profile fields)
│   ├── routes/
│   │   ├── authRoutes.js          # Auth & profile endpoints
│   │   ├── jobRoutes.js           # Job & application endpoints
│   │   └── userRoutes.js          # User endpoints
│   ├── uploads/                   # Uploaded resume files (served statically)
│   ├── .env.example               # Environment variable template
│   ├── package.json
│   └── server.js                  # Express app entry point
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── CustomModal.jsx    # Reusable modal component
│   │   │   ├── CustomModal.css
│   │   │   ├── Icons.jsx          # SVG icon components
│   │   │   ├── Navbar.jsx         # Navigation bar with auth state
│   │   │   └── ProtectedRoute.jsx # Auth-guarded route wrapper
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global authentication state (React Context)
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Job feed with search & filters
│   │   │   ├── About.jsx          # About page
│   │   │   ├── Login.jsx          # Login form
│   │   │   ├── Register.jsx       # Registration form
│   │   │   ├── ForgotPassword.jsx # Password reset form
│   │   │   ├── MyAccount.jsx      # Profile management
│   │   │   ├── PostJob.jsx        # Job posting form (employer)
│   │   │   ├── SeekerDashboard.jsx    # Seeker applications & notifications
│   │   │   ├── EmployerDashboard.jsx  # Employer job & applicant management
│   │   │   └── AdminCreateEmployer.jsx # Admin employer creation
│   │   ├── api.js                 # Axios instance with base URL config
│   │   ├── App.jsx                # Root component with routing
│   │   ├── main.jsx               # React DOM entry point
│   │   └── index.css              # Global styles
│   ├── .env.example               # Frontend environment template
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json                # Vercel deployment config
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Boopalan03/Smart_Recruitment_System.git
   cd Smart_Recruitment_System
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your backend API URL
   ```

4. **Run the Application**

   Start the backend (from `/backend`):
   ```bash
   npm run dev
   ```

   Start the frontend (from `/frontend`):
   ```bash
   npm run dev
   ```

   The frontend runs on `http://localhost:5173` and the backend on `http://localhost:5000`.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable       | Description                          | Example                                      |
| -------------- | ------------------------------------ | -------------------------------------------- |
| `PORT`         | Server port                          | `5000`                                       |
| `NODE_ENV`     | Environment mode                     | `production`                                 |
| `MONGO_URI`    | MongoDB connection string            | `mongodb+srv://user:pass@cluster.mongodb.net/job-portal` |
| `JWT_SECRET`   | Secret key for JWT token signing     | `your_super_secret_jwt_key_here`             |
| `FRONTEND_URL` | Frontend URL (for CORS)              | `https://your-frontend-domain.vercel.app`    |

### Frontend (`frontend/.env`)

| Variable             | Description                        | Example                                    |
| -------------------- | ---------------------------------- | ------------------------------------------ |
| `VITE_API_BASE_URL`  | Backend API base URL               | `https://your-backend.onrender.com/api`    |
| `VITE_BACKEND_URL`   | Backend base URL (for file downloads) | `https://your-backend.onrender.com`     |

---

## 📡 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint                | Description                | Auth |
| ------ | ----------------------- | -------------------------- | ---- |
| POST   | `/api/auth/register`    | Register a new user        | ❌   |
| POST   | `/api/auth/login`       | Login and get JWT token    | ❌   |
| POST   | `/api/auth/create-employer` | Create employer account (admin) | ❌ |
| POST   | `/api/auth/reset-password`  | Reset user password    | ❌   |
| GET    | `/api/auth/me`          | Get current user profile   | ✅   |
| PUT    | `/api/auth/profile`     | Update user profile        | ✅   |
| DELETE | `/api/auth/delete-account`  | Delete user account    | ✅   |

### Jobs (`/api/jobs`)

| Method | Endpoint                                  | Description                          | Auth |
| ------ | ----------------------------------------- | ------------------------------------ | ---- |
| GET    | `/api/jobs`                               | Get all jobs (with optional filters) | ❌   |
| GET    | `/api/jobs/locations`                     | Get unique job locations             | ❌   |
| POST   | `/api/jobs`                               | Create a new job posting             | ✅ Employer |
| POST   | `/api/jobs/:id/apply`                     | Apply for a job (with resume upload) | ✅ Seeker |
| GET    | `/api/jobs/applications`                  | Get user's applications              | ✅ Seeker |
| GET    | `/api/jobs/my-jobs`                       | Get employer's posted jobs           | ✅ Employer |
| GET    | `/api/jobs/:jobId/applications`           | Get applications for a specific job  | ✅ Employer |
| GET    | `/api/jobs/employer/applications`         | Get all employer applications        | ✅ Employer |
| PUT    | `/api/jobs/applications/:id/status`       | Update application status            | ✅ Employer |
| DELETE | `/api/jobs/:id`                           | Delete a job posting                 | ✅ Employer |
| GET    | `/api/jobs/:jobId/download-accepted`      | Download accepted applicants as CSV  | ✅ Employer |
| GET    | `/api/jobs/notifications`                 | Get user notifications               | ✅   |
| DELETE | `/api/jobs/notifications/:id`             | Delete a notification                | ✅   |

---

## 🌐 Deployment

### Frontend — Vercel

The frontend is configured for deployment on **Vercel** with `vercel.json` for SPA routing.

1. Push the `frontend/` directory to a GitHub repository
2. Import the project on [Vercel](https://vercel.com)
3. Set the environment variables (`VITE_API_BASE_URL`, `VITE_BACKEND_URL`)
4. Deploy

### Backend — Render

The backend can be deployed on **Render** as a Web Service.

1. Push the `backend/` directory to a GitHub repository
2. Create a new Web Service on [Render](https://render.com)
3. Set the build command to `npm install` and start command to `npm start`
4. Add the environment variables (`MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`)
5. Deploy

---

## 👥 Roles & Permissions

| Feature                    | Seeker | Employer | Admin |
| -------------------------- | :----: | :------: | :---: |
| Browse & Search Jobs       |   ✅   |    ✅    |  ✅   |
| Apply to Jobs              |   ✅   |    ❌    |  ❌   |
| Track Applications         |   ✅   |    ❌    |  ❌   |
| Post Jobs                  |   ❌   |    ✅    |  ❌   |
| Manage Applications        |   ❌   |    ✅    |  ❌   |
| Download CSV               |   ❌   |    ✅    |  ❌   |
| Receive Notifications      |   ✅   |    ✅    |  ❌   |
| Create Employer Accounts   |   ❌   |    ❌    |  ✅   |
| Manage Profile             |   ✅   |    ✅    |  ❌   |

---

## 📝 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
