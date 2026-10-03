# Hostel Connect - MySQL Database Setup Guide

This directory contains the production MySQL schema and seeded sample data for **Hostel Connect**.

---

## 📁 Files
- **`schema.sql`**: Creates the `hostel_connect` database and all 13 relational tables with foreign keys and indexes.
- **`sample_data.sql`**: Seeds demo accounts, hostels, rooms, allocations, fees, complaints, menus, and announcements.

---

## 🚀 Quick Import Instructions

### Option A: Using MySQL Command Line (Recommended)

1. Open your terminal or Command Prompt.
2. Navigate to the `Hostel_connect` root directory:
   ```bash
   cd c:\Users\Dhanush\OneDrive\Desktop\DBSE\Hostel_connect
   ```
3. Import the database schema:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   *(Enter your MySQL root password when prompted)*

4. Import the sample data:
   ```bash
   mysql -u root -p hostel_connect < database/sample_data.sql
   ```

5. Verify the database:
   ```bash
   mysql -u root -p -e "USE hostel_connect; SHOW TABLES; SELECT id, name, email, role FROM users;"
   ```

---

### Option B: Using MySQL Workbench

1. Open **MySQL Workbench** and connect to your local MySQL instance.
2. Go to **File -> Open SQL Script...** and select `Hostel_connect/database/schema.sql`.
3. Click the **Execute (⚡ Lightning icon)** to create the database and tables.
4. Go to **File -> Open SQL Script...** and select `Hostel_connect/database/sample_data.sql`.
5. Click **Execute (⚡ Lightning icon)** to insert the sample records.
6. In the left Schema panel, right-click and click **Refresh All**. You should see `hostel_connect` with 13 tables.

---

## 🔑 Pre-Seeded Demo Logins

| Role | Email | Password | Pre-Allocated Room |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@hostelconnect.com` | `Admin@123` | N/A (System Administrator) |
| **Warden** | `warden@hostelconnect.com` | `Warden@123` | Sunrise Boys Hostel Warden |
| **Student** | `dhanush@student.com` | `Student@123` | Room 101, Sunrise Boys Hostel |
| **Student** | `student@hostelconnect.com` | `Student@123` | Room 102, Sunrise Boys Hostel |

*All passwords are encrypted with bcrypt (10 salt rounds) inside `sample_data.sql`.*
