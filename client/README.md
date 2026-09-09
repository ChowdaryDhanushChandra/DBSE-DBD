# Hostel Connect - Frontend Client

Modern, responsive React single-page application for **Hostel Connect (Hostel & Mess Management System)**.

---

## 🎨 Tech Stack & Design

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom palette (Deep Blue/Indigo primary, Purple secondary, Cyan accent)
- **Typography**: Plus Jakarta Sans
- **Icons**: Lucide React
- **Data Visualizations**: Recharts (Pie/Donut, Bar, Line charts)
- **Celebrations**: Canvas-Confetti
- **HTTP Client**: Axios with centralized request/response interceptors
- **Routing**: React Router DOM v6 with Role-Based Access Control (RBAC)

---

## 📂 Client Structure

```
client/
├── public/
├── src/
│   ├── components/
│   │   └── common/           # Navbar, Sidebar, DashboardCard, Modal, StatusBadge, etc.
│   ├── context/
│   │   ├── AuthContext.jsx   # Session management, JWT state, role helpers
│   │   └── NotificationContext.jsx # Alert feeds & unread counts
│   ├── layouts/
│   │   └── DashboardLayout.jsx # Responsive drawer sidebar & topbar wrapper
│   ├── pages/
│   │   ├── auth/             # Login, Register, ForgotPassword, ResetPassword
│   │   ├── dashboard/        # AdminDashboard, WardenDashboard, StudentDashboard
│   │   ├── students/         # StudentList, StudentProfile (5-tab dossier)
│   │   ├── rooms/            # RoomManagement, RoomAllocation, MyRoom
│   │   ├── mess/             # MessMenuPage, MealAttendancePage
│   │   ├── fees/             # FeeManagement, Receipt Modal
│   │   ├── complaints/       # ComplaintList, timeline lifecycle
│   │   ├── announcements/    # AnnouncementsPage
│   │   ├── documents/        # DocumentManagement
│   │   ├── reports/          # ReportsPage with CSV export
│   │   └── settings/         # SettingsPage
│   ├── services/
│   │   └── api.js            # Axios client with automatic Bearer token injection
│   ├── App.jsx               # Route definitions & protected route guards
│   ├── index.css             # Tailwind imports & custom scrollbars
│   └── main.jsx              # React root entry
├── index.html
├── vite.config.js            # Development proxy to backend API (/api & /uploads)
├── tailwind.config.js
└── package.json
```

---

## 🚀 Running the Client

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Vite Dev Server
```bash
npm run dev
```
Client runs at: `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
```
Generates production assets in `dist/`.
