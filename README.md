# HOSTEL CONNECT 🏢
### Smart Hostel & Mess Management System (MERN Stack)

**Hostel Connect** is a production-style full-stack digital platform engineered for educational institutions to eliminate manual paperwork and centralize hostel accommodation, room allocations, mess operations, student fee settlements, maintenance complaint tracking, and document verification.

---

## 🚀 Key Features

### 1. Multi-Role Portals & Role-Based Access Control (RBAC)
- **ADMIN**: Complete system governance — student records, hostel configuration, room capacity management, automated billing, broadcast notices, document approvals, and analytics reports.
- **WARDEN / STAFF**: Day-to-day hostel operations — floor inspection, room allocation & transfers, student rosters, maintenance issue tracking & assignment, daily meal attendance marking.
- **STUDENT**: Self-service resident hub — room details & roommate directory, weekly dining menu with calories, fee dues & instant payment simulation, complaint submission with live status timeline, and identity document uploads.

### 2. Core Modules
- 👥 **Student Management**: Full CRUD, search, multi-factor filtering (hostel, course, year, status), and comprehensive tabbed student profile dossiers.
- 🛏️ **Room Management & Smart Allocation**: Visual room availability dashboard with color-coded occupancy badges (Available, Partial, Full, Maintenance). Capacity-enforced bed assignments with automatic room occupancy tracking.
- 🍽️ **Mess Management & Dining Attendance**: 7-Day weekly meal scheduling (Breakfast, Lunch, Dinner, Special) with Veg/Non-Veg classifications, calorie counts, and daily student check-in sheets with analytics.
- 💳 **Fee Management & Receipts**: Semester invoice generation, overdue checking, instant payment simulation (UPI, Cards, Net Banking, Cash), and downloadable/printable vouchers.
- 🛠️ **Complaint & Maintenance System**: Student ticketing across 7 categories (Electricity, Water, Cleanliness, Maintenance, Food, Internet, Other) with priority tags, image attachments, staff assignment, and chronological lifecycle timelines.
- 📢 **Targeted Announcements & Notifications**: Targeted broadcasts (All Students, Specific Hostel) with in-app notification bell alerts and unread counters.
- 📄 **Document Verification Desk**: Student identity document upload (Aadhaar, Student ID, Admission letter) with administrative approval/rejection workflows and feedback notes.
- 📊 **Audit Reports & Analytics**: Interactive charts (Recharts) and exportable reports (Room Occupancy, Students, Fees, Complaints) with one-click CSV and Print export.

---

## 💻 Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons, Recharts, Canvas-Confetti.
- **Backend**: Node.js, Express.js (MVC Architecture), JWT Authentication, bcryptjs, Multer file storage, Morgan.
- **Database**: MongoDB with Mongoose ODM (includes zero-config embedded in-memory MongoDB fallback).

---

## 🗄️ MongoDB Database Design (12 Collections)

The application implements 12 distinct Mongoose collections with relational integrity and automated virtual calculations:

1. **Users (`User.js`)**
   - `name`, `email`, `password` (bcrypt salted), `role` (`admin`, `warden`, `student`), `profileImage`, `isActive`, `phone`, `createdAt`.
2. **Students (`Student.js`)**
   - `userId` (ref User), `studentId`, `course`, `department`, `year`, `phone`, `gender` (`Male`, `Female`, `Other`), `guardianName`, `guardianPhone`, `address`, `hostelId` (ref Hostel), `roomId` (ref Room), `status`.
3. **Hostels (`Hostel.js`)**
   - `name`, `location`, `gender` (`Boys`, `Girls`, `Co-ed`), `totalRooms`, `description`, `wardenId` (ref User), `contactPhone`, `image`.
4. **Rooms (`Room.js`)**
   - `hostelId` (ref Hostel), `roomNumber`, `floor`, `roomType` (`Single`, `Double`, `Triple`, `Four-Sharing`), `capacity`, `currentOccupancy`, `status` (`Available`, `Partially Occupied`, `Fully Occupied`, `Maintenance`), `pricePerSemester`.
5. **Allocations (`Allocation.js`)**
   - `studentId` (ref Student), `hostelId` (ref Hostel), `roomId` (ref Room), `allocationDate`, `vacateDate`, `status` (`Active`, `Transferred`, `Vacated`), `remarks`.
