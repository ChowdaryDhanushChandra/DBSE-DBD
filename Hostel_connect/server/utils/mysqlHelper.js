import pool from '../config/database.js';

/**
 * Execute a parameterized query using the pool
 */
export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
};

/**
 * Execute a transaction with automatic rollback on error
 */
export const withTransaction = async (callback) => {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * Format user record for frontend compatibility
 */
export const formatUser = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    email: row.email,
    role: row.role || 'student',
    phone: row.phone || '',
    profileImage: row.profile_image || '',
    isActive: Boolean(row.is_active ?? true),
    createdAt: row.created_at,
  };
};

/**
 * Format hostel record
 */
export const formatHostel = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    name: row.name,
    location: row.location || '',
    gender: row.gender,
    totalRooms: Number(row.total_rooms || 0),
    description: row.description || '',
    wardenId: row.warden_id ? { id: row.warden_id, _id: row.warden_id, name: row.warden_name, email: row.warden_email } : null,
    contactPhone: row.contact_phone || '',
    image: row.image || '',
    createdAt: row.created_at,
  };
};

/**
 * Format room record
 */
export const formatRoom = (row) => {
  if (!row) return null;
  const capacity = Number(row.capacity || 2);
  const currentOccupancy = Number(row.current_occupancy || 0);
  return {
    id: row.id,
    _id: row.id,
    hostelId: row.hostel_id ? {
      id: row.hostel_id,
      _id: row.hostel_id,
      name: row.hostel_name || '',
      location: row.hostel_location || '',
      gender: row.hostel_gender || '',
    } : null,
    roomNumber: row.room_number,
    floor: Number(row.floor_number ?? 1),
    floorNumber: Number(row.floor_number ?? 1),
    roomType: row.room_type || 'Double',
    capacity,
    currentOccupancy,
    availableBeds: Math.max(0, capacity - currentOccupancy),
    status: row.status || 'Available',
    pricePerSemester: Number(row.price_per_semester || 0),
    createdAt: row.created_at,
  };
};

/**
 * Format student record
 */
export const formatStudent = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    userId: {
      id: row.user_id,
      _id: row.user_id,
      name: row.name || '',
      email: row.email || '',
      role: row.role || 'student',
      phone: row.phone || row.user_phone || '',
      profileImage: row.profile_image || '',
      isActive: Boolean(row.is_active ?? true),
      createdAt: row.user_created_at || row.created_at,
    },
    studentId: row.student_id,
    course: row.course || '',
    department: row.department || '',
    year: row.year_of_study ? `${row.year_of_study}${row.year_of_study === 1 ? 'st' : row.year_of_study === 2 ? 'nd' : row.year_of_study === 3 ? 'rd' : 'th'} Year` : '1st Year',
    yearOfStudy: row.year_of_study,
    phone: row.phone || '',
    gender: row.gender || 'Male',
    guardianName: row.guardian_name || '',
    guardianPhone: row.guardian_phone || '',
    address: row.address || '',
    hostelId: row.hostel_id ? {
      id: row.hostel_id,
      _id: row.hostel_id,
      name: row.hostel_name || '',
      location: row.hostel_location || '',
      gender: row.hostel_gender || '',
    } : null,
    roomId: row.room_id ? {
      id: row.room_id,
      _id: row.room_id,
      roomNumber: row.room_number || '',
      floor: Number(row.floor_number ?? 1),
      roomType: row.room_type || 'Double',
      capacity: Number(row.room_capacity || 2),
      currentOccupancy: Number(row.room_occupancy || 0),
    } : null,
    status: row.status || 'Active',
    createdAt: row.created_at,
  };
};

/**
 * Format allocation record
 */
export const formatAllocation = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    studentId: {
      id: row.student_id,
      _id: row.student_id,
      studentId: row.roll_no || row.student_roll || '',
      userId: {
        id: row.user_id,
        _id: row.user_id,
        name: row.student_name || '',
        email: row.student_email || '',
      },
      course: row.course || '',
      department: row.department || '',
    },
    hostelId: {
      id: row.hostel_id,
      _id: row.hostel_id,
      name: row.hostel_name || '',
      location: row.hostel_location || '',
    },
    roomId: {
      id: row.room_id,
      _id: row.room_id,
      roomNumber: row.room_number || '',
      floor: Number(row.floor_number ?? 1),
      roomType: row.room_type || 'Double',
      capacity: Number(row.capacity || 2),
      currentOccupancy: Number(row.current_occupancy || 0),
    },
    allocationDate: row.allocation_date,
    vacateDate: row.vacate_date,
    status: row.status || 'Active',
    remarks: row.remarks || '',
    createdAt: row.created_at,
  };
};

