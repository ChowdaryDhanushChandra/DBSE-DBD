import pool from '../config/database.js';
import { formatAnnouncement, withTransaction } from '../utils/mysqlHelper.js';

// @desc    Get announcements for current user
// @route   GET /api/announcements
// @access  Private / Public
export const getAnnouncements = async (req, res, next) => {
  try {
    let sql = `
      SELECT a.*,
             h.name AS hostel_name,
             u.name AS creator_name, u.role AS creator_role
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      LEFT JOIN hostels h ON a.hostel_id = h.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user && req.user.role === 'student') {
      const [st] = await pool.execute('SELECT hostel_id FROM students WHERE user_id = ?', [req.user.id]);
      const hostelId = st.length ? st[0].hostel_id : null;

      if (hostelId) {
        sql += " AND (a.target_audience = 'All Students' OR (a.target_audience = 'Specific Hostel' AND a.hostel_id = ?))";
        params.push(hostelId);
      } else {
        sql += " AND a.target_audience = 'All Students'";
      }
    }

    sql += ' ORDER BY a.created_at DESC';

    const [rows] = await pool.execute(sql, params);
    const announcements = rows.map(formatAnnouncement);

    res.status(200).json({
      success: true,
      count: announcements.length,
      data: announcements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new announcement and notify audience
// @route   POST /api/announcements
// @access  Private (Admin / Warden)
export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, message, targetAudience, hostelId, priority } = req.body;

    const newId = await withTransaction(async (conn) => {
      const [insertRes] = await conn.execute(
        `INSERT INTO announcements (title, message, target_audience, hostel_id, priority, created_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          title,
          message,
          targetAudience || 'All Students',
          hostelId ? Number(hostelId) : null,
          priority || 'Normal',
          req.user.id,
        ]
      );
      const annId = insertRes.insertId;

      // Find target users to notify
      let targetUserIds = [];
      if (targetAudience === 'All Students') {
        const [users] = await conn.execute("SELECT id FROM users WHERE role = 'student'");
        targetUserIds = users.map((u) => u.id);
      } else if (targetAudience === 'Specific Hostel' && hostelId) {
        const [students] = await conn.execute(
          'SELECT user_id FROM students WHERE hostel_id = ?',
          [Number(hostelId)]
        );
        targetUserIds = students.map((s) => s.user_id);
      }

      for (const uid of targetUserIds) {
        await conn.execute(
          `INSERT INTO notifications (user_id, title, message, type, link)
           VALUES (?, ?, ?, 'announcement', '/student/announcements')`,
          [
            uid,
            `Notice: ${title}`,
            message.substring(0, 100) + (message.length > 100 ? '...' : ''),
          ]
        );
      }

      return annId;
    });

    const [rows] = await pool.execute(`
      SELECT a.*,
             h.name AS hostel_name,
             u.name AS creator_name, u.role AS creator_role
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      LEFT JOIN hostels h ON a.hostel_id = h.id
      WHERE a.id = ?
    `, [newId]);

    res.status(201).json({
      success: true,
      message: 'Announcement posted successfully',
      data: formatAnnouncement(rows[0]),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin / Warden)
export const updateAnnouncement = async (req, res, next) => {
  try {
    const { title, message, targetAudience, hostelId, priority } = req.body;

    await pool.execute(
      `UPDATE announcements SET
       title = COALESCE(?, title),
       message = COALESCE(?, message),
       target_audience = COALESCE(?, target_audience),
       hostel_id = ?,
       priority = COALESCE(?, priority)
       WHERE id = ?`,
      [
        title || null,
        message || null,
        targetAudience || null,
        hostelId !== undefined ? (hostelId ? Number(hostelId) : null) : null,
        priority || null,
        req.params.id,
      ]
    );

    const [rows] = await pool.execute(`
      SELECT a.*,
             h.name AS hostel_name,
             u.name AS creator_name, u.role AS creator_role
      FROM announcements a
      JOIN users u ON a.created_by = u.id
      LEFT JOIN hostels h ON a.hostel_id = h.id
      WHERE a.id = ?
    `, [req.params.id]);

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement updated successfully',
      data: formatAnnouncement(rows[0]),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin / Warden)
export const deleteAnnouncement = async (req, res, next) => {
  try {
    const [result] = await pool.execute('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
