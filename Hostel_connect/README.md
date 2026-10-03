# 🌌 HOSTEL CONNECT — ORBITAL CAMPUS RESIDENCE SUITE
### Enterprise Smart Hostel & Mess Management System (MySQL 8.0 + Node.js + React 18 + Space-Tech UI)

**Hostel Connect** is a production-grade, full-stack digital platform engineered for higher education institutions to completely eliminate manual paperwork and centralize hostel room allocations, mess dining operations, student fee settlements, maintenance complaint resolution, identity document verification, and cryptographic audit reporting.

Now upgraded with:
1. **Enterprise MySQL 8.0 Relational Architecture**: 13 interconnected relational tables with foreign keys, cascading constraints, indexed lookups, and ACID transactions. Zero MongoDB dependencies.
2. **Futuristic Space-Tech Cinematic UI**: Deep cosmic canvas (`#050816`), neon purple (`#7B61FF`), neon cyan (`#00E5FF`), and hot pink (`#FF4D9D`) cyber accents, glassmorphic HUD panels, and an interactive Canvas starfield with mouse parallax.

---

## 🚀 System Architecture & Key Capabilities

### 1. Multi-Role Portals & Role-Based Access Control (RBAC)
- **ADMIN**: Complete institutional governance — student rosters, hostel sector configuration, room capacity enforcement, batch fee generation, broadcast notices, document approvals, and audit reports with CSV/Print export.
- **WARDEN / SECTOR COMMAND**: Real-time hostel operations — floor inspection, room allocation & student transfers, resident rosters, maintenance ticket lifecycle tracking, and daily meal attendance check-ins.
- **STUDENT RESIDENT**: Resident self-service hub — pod details & co-resident directory, weekly dining menu with calorie breakdown, fee dues & instant payment simulation, maintenance ticketing with live chronological timelines, and credential uploads.

### 2. Core Functional Modules
- 👥 **Resident Directory & Dossiers**: Search, multi-factor filtering (hostel sector, academic course, year, status), and comprehensive tabbed resident profile dossiers with dual field formatting (`id` / `_id`).
- 🛏️ **Room Management & Smart Allocation**: Visual room availability grid with color-coded occupancy badges (Available, Partial, Full, Maintenance). Enforces capacity constraints and automatically synchronizes room occupancy counters using MySQL transactions.
- 🍽️ **Mess Management & Dining Attendance**: 7-Day weekly meal scheduling (Breakfast, Lunch, Dinner, Special Feast) with Veg/Non-Veg classifications, calorie counts, and daily resident dining check-in sheets.
- 💳 **Fee Management & Official Receipts**: Semester invoice issuance (individual or bulk), overdue tracking, instant simulated payment execution (UPI, Card, Net Banking, Cash), and downloadable/printable vouchers.
- 🛠️ **Complaint & Maintenance Hub**: Resident ticketing across 7 categories (Electricity, Water, Cleanliness, Maintenance, Food, Internet, Other) with priority tags, administrative notes, and chronological lifecycle timelines stored in relational `complaint_timelines`.
- 📢 **Targeted Broadcasts & Alerts**: Sector-wide announcements (All Students, Specific Hostel) with in-app notification bell alerts and unread counters.
- 📄 **Document Verification Desk**: Resident credential uploads (Student ID, Aadhaar / National ID, Admission Letter, Medical Certificate) with administrative approval/rejection workflows and feedback logs.
- 📊 **Audit Reports & Analytics**: Interactive charts (Recharts) and exportable reports (Room Occupancy, Students, Fees, Complaints) with one-click CSV and Print export.

---

## 💻 Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, Vite 5, Tailwind CSS | High-performance SPA with Space-Tech design tokens |
| **Styling & HUD** | Tailwind CSS + Custom CSS Utilities | Glassmorphic panels, cyber glowing borders, neon badges |
| **Interactive Visuals** | HTML5 Canvas API | Orbital starfield particle engine with mouse parallax |
| **Charts & Metrics** | Recharts | Neon-themed bar charts, line graphs, and donut charts |
| **Backend Runtime** | Node.js (v18+) + Express.js | Production MVC REST API with JWT security |
| **Database Engine** | **MySQL 8.0** | 13 normalized relational tables with foreign keys & indexes |
| **MySQL Driver** | `mysql2/promise` | High-performance connection pooling with prepared statements |
| **Security & Auth** | `bcryptjs` + `jsonwebtoken` (JWT) | Salt-hashed passwords (10 rounds) and stateless tokens |
| **File Storage** | Multer | Local static file uploads for documents & attachments |