6. **MessMenus (`MessMenu.js`)**
   - `dayOfWeek` (`Monday`..`Sunday`), `mealType` (`Breakfast`, `Lunch`, `Dinner`, `Special`), `foodItems` (array of strings), `category` (`Vegetarian`, `Non-Vegetarian`, `Both`, `Special`), `calories`, `timing`, `description`.
7. **MealAttendance (`MealAttendance.js`)**
   - `studentId` (ref Student), `date` (`YYYY-MM-DD`), `mealType` (`Breakfast`, `Lunch`, `Dinner`), `status` (`Present`, `Absent`), `markedBy` (ref User).
8. **Fees (`Fee.js`)**
   - `studentId` (ref Student), `feeType` (`Hostel Fee`, `Mess Fee`, `Maintenance Fee`, `Other Fees`), `amount`, `dueDate`, `paymentDate`, `paymentStatus` (`Paid`, `Pending`, `Overdue`), `transactionId`, `paymentMethod`, `invoiceNumber`, `academicSemester`.
9. **Complaints (`Complaint.js`)**
   - `studentId` (ref Student), `title`, `category` (`Electricity`, `Water`, `Cleanliness`, `Maintenance`, `Food`, `Internet`, `Other`), `description`, `priority` (`Low`, `Medium`, `High`, `Urgent`), `status` (`Submitted`, `In Review`, `Assigned`, `In Progress`, `Resolved`, `Closed`), `assignedTo` (ref User), `resolutionNotes`, `image`, `timeline` (`[{ status, note, updatedBy, updatedAt }]`).
10. **Announcements (`Announcement.js`)**
    - `title`, `message`, `targetAudience` (`All Students`, `Specific Hostel`, `Specific Users`), `hostelId` (ref Hostel), `priority` (`Normal`, `Important`, `Urgent`), `createdBy` (ref User), `createdAt`.
11. **Notifications (`Notification.js`)**
    - `userId` (ref User), `title`, `message`, `type` (`room`, `fee`, `complaint`, `announcement`, `mess`, `document`, `system`), `link`, `isRead`, `createdAt`.
12. **Documents (`Document.js`)**
    - `studentId` (ref Student), `documentType` (`Student ID`, `Aadhaar / Identity Document`, `Admission Document`, `Medical Certificate`, `Other Hostel Documents`), `fileUrl`, `originalName`, `fileSize`, `status` (`Pending`, `Approved`, `Rejected`), `adminNotes`, `uploadDate`.

---

## 🔑 Demo Login Credentials

For demonstration and grading, pre-seeded accounts are provided with 1-click login buttons on both the Landing Page and Login Page:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@hostelconnect.com` | `Admin@123` | Institutional Control |
| **WARDEN** | `warden@hostelconnect.com` | `Warden@123` | Hostel Operations |
| **STUDENT** | `student@hostelconnect.com` | `Student@123` | Student Resident Hub |

---

## 📁 Project Structure

```
hostel-connect/
├── client/                     # Frontend React (Vite + Tailwind)
│   ├── src/
│   │   ├── components/common/  # Navbar, Sidebar, DashboardCard, Modal, StatusBadge, etc.
│   │   ├── context/            # AuthContext, NotificationContext
│   │   ├── layouts/            # DashboardLayout
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, ForgotPassword
│   │   │   ├── dashboard/      # AdminDashboard, WardenDashboard, StudentDashboard
│   │   │   ├── students/       # StudentList, StudentProfile
│   │   │   ├── rooms/          # RoomManagement, RoomAllocation, MyRoom
│   │   │   ├── mess/           # MessMenuPage, MealAttendancePage
│   │   │   ├── fees/           # FeeManagement
│   │   │   ├── complaints/     # ComplaintList
│   │   │   ├── announcements/  # AnnouncementsPage
│   │   │   ├── documents/      # DocumentManagement
│   │   │   ├── reports/        # ReportsPage
│   │   │   └── settings/       # SettingsPage
│   │   ├── services/           # Axios API configuration
│   │   └── App.jsx
│   └── package.json
│
├── server/                     # Backend Node.js + Express
│   ├── config/                 # MongoDB connection & memory fallback
│   ├── controllers/            # Business logic controllers
│   ├── middleware/             # JWT protect, RBAC authorize, Multer, Error handlers
│   ├── models/                 # 12 Mongoose Schema models
│   ├── routes/                 # Express REST route endpoints
│   ├── utils/                  # Database seeder script
│   ├── uploads/                # Uploaded attachments & documents
│   ├── server.js               # Entry point
│   ├── .env                    # Environment config
│   └── package.json
│
├── package.json                # Root concurrent scripts
└── README.md
```

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher, tested on Node v24)
- npm (v9 or higher)
- *(Optional)* MongoDB locally or MongoDB Atlas URI (an automatic in-memory MongoDB is built-in if local MongoDB is offline)

### Step 1: Clone or Navigate to Directory
```bash
cd DBSE
```

### Step 2: Install All Dependencies
Run from the root directory to install root, backend, and frontend packages:
```bash
npm run install:all
```
*Or install manually:*
```bash
cd server && npm install
cd ../client && npm install
```

### Step 3: Environment Variables
The environment configuration file `server/.env` is pre-configured:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/hostel_connect
JWT_SECRET=hostel_connect_super_secret_jwt_key_2024_secure_and_safe
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
```
> **Note**: If you have a MongoDB Atlas connection string, paste it into `MONGO_URI`. If you do not have MongoDB running locally, the server automatically starts an embedded in-memory MongoDB so you can run the app immediately with zero configuration!

