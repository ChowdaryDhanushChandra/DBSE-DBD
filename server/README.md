# Hostel Connect - Backend API Server

Production-style Express.js & MongoDB REST API for **Hostel Connect (Hostel & Mess Management System)**.

---

## 🛠️ Tech Stack & Architecture

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js (MVC Architecture)
- **Database**: MongoDB with Mongoose ODM (includes zero-config embedded MongoMemoryServer fallback)
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing (10 salt rounds)
- **File Uploads**: Multer with file type filtering
- **Logging**: Morgan HTTP logger

---

## 📂 Server Structure

```
server/
├── config/
│   └── db.js                 # Dual-mode MongoDB connector (External URI + in-memory fallback)
├── controllers/
│   ├── authController.js     # User registration, login, profile, password reset
│   ├── studentController.js  # Student CRUD, search, multi-factor filters
│   ├── hostelController.js   # Hostel configuration & capacity aggregation
│   ├── roomController.js     # Room matrix, floor layouts, availability checks
│   ├── allocationController.js # Room assignment, transfer & vacate logic
│   ├── messController.js     # 7-Day meal menus, daily attendance, dining stats
│   ├── feeController.js      # Invoice billing, payment simulation, receipt generator
│   ├── complaintController.js# Ticketing, priority filters, timeline updates
│   ├── announcementController.js # Targeted broadcasts (All / Specific Hostel)
│   ├── notificationController.js # In-app notification feeds & unread counts
│   ├── documentController.js # File verification queue (Approve / Reject)
│   └── dashboardController.js# Aggregated KPIs, charts & audit reports
├── middleware/
│   ├── authMiddleware.js     # JWT Bearer token verification (`protect`)
│   ├── roleMiddleware.js     # Role-based authorization (`authorize`)
│   ├── uploadMiddleware.js   # Multer storage configuration
│   └── errorMiddleware.js    # Centralized error handler & 404 handler
├── models/                   # 12 Mongoose Database Collections
│   ├── User.js
│   ├── Student.js
│   ├── Hostel.js
│   ├── Room.js
│   ├── Allocation.js
│   ├── MessMenu.js
│   ├── MealAttendance.js
│   ├── Fee.js
│   ├── Complaint.js
│   ├── Announcement.js
│   ├── Notification.js
│   └── Document.js
├── routes/                   # REST API route endpoints
├── uploads/                  # Static document and image storage
├── utils/
│   └── seeder.js             # Comprehensive database seed script
├── .env.example
├── .env
├── server.js                 # Application entry point
└── package.json
```

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@hostelconnect.com` | `Admin@123` |
| **Warden** | `warden@hostelconnect.com` | `Warden@123` |
| **Student** | `student@hostelconnect.com` | `Student@123` |

---

## 🚀 Running the Server

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (`.env`)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/hostel_connect
JWT_SECRET=hostel_connect_super_secret_jwt_key_2024_secure_and_safe
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```

### 3. Seed Database
```bash
npm run seed
```

### 4. Start Server
```bash
npm run dev
```
Server runs at: `http://localhost:5000`
Health check endpoint: `http://localhost:5000/api/health`