---

## 🗄️ MySQL 8.0 Relational Database Design (13 Tables)

The application utilizes **MySQL 8.0** with strict relational schema constraints located in `database/schema.sql`:

1. **`users`**: System credentials (`id`, `name`, `email`, `password`, `role`, `profile_image`, `phone`, `is_active`, `created_at`).
2. **`hostels`**: Accommodation sectors (`id`, `name`, `location`, `gender`, `total_rooms`, `description`, `warden_id`, `contact_phone`, `image`).
3. **`rooms`**: Resident rooms (`id`, `hostel_id`, `room_number`, `floor`, `room_type`, `capacity`, `current_occupancy`, `status`, `price_per_semester`).
4. **`students`**: Academic resident profiles (`id`, `user_id`, `student_id`, `course`, `department`, `year`, `phone`, `gender`, `guardian_name`, `guardian_phone`, `address`, `hostel_id`, `room_id`, `status`).
5. **`allocations`**: Bed occupancy history (`id`, `student_id`, `hostel_id`, `room_id`, `allocation_date`, `vacate_date`, `status`, `remarks`).
6. **`mess_menus`**: Weekly dining schedule (`id`, `day_of_week`, `meal_type`, `food_items`, `category`, `calories`, `timing`, `description`).
7. **`meal_attendance`**: Dining hall check-ins (`id`, `student_id`, `date`, `meal_type`, `status`, `marked_by`).
8. **`fees`**: Tuition and accommodation billing (`id`, `student_id`, `fee_type`, `amount`, `due_date`, `payment_date`, `payment_status`, `transaction_id`, `payment_method`, `invoice_number`, `academic_semester`, `remarks`).
9. **`complaints`**: Maintenance service tickets (`id`, `student_id`, `title`, `category`, `description`, `priority`, `status`, `assigned_to`, `resolution_notes`, `image`).
10. **`complaint_timelines`**: Relational lifecycle audit trail (`id`, `complaint_id`, `status`, `note`, `updated_by`, `updated_at`).
11. **`announcements`**: Campus broadcasts (`id`, `title`, `message`, `target_audience`, `hostel_id`, `priority`, `created_by`).
12. **`notifications`**: Resident bell alerts (`id`, `user_id`, `title`, `message`, `type`, `link`, `is_read`).
13. **`documents`**: Credential verification files (`id`, `student_id`, `document_type`, `file_url`, `original_name`, `file_size`, `status`, `admin_notes`).

---

## 🔑 Demo Login Credentials

