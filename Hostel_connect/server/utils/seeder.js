import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Hostel from '../models/Hostel.js';
import Room from '../models/Room.js';
import Allocation from '../models/Allocation.js';
import MessMenu from '../models/MessMenu.js';
import MealAttendance from '../models/MealAttendance.js';
import Fee from '../models/Fee.js';
import Complaint from '../models/Complaint.js';
import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';
import Document from '../models/Document.js';

export const seedDatabase = async () => {
  try {
    console.log('[Seeder] Starting data import...');
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    // Clean existing collections
    await User.deleteMany();
    await Student.deleteMany();
    await Hostel.deleteMany();
    await Room.deleteMany();
    await Allocation.deleteMany();
    await MessMenu.deleteMany();
    await MealAttendance.deleteMany();
    await Fee.deleteMany();
    await Complaint.deleteMany();
    await Announcement.deleteMany();
    await Notification.deleteMany();
    await Document.deleteMany();

    console.log('[Seeder] Cleared previous database collections.');

    // 1. Create Core Users
    const adminUser = await User.create({
      name: 'Dr. Arthur Mitchell',
      email: 'admin@hostelconnect.com',
      password: 'Admin@123',
      role: 'admin',
      phone: '+91 98765 43210',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    });

    const wardenUser = await WardenUser();
    async function WardenUser() {
      return await User.create({
        name: 'Prof. Rajeshwar Rao',
        email: 'warden@hostelconnect.com',
        password: 'Warden@123',
        role: 'warden',
        phone: '+91 98765 12345',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      });
    }

    const studentUser = await User.create({
      name: 'Dhanush Varma',
      email: 'student@hostelconnect.com',
      password: 'Student@123',
      role: 'student',
      phone: '+91 91234 56789',
      profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    });

    // Additional Demo Students
    const student2User = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@student.edu',
      password: 'Student@123',
      role: 'student',
      phone: '+91 98221 11223',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    });

    const student3User = await User.create({
      name: 'Amit Vikram Sharma',
      email: 'amit.sharma@student.edu',
      password: 'Student@123',
      role: 'student',
      phone: '+91 97112 33445',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    });

    const student4User = await User.create({
      name: 'Sneha Reddy',
      email: 'sneha.reddy@student.edu',
      password: 'Student@123',
      role: 'student',
      phone: '+91 99445 66778',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
    });

    const student5User = await User.create({
      name: 'Rohan Gupta',
      email: 'rohan.gupta@student.edu',
      password: 'Student@123',
      role: 'student',
      phone: '+91 98334 55667',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80',
    });

    console.log('[Seeder] Created core users and demo accounts.');

    // 2. Create Hostels
    const hostelGanga = await Hostel.create({
      name: 'Ganga Boys Hostel',
      location: 'North Campus, Sector 4',
      gender: 'Boys',
      totalRooms: 12,
      description: 'Modern boys residence with high-speed Wi-Fi, indoor games, and 24/7 security.',
      wardenId: wardenUser._id,
      contactPhone: '+91 98765 12345',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    });

    const hostelKaveri = await Hostel.create({
      name: 'Kaveri Girls Hostel',
      location: 'South Campus, Sector 2',
      gender: 'Girls',
      totalRooms: 10,
      description: 'Serene girls residence with landscaped gardens, reading rooms, and biometric security.',
      wardenId: wardenUser._id,
      contactPhone: '+91 98765 54321',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80',
    });

    const hostelHimalaya = await Hostel.create({
      name: 'Himalaya International Hostel',
      location: 'East Wing, Academic Boulevard',
      gender: 'Co-ed',
      totalRooms: 8,
      description: 'Premium air-conditioned facility for postgraduate and international scholars.',
      wardenId: wardenUser._id,
      contactPhone: '+91 98765 99887',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=80',
    });

    // 3. Create Rooms for Ganga Hostel
    const gangaRooms = [];
    for (let f = 1; f <= 3; f++) {
      for (let r = 1; r <= 4; r++) {
        const roomNum = `${f}0${r}`;
        const room = await Room.create({
          hostelId: hostelGanga._id,
          roomNumber: roomNum,
          floor: f,
          roomType: r === 1 ? 'Single' : r === 4 ? 'Triple' : 'Double',
          capacity: r === 1 ? 1 : r === 4 ? 3 : 2,
          currentOccupancy: 0,
          status: (f === 3 && r === 4) ? 'Maintenance' : 'Available',
          pricePerSemester: r === 1 ? 45000 : 35000,
        });
        gangaRooms.push(room);
      }
    }

    // Create Rooms for Kaveri Hostel
    const kaveriRooms = [];
    for (let f = 1; f <= 2; f++) {
      for (let r = 1; r <= 5; r++) {
        const roomNum = `K-${f}0${r}`;
        const room = await Room.create({
          hostelId: hostelKaveri._id,
          roomNumber: roomNum,
          floor: f,
          roomType: 'Double',
          capacity: 2,
          currentOccupancy: 0,
          status: 'Available',
          pricePerSemester: 36000,
        });
        kaveriRooms.push(room);
      }
    }

    // 4. Create Students
    // Main Student: Dhanush Varma
    const primaryRoom = gangaRooms[0]; // Room 101
    const student1 = await Student.create({
      userId: studentUser._id,
      studentId: 'HC-2024-001',
      course: 'B.Tech Computer Science & Engineering',
      department: 'Computer Science',
      year: '3rd Year',
      gender: 'Male',
      phone: '+91 91234 56789',
      guardianName: 'M. S. Varma',
      guardianPhone: '+91 98877 66554',
      address: 'Plot 42, Green Park Avenue, Bengaluru',
      hostelId: hostelGanga._id,
      roomId: primaryRoom._id,
      status: 'Active',
    });

    // Roommate for Dhanush in Room 101
    const roommate = gangaRooms[0];
    const studentRohan = await Student.create({
      userId: student5User._id,
      studentId: 'HC-2024-005',
      course: 'B.Tech Information Technology',
      department: 'Computer Science',
      year: '3rd Year',
      gender: 'Male',
      phone: '+91 98334 55667',
      guardianName: 'Sanjay Gupta',
      guardianPhone: '+91 98223 34455',
      address: 'B-12 Lake View Apartments, Hyderabad',
      hostelId: hostelGanga._id,
      roomId: primaryRoom._id,
      status: 'Active',
    });

    // Update Room 101 occupancy
    primaryRoom.currentOccupancy = 2;
    primaryRoom.status = 'Fully Occupied';
    await primaryRoom.save();

    // Create allocations for Room 101
    await Allocation.create({
      studentId: student1._id,
      hostelId: hostelGanga._id,
      roomId: primaryRoom._id,
      allocationDate: new Date('2024-07-15'),
      status: 'Active',
      remarks: 'Allocated for Fall Semester 2024',
    });

    await Allocation.create({
      studentId: studentRohan._id,
      hostelId: hostelGanga._id,
      roomId: primaryRoom._id,
      allocationDate: new Date('2024-07-16'),
      status: 'Active',
      remarks: 'Allocated for Fall Semester 2024',
    });

    // Girl Student: Priya in Kaveri
    const kaveriRoom1 = kaveriRooms[0];
    const studentPriya = await Student.create({
      userId: student2User._id,
      studentId: 'HC-2024-002',
      course: 'B.Tech Electronics & Communication',
      department: 'Electronics',
      year: '2nd Year',
      gender: 'Female',
      phone: '+91 98221 11223',
      guardianName: 'Kishore Patel',
      guardianPhone: '+91 98770 01122',
      address: '77 Heritage Boulevard, Ahmedabad',
      hostelId: hostelKaveri._id,
      roomId: kaveriRoom1._id,
      status: 'Active',
    });
    kaveriRoom1.currentOccupancy = 1;
    kaveriRoom1.status = 'Partially Occupied';
    await kaveriRoom1.save();

    await Allocation.create({
      studentId: studentPriya._id,
      hostelId: hostelKaveri._id,
      roomId: kaveriRoom1._id,
      allocationDate: new Date('2024-07-20'),
      status: 'Active',
      remarks: 'Allocated for Fall Semester 2024',
    });

    // Student Amit in Room 102
    const gangaRoom2 = gangaRooms[1];
    const studentAmit = await Student.create({
      userId: student3User._id,
      studentId: 'HC-2024-003',
      course: 'B.Tech Mechanical Engineering',
      department: 'Mechanical',
      year: '4th Year',
      gender: 'Male',
      phone: '+91 97112 33445',
      guardianName: 'Vipin Sharma',
      guardianPhone: '+91 97654 32109',
      address: 'Civil Lines, Jaipur',
      hostelId: hostelGanga._id,
      roomId: gangaRoom2._id,
      status: 'Active',
    });
    gangaRoom2.currentOccupancy = 1;
    gangaRoom2.status = 'Partially Occupied';
    await gangaRoom2.save();

    await Allocation.create({
      studentId: studentAmit._id,
      hostelId: hostelGanga._id,
      roomId: gangaRoom2._id,
      allocationDate: new Date('2024-07-18'),
      status: 'Active',
    });

    // Student Sneha in Kaveri
    const kaveriRoom2 = kaveriRooms[1];
    const studentSneha = await Student.create({
      userId: student4User._id,
      studentId: 'HC-2024-004',
      course: 'M.Sc Biotechnology',
      department: 'Life Sciences',
      year: '1st Year',
      gender: 'Female',
      phone: '+91 99445 66778',
      guardianName: 'Prabhakar Reddy',
      guardianPhone: '+91 99887 74411',
      address: 'Banjara Hills, Hyderabad',
      hostelId: hostelKaveri._id,
      roomId: kaveriRoom2._id,
      status: 'Active',
    });
    kaveriRoom2.currentOccupancy = 1;
    kaveriRoom2.status = 'Partially Occupied';
    await kaveriRoom2.save();

    await Allocation.create({
      studentId: studentSneha._id,
      hostelId: hostelKaveri._id,
      roomId: kaveriRoom2._id,
      allocationDate: new Date('2024-08-01'),
      status: 'Active',
    });

    console.log('[Seeder] Created students, rooms, and active allocations.');

    // 5. Mess Menus (Full 7 Days of Breakfast, Lunch, Dinner)
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const menuTemplate = [
      {
        day: 'Monday',
        breakfast: ['Idli & Sambar', 'Coconut Chutney', 'Boiled Eggs / Banana', 'Filter Coffee / Tea'],
        lunch: ['Steamed Rice', 'Dal Tadka', 'Paneer Butter Masala', 'Fresh Salad', 'Curd'],
        dinner: ['Tawa Roti', 'Mix Veg Curry', 'Jeera Rice', 'Gulab Jamun'],
      },
      {
        day: 'Tuesday',
        breakfast: ['Aloo Paratha with Curd', 'Pickle', 'Sprouted Moong', 'Tea & Milk'],
        lunch: ['Jeera Pulao', 'Rajma Masala', 'Bhindi Do Pyaza', 'Raita', 'Papad'],
        dinner: ['Chapati', 'Chole Masala', 'Steamed Rice', 'Fruit Custard'],
      },
      {
        day: 'Wednesday',
        breakfast: ['Poha with Sev', 'Upma', 'Boiled Eggs', 'Masala Chai / Coffee'],
        lunch: ['Veg Biryani / Chicken Biryani (Special)', 'Mirchi Ka Salan', 'Onion Raita', 'Sweet Corn Salad'],
        dinner: ['Phulka', 'Dal Makhani', 'Kadai Paneer', 'Moong Dal Halwa'],
      },
      {
        day: 'Thursday',
        breakfast: ['Masala Dosa', 'Tomato Chutney', 'Sambar', 'Filter Coffee'],
        lunch: ['South Indian Thali', 'Rice', 'Sambar & Rasam', 'Cabbage Poriyal', 'Curd'],
        dinner: ['Puri with Chana Masala', 'Aloo Tamatar Gravy', 'Kheer'],
      },
      {
        day: 'Friday',
        breakfast: ['Bread Omelette / Veg Sandwich', 'Hash Browns', 'Fresh Juice', 'Tea'],
        lunch: ['Fried Rice', 'Chilli Paneer / Manchurian Gravy', 'Hot & Sour Soup', 'Kimchi Salad'],
        dinner: ['Butter Naan', 'Dum Aloo Kashmiri', 'Dal Tadka', 'Ice Cream Cup'],
      },
      {
        day: 'Saturday',
        breakfast: ['Methi Thepla with Chhundo', 'Boiled Eggs', 'Sprouts', 'Ginger Tea'],
        lunch: ['Khichdi & Kadhi', 'Baingan Bharta', 'Potato Fry', 'Papad & Chutney'],
        dinner: ['Pav Bhaji', 'Pulao', 'Green Salad', 'Rasgulla'],
      },
      {
        day: 'Sunday',
        breakfast: ['Puri Bhaji & Halwa', 'Seasonal Fruits', 'Badam Milk / Coffee'],
        lunch: ['Chef Special Hyderabadi Dum Biryani', 'Raita', 'Boiled Egg', 'Paneer Tikka Masala', 'Payasam'],
        dinner: ['Lachha Paratha', 'Matar Paneer', 'Steamed Rice', 'Gajar Ka Halwa'],
      },
    ];

    for (const item of menuTemplate) {
      await MessMenu.create({
        dayOfWeek: item.day,
        mealType: 'Breakfast',
        foodItems: item.breakfast,
        category: 'Both',
        calories: 450,
        timing: '07:30 AM - 09:30 AM',
        description: 'Nutritious morning kickstarter with protein & fresh beverages.',
      });

      await MessMenu.create({
        dayOfWeek: item.day,
        mealType: 'Lunch',
        foodItems: item.lunch,
        category: 'Both',
        calories: 750,
        timing: '12:30 PM - 02:30 PM',
        description: 'Complete balanced lunch meal with healthy carbs and greens.',
      });

      await MessMenu.create({
        dayOfWeek: item.day,
        mealType: 'Dinner',
        foodItems: item.dinner,
        category: 'Vegetarian',
        calories: 650,
        timing: '07:30 PM - 09:45 PM',
        description: 'Warm, satisfying dinner accompanied by traditional desserts.',
      });
    }

    console.log('[Seeder] Created full weekly mess menus.');

    // 6. Meal Attendance Records for Student Dhanush and others
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    await MealAttendance.create({
      studentId: student1._id,
      date: todayStr,
      mealType: 'Breakfast',
      status: 'Present',
      markedBy: wardenUser._id,
    });
    await MealAttendance.create({
      studentId: student1._id,
      date: todayStr,
      mealType: 'Lunch',
      status: 'Present',
      markedBy: wardenUser._id,
    });
    await MealAttendance.create({
      studentId: student1._id,
      date: yesterday,
      mealType: 'Dinner',
      status: 'Present',
      markedBy: wardenUser._id,
    });
    await MealAttendance.create({
      studentId: studentAmit._id,
      date: todayStr,
      mealType: 'Breakfast',
      status: 'Present',
      markedBy: wardenUser._id,
    });
    await MealAttendance.create({
      studentId: studentPriya._id,
      date: todayStr,
      mealType: 'Breakfast',
      status: 'Present',
      markedBy: wardenUser._id,
    });

    // 7. Fee Records
    await Fee.create({
      studentId: student1._id,
      feeType: 'Hostel Fee',
      amount: 35000,
      dueDate: new Date('2024-08-10'),
      paymentDate: new Date('2024-08-05'),
      paymentStatus: 'Paid',
      transactionId: 'TXN-HOSTEL-98214',
      paymentMethod: 'Online / UPI',
      invoiceNumber: 'INV-2024-HF001',
      academicSemester: 'Fall 2024',
      remarks: 'Room 101 Ganga Hostel Accommodation Fee',
    });

    await Fee.create({
      studentId: student1._id,
      feeType: 'Mess Fee',
      amount: 18000,
      dueDate: new Date(Date.now() + 15 * 86400000), // Due in 15 days
      paymentDate: null,
      paymentStatus: 'Pending',
      transactionId: '',
      paymentMethod: 'None',
      invoiceNumber: 'INV-2024-MF002',
      academicSemester: 'Fall 2024',
      remarks: 'Mess charges for months Sept - Dec',
    });

    await Fee.create({
      studentId: student1._id,
      feeType: 'Maintenance Fee',
      amount: 2500,
      dueDate: new Date(Date.now() - 5 * 86400000), // 5 days past due
      paymentDate: null,
      paymentStatus: 'Overdue',
      transactionId: '',
      paymentMethod: 'None',
      invoiceNumber: 'INV-2024-MNT003',
      academicSemester: 'Fall 2024',
      remarks: 'Annual amenity and sports ground maintenance',
    });

    // Fees for other students
    await Fee.create({
      studentId: studentPriya._id,
      feeType: 'Hostel Fee',
      amount: 36000,
      dueDate: new Date('2024-08-10'),
      paymentDate: new Date('2024-08-08'),
      paymentStatus: 'Paid',
      transactionId: 'TXN-KAVERI-44120',
      paymentMethod: 'Credit / Debit Card',
      invoiceNumber: 'INV-2024-KF001',
      academicSemester: 'Fall 2024',
    });

    await Fee.create({
      studentId: studentAmit._id,
      feeType: 'Hostel Fee',
      amount: 35000,
      dueDate: new Date(Date.now() + 10 * 86400000),
      paymentStatus: 'Pending',
      invoiceNumber: 'INV-2024-HF002',
    });

    console.log('[Seeder] Created fee records (Paid, Pending, Overdue).');

    // 8. Complaints
    const complaint1 = await Complaint.create({
      studentId: student1._id,
      title: 'Ceiling fan regulator not working in Room 101',
      category: 'Electricity',
      description: 'The fan is stuck on high speed and the knob is loose. Please send an electrician.',
      priority: 'Medium',
      status: 'In Progress',
      hostelId: hostelGanga._id,
      roomId: primaryRoom._id,
      assignedTo: wardenUser._id,
      resolutionNotes: 'Electrician scheduled for today afternoon at 3:00 PM.',
      timeline: [
        {
          status: 'Submitted',
          note: 'Complaint registered by Dhanush Varma.',
          updatedAt: new Date(Date.now() - 24 * 3600000),
          updatedBy: studentUser._id,
        },
        {
          status: 'In Review',
          note: 'Reviewed by Warden Rajeshwar Rao.',
          updatedAt: new Date(Date.now() - 18 * 3600000),
          updatedBy: wardenUser._id,
        },
        {
          status: 'In Progress',
          note: 'Assigned to campus electrical maintenance team.',
          updatedAt: new Date(Date.now() - 10 * 3600000),
          updatedBy: wardenUser._id,
        },
      ],
    });

    await Complaint.create({
      studentId: student1._id,
      title: 'High-speed Wi-Fi router rebooting intermittently',
      category: 'Internet',
      description: 'The 1st floor corridor access point drops connectivity every 20 minutes.',
      priority: 'High',
      status: 'Resolved',
      hostelId: hostelGanga._id,
      roomId: primaryRoom._id,
      assignedTo: adminUser._id,
      resolutionNotes: 'Replaced faulty PoE injector and upgraded firmware.',
      timeline: [
        {
          status: 'Submitted',
          note: 'Complaint submitted.',
          updatedAt: new Date(Date.now() - 72 * 3600000),
          updatedBy: studentUser._id,
        },
        {
          status: 'Resolved',
          note: 'Network engineer inspected and fixed hardware.',
          updatedAt: new Date(Date.now() - 12 * 3600000),
          updatedBy: adminUser._id,
        },
      ],
    });

    await Complaint.create({
      studentId: studentPriya._id,
      title: 'Hot water geyser not heating on 2nd Floor Wing B',
      category: 'Water',
      description: 'Geyser pilot lamp is off and no hot water available in morning hours.',
      priority: 'Urgent',
      status: 'Assigned',
      hostelId: hostelKaveri._id,
      roomId: kaveriRoom1._id,
      assignedTo: wardenUser._id,
      resolutionNotes: 'Plumbing contractor notified.',
    });

    console.log('[Seeder] Created realistic complaints with status timeline.');

    // 9. Announcements
    await Announcement.create({
      title: 'Annual Hostel Sports Tournament & Cultural Meet 2024',
      message: 'Registrations are now open for Cricket, Badminton, Table Tennis, and Chess. Inter-hostel trophies to be won! Meet in the recreation hall on Friday.',
      targetAudience: 'All Students',
      priority: 'Important',
      createdBy: adminUser._id,
    });

    await Announcement.create({
      title: 'Ganga Boys Hostel: Routine Water Tank Cleaning',
      message: 'Water supply will be suspended between 10:00 AM and 01:00 PM this Saturday for quarterly chemical sanitization. Please store water in advance.',
      targetAudience: 'Specific Hostel',
      hostelId: hostelGanga._id,
      priority: 'Normal',
      createdBy: wardenUser._id,
    });

    await Announcement.create({
      title: 'Mess Committee Meeting - Feedback on Winter Menu',
      message: 'Student representatives from each floor are requested to join the Mess Committee session on Wednesday at 5 PM in the Main Dining Hall.',
      targetAudience: 'All Students',
      priority: 'Normal',
      createdBy: wardenUser._id,
    });

    // 10. Notifications for Student Dhanush
    await Notification.create({
      userId: studentUser._id,
      title: 'Room Allocated: Ganga 101',
      message: 'You have been officially allocated Room 101 in Ganga Boys Hostel.',
      type: 'room',
      link: '/student/my-room',
      isRead: true,
    });

    await Notification.create({
      userId: studentUser._id,
      title: 'Complaint Update: Electrician Assigned',
      message: 'Your ceiling fan complaint has been moved to In Progress. Technician arriving at 3 PM.',
      type: 'complaint',
      link: '/student/complaints',
      isRead: false,
    });

    await Notification.create({
      userId: studentUser._id,
      title: 'Mess Fee Due Reminder',
      message: 'Upcoming mess fee of ₹18,000 is due on 24th Sept. Avoid late fees by paying early.',
      type: 'fee',
      link: '/student/fees',
      isRead: false,
    });

    // 11. Documents for Dhanush
    await Document.create({
      studentId: student1._id,
      documentType: 'Student ID',
      fileUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
      originalName: 'University_Student_ID_Card.pdf',
      fileSize: 1048576,
      status: 'Approved',
      adminNotes: 'Verified against university enrollment register.',
    });

    await Document.create({
      studentId: student1._id,
      documentType: 'Aadhaar / Identity Document',
      fileUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&q=80',
      originalName: 'National_Identity_Card.pdf',
      fileSize: 2097152,
      status: 'Approved',
      adminNotes: 'Address matches guardian residence details.',
    });

    await Document.create({
      studentId: student1._id,
      documentType: 'Medical Certificate',
      fileUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
      originalName: 'Campus_Medical_Fitness_Form.pdf',
      fileSize: 524288,
      status: 'Pending',
      adminNotes: '',
    });

    console.log('[Seeder] ============================================');
    console.log('[Seeder] DATABASE SEEDED SUCCESSFULLY!');
    console.log('[Seeder] DEMO CREDENTIALS:');
    console.log('[Seeder]   ADMIN:   admin@hostelconnect.com   / Admin@123');
    console.log('[Seeder]   WARDEN:  warden@hostelconnect.com  / Warden@123');
    console.log('[Seeder]   STUDENT: student@hostelconnect.com / Student@123');
    console.log('[Seeder] ============================================');

    return true;
  } catch (error) {
    console.error('[Seeder Error] Failed to seed database:', error);
    throw error;
  }
};

// If run directly via node seeder.js
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedDatabase().then(() => {
    console.log('[Seeder] Exiting process.');
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