/**
 * Format mess menu item
 */
export const formatMessMenu = (row) => {
  if (!row) return null;
  let foodItems = [];
  try {
    foodItems = typeof row.food_items === 'string' ? JSON.parse(row.food_items) : (row.food_items || []);
  } catch (e) {
    foodItems = [row.food_items];
  }
  return {
    id: row.id,
    _id: row.id,
    dayOfWeek: row.day_of_week,
    mealType: row.meal_type,
    foodItems,
    category: row.category || 'Vegetarian',
    calories: Number(row.calories || 500),
    timing: row.timing || '',
    description: row.description || '',
    createdAt: row.created_at,
  };
};

/**
 * Format meal attendance record
 */
export const formatMealAttendance = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    studentId: {
      id: row.student_id,
      _id: row.student_id,
      studentId: row.roll_no || '',
      userId: {
        id: row.user_id,
        _id: row.user_id,
        name: row.student_name || '',
      },
    },
    date: row.attendance_date ? new Date(row.attendance_date).toISOString().split('T')[0] : '',
    mealType: row.meal_type,
    status: row.status || 'Present',
    markedBy: row.marked_by,
    createdAt: row.created_at,
  };
};

/**
 * Format fee record
 */
export const formatFee = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    studentId: {
      id: row.student_id,
      _id: row.student_id,
      studentId: row.roll_no || row.student_roll || '',
      userId: {
        id: row.user_id,
        _id: row.user_id,
        name: row.student_name || '',
        email: row.student_email || '',
      },
      hostelId: row.hostel_name ? { name: row.hostel_name } : null,
      roomId: row.room_number ? { roomNumber: row.room_number } : null,
    },
    feeType: row.fee_type,
    amount: Number(row.amount || 0),
    dueDate: row.due_date,
    paymentDate: row.payment_date,
    paymentStatus: row.payment_status || 'Pending',
    transactionId: row.transaction_id || '',
    paymentMethod: row.payment_method || 'None',
    invoiceNumber: row.invoice_number,
    academicSemester: row.academic_semester || 'Fall 2026',
    createdAt: row.created_at,
  };
};

/**
 * Format complaint record
 */
export const formatComplaint = (row, timeline = []) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    studentId: {
      id: row.student_id,
      _id: row.student_id,
      studentId: row.roll_no || '',
      userId: {
        id: row.user_id,
        _id: row.user_id,
        name: row.student_name || '',
        email: row.student_email || '',
      },
      hostelId: row.hostel_name ? { name: row.hostel_name } : null,
      roomId: row.room_number ? { roomNumber: row.room_number } : null,
    },
    title: row.title,
    category: row.category,
    description: row.description,
    priority: row.priority || 'Medium',
    status: row.status || 'Submitted',
    assignedTo: row.assigned_to ? {
      id: row.assigned_to,
      _id: row.assigned_to,
      name: row.assigned_name || '',
      email: row.assigned_email || '',
    } : null,
    resolutionNotes: row.resolution_notes || '',
    image: row.image || '',
    timeline: timeline.map(t => ({
      status: t.status,
      note: t.note || '',
      updatedAt: t.updated_at,
      updatedBy: t.updated_by ? { id: t.updated_by, name: t.updater_name } : null,
    })),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * Format announcement record
 */
export const formatAnnouncement = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    title: row.title,
    message: row.message,
    targetAudience: row.target_audience || 'All Students',
    hostelId: row.hostel_id ? {
      id: row.hostel_id,
      _id: row.hostel_id,
      name: row.hostel_name || '',
    } : null,
    priority: row.priority || 'Normal',
    createdBy: {
      id: row.created_by,
      _id: row.created_by,
      name: row.creator_name || 'Admin',
      role: row.creator_role || 'admin',
    },
    createdAt: row.created_at,
  };
};

/**
 * Format notification record
 */
export const formatNotification = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type || 'system',
    link: row.link || '',
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
  };
};

/**
 * Format document record
 */
export const formatDocument = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    _id: row.id,
    studentId: {
      id: row.student_id,
      _id: row.student_id,
      studentId: row.roll_no || '',
      userId: {
        id: row.user_id,
        _id: row.user_id,
        name: row.student_name || '',
      },
    },
    documentType: row.document_type,
    fileUrl: row.file_url,
    originalName: row.original_name || '',
    status: row.status || 'Pending',
    adminNotes: row.admin_notes || '',
    createdAt: row.upload_date || row.created_at,
    uploadDate: row.upload_date || row.created_at,
  };
};