Pre-seeded accounts are provided with convenient 1-click login buttons on both the Landing Page and Login Page:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@hostelconnect.com` | `Admin@123` | Full Institutional Command |
| **WARDEN** | `warden@hostelconnect.com` | `Warden@123` | Sector Supervision & Allocation |
| **STUDENT** | `student@hostelconnect.com` | `Student@123` | Resident Accommodation Hub |

---

## 📁 Project Structure

```
DBSE/
├── Hostel_connect/
│   ├── database/
│   │   ├── schema.sql           # MySQL 8.0 Schema (13 normalized relational tables)
│   │   └── sample_data.sql      # Seed data with real bcrypt password hashes
│   │
│   ├── client/                  # Frontend React (Vite 5 + Tailwind CSS + Space-Tech UI)
│   │   ├── src/
│   │   │   ├── components/common/ # SpaceBackground, LoadingScreen, Modal, StatusBadge, etc.
│   │   │   ├── context/         # AuthContext, NotificationContext
│   │   │   ├── layouts/         # DashboardLayout (glassmorphic sidebar + cyber navbar)
│   │   │   ├── pages/
│   │   │   │   ├── auth/        # Login, Register, ForgotPassword, ResetPassword
│   │   │   │   ├── dashboard/   # AdminDashboard, WardenDashboard, StudentDashboard
│   │   │   │   ├── students/    # StudentList, StudentProfile
│   │   │   │   ├── rooms/       # RoomManagement, RoomAllocation, MyRoom
│   │   │   │   ├── mess/        # MessMenuPage, MealAttendancePage
│   │   │   │   ├── fees/        # FeeManagement
│   │   │   │   ├── complaints/  # ComplaintList
│   │   │   │   ├── announcements/ # AnnouncementsPage
│   │   │   │   ├── documents/   # DocumentManagement
│   │   │   │   ├── reports/     # ReportsPage
│   │   │   │   ├── settings/    # SettingsPage
│   │   │   │   └── LandingPage.jsx
│   │   │   ├── services/api.js  # Central Axios configuration
│   │   │   └── index.css        # Cosmic design system tokens & animations
│   │   └── package.json
│   │
│   ├── server/                  # Backend Node.js + Express + MySQL 8.0
│   │   ├── config/database.js   # mysql2/promise connection pool
│   │   ├── controllers/         # 12 pure SQL controllers
│   │   ├── models/              # 12 SQL query model wrappers
│   │   ├── middleware/          # JWT authMiddleware, errorMiddleware, uploadMiddleware
│   │   ├── routes/              # Express REST API routes
│   │   ├── utils/
│   │   │   ├── mysqlHelper.js   # Dual format helper (id / _id, camelCase joins, transactions)
│   │   │   └── seeder.js        # Automated SQL schema & seed loader
│   │   ├── uploads/             # Document storage
│   │   ├── server.js            # Server bootstrap
│   │   ├── .env                 # Database & JWT environment variables
│   │   └── package.json
│   │
│   ├── package.json             # Root monorepo scripts
│   └── README.md
│
├── Hostel_connect_backup/       # Safe pre-migration preservation backup
└── hostel_connect_editable_mysql/ # Source of truth reference
```

---

## 🛠️ Installation & Setup Guide

### Prerequisites
- **Node.js**: v18 or higher (tested on Node v20/v24)
- **MySQL Server**: 8.0 running on `localhost:3306`

---

### Step 1: Initialize the MySQL Database

Import `schema.sql` and `sample_data.sql` into your local MySQL server using the command line:

```bash
# Navigate to database folder
cd DBSE/Hostel_connect/database

# 1. Create database and tables
mysql -u root -p < schema.sql

# 2. Populate sample data (including bcrypt demo credentials)
mysql -u root -p hostel_connect < sample_data.sql
```

*(Alternatively, if running on Windows with default MySQL 8.0 installation path:)*
```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < schema.sql
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p hostel_connect < sample_data.sql
```

---

### Step 2: Configure Environment Variables

Inspect `Hostel_connect/server/.env` and update `DB_PASSWORD` if your MySQL root account has a password:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=hostel_connect
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=hostel_connect_super_secret_jwt_key_2024_secure_and_safe
JWT_EXPIRES=30d
CLIENT_URL=http://localhost:5173
```

---

### Step 3: Install Dependencies

From the project root:
```bash
npm run install:all
```
*Or install independently:*
```bash
cd Hostel_connect/server && npm install
cd ../client && npm install
```

---

### Step 4: Run the Application

Start both the backend server and frontend client concurrently:
```bash
# From Hostel_connect/ directory:
npm run dev
```

Or run in separate terminals:
```bash
# Terminal 1 — Backend (Port 5000)
cd Hostel_connect/server
npm run dev

# Terminal 2 — Frontend (Port 5173)
cd Hostel_connect/client
npm run dev
```