### Step 4: Seed Demo Data
To populate the database with hostels, rooms, students, menus, fees, and complaints:
```bash
npm run seed
```

### Step 5: Start the Full-Stack Application
Start both client and server concurrently from the root:
```bash
npm run dev
```

*Or start in separate terminals:*
```bash
# Terminal 1 - Backend Server
cd server
npm run dev

# Terminal 2 - Frontend Client
cd client
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:5000/api/health`

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Student self-registration | Public |
| `POST` | `/api/auth/login` | User authentication & JWT issuance | Public |
| `GET` | `/api/auth/me` | Fetch authenticated profile | Private |
| `GET` | `/api/students` | List all students (search, filter, pagination) | Admin / Warden |
| `POST` | `/api/students` | Create new student | Admin |
| `GET` | `/api/students/:id` | Get student profile dossier | Private |
| `GET` | `/api/hostels` | List hostels with capacity metrics | Public / Private |
| `POST` | `/api/hostels` | Create new hostel | Admin |
| `GET` | `/api/rooms` | Query rooms & availability matrix | Private |
| `POST` | `/api/rooms` | Create new room | Admin / Warden |
| `POST` | `/api/allocations` | Allocate student to available bed | Admin / Warden |
| `PUT` | `/api/allocations/:id` | Transfer student to new room | Admin / Warden |
| `DELETE`| `/api/allocations/:id` | Vacate student / release bed | Admin / Warden |
| `GET` | `/api/mess/menu` | Fetch weekly & today's mess menu | Public / Private |
| `POST` | `/api/mess/menu` | Create or update menu slot | Admin / Warden |
| `POST` | `/api/mess/attendance` | Check-in student meal attendance | Admin / Warden |
| `GET` | `/api/fees` | List fee invoices with summaries | Private |
| `POST` | `/api/fees` | Issue fee bills (single or all students) | Admin |
| `PUT` | `/api/fees/:id` | Pay invoice / update status | Private |
| `GET` | `/api/fees/:id/receipt` | Get printable receipt data | Private |
| `GET` | `/api/complaints` | Query complaints with filters | Private |
| `POST` | `/api/complaints` | Submit maintenance complaint | Private |
| `PUT` | `/api/complaints/:id` | Update status, assign staff, notes | Admin / Warden |
| `GET` | `/api/announcements` | Fetch targeted notice feed | Private |
| `POST` | `/api/announcements` | Broadcast announcement | Admin / Warden |
| `GET` | `/api/notifications` | Fetch user alerts & unread count | Private |
| `POST` | `/api/documents/upload` | Upload verification document | Private |
| `PUT` | `/api/documents/:id/status` | Approve / Reject document | Admin / Warden |
| `GET` | `/api/dashboard/admin` | Admin KPI metrics & chart analytics | Admin |
| `GET` | `/api/dashboard/warden` | Warden hostel oversight metrics | Admin / Warden |
| `GET` | `/api/dashboard/student` | Student dashboard summary | Student |
| `GET` | `/api/dashboard/reports` | Aggregated reports with CSV export | Admin / Warden |

---

## 🔒 Security & Best Practices
- **Password Protection**: bcryptjs salt hashing (10 rounds).
- **Session Tokens**: Cryptographically signed JSON Web Tokens (JWT) with authorization header interceptors.
- **Role-Based Guards**: Protected backend routes with express middleware checking `req.user.role`.
- **Occupancy Integrity**: Strict validation preventing room allocation beyond maximum bed capacity.