- **Frontend Web Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🌐 Complete REST API Reference

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Student self-registration | Public |
| `POST` | `/api/auth/login` | JWT authentication & profile payload | Public |
| `GET` | `/api/auth/me` | Authenticated user profile | Any Authenticated |
| `PUT` | `/api/auth/profile` | Update profile information | Any Authenticated |
| `PUT` | `/api/auth/change-password` | Update user password | Any Authenticated |
| `GET` | `/api/students` | List students with search, filters & pagination | Admin, Warden |
| `POST` | `/api/students` | Create new student profile | Admin |
| `GET` | `/api/students/:id` | Detailed student profile dossier | Any Authenticated |
| `PUT` | `/api/students/:id` | Update student profile | Admin, Warden |
| `DELETE`| `/api/students/:id` | Delete student profile | Admin |
| `GET` | `/api/hostels` | List hostels with occupancy & room counts | Any Authenticated |
| `POST` | `/api/hostels` | Create new hostel sector | Admin |
| `PUT` | `/api/hostels/:id` | Update hostel configuration | Admin |
| `DELETE`| `/api/hostels/:id` | Delete hostel | Admin |
| `GET` | `/api/rooms` | Query rooms, occupancy & filters | Any Authenticated |
| `POST` | `/api/rooms` | Create new room | Admin, Warden |
| `PUT` | `/api/rooms/:id` | Update room details | Admin, Warden |
| `DELETE`| `/api/rooms/:id` | Delete room | Admin |
| `GET` | `/api/allocations` | List room allocations | Admin, Warden |
| `POST` | `/api/allocations` | Allocate student to available bed | Admin, Warden |
| `PUT` | `/api/allocations/:id` | Transfer student to new room | Admin, Warden |
| `DELETE`| `/api/allocations/:id` | Vacate student & release bed | Admin, Warden |
| `GET` | `/api/mess/menu` | Fetch weekly & current day mess menu | Any Authenticated |
| `POST` | `/api/mess/menu` | Create or update menu slot | Admin, Warden |
| `GET` | `/api/mess/attendance` | Query meal attendance records | Any Authenticated |
| `POST` | `/api/mess/attendance` | Check-in student meal attendance | Admin, Warden |
| `GET` | `/api/mess/stats` | Meal analytics & breakdown counts | Admin, Warden |
| `GET` | `/api/fees` | List invoices with financial totals | Any Authenticated |
| `POST` | `/api/fees` | Issue fee bills (single or bulk) | Admin |
| `PUT` | `/api/fees/:id` | Simulate payment & record transaction | Any Authenticated |
| `GET` | `/api/fees/:id/receipt`| Fetch digital receipt data | Any Authenticated |
| `GET` | `/api/complaints` | Query complaints with category/status filters | Any Authenticated |
| `POST` | `/api/complaints` | Submit maintenance ticket | Student |
| `PUT` | `/api/complaints/:id` | Update complaint status & notes | Admin, Warden |
| `GET` | `/api/announcements` | Fetch targeted broadcast feed | Any Authenticated |
| `POST` | `/api/announcements` | Publish new announcement | Admin, Warden |
| `DELETE`| `/api/announcements/:id`| Delete announcement | Admin, Warden |
| `GET` | `/api/notifications` | Fetch user alerts & unread counter | Any Authenticated |
| `PUT` | `/api/notifications/:id/read`| Mark notification as read | Any Authenticated |
| `GET` | `/api/documents` | List uploaded verification documents | Any Authenticated |
| `POST` | `/api/documents/upload` | Upload resident identity document | Any Authenticated |
| `PUT` | `/api/documents/:id/status`| Approve or reject document | Admin, Warden |
| `GET` | `/api/dashboard/admin` | Admin KPI metrics & chart analytics | Admin |
| `GET` | `/api/dashboard/warden` | Warden sector oversight metrics | Warden |
| `GET` | `/api/dashboard/student` | Student resident dashboard overview | Student |
| `GET` | `/api/dashboard/reports` | Aggregated report tables with CSV export | Admin, Warden |

---

## 🔒 Security & Performance Features
- **ACID Transactions**: Room allocations, student room changes, bed deallocations, and invoice reconciliations execute in atomic transactions (`BEGIN`, `COMMIT`, `ROLLBACK`).
- **Cryptographic Password Protection**: bcryptjs salt hashing with 10 iterations.
- **Dual-Field Compatibility**: Backend responses provide both `id` and `_id`, plus camelCase join properties to ensure zero breaking changes across frontend components.
- **Reduced Motion Support**: All canvas particle animations and glowing UI transitions respect `@media (prefers-reduced-motion: reduce)`.
