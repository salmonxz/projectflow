const pool = require('../config/database');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const [notifications] = await pool.query(
      `SELECT id, user_id, type, message, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    const unreadCount = notifications.filter(n => n.is_read === 0).length;

    return res.status(200).json({
      success: true,
      message: 'Notifikasi berhasil diambil.',
      data: {
        notifications,
        unread_count: unreadCount
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil notifikasi.' });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Notifikasi ditandai telah dibaca.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui notifikasi.' });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);

    return res.status(200).json({
      success: true,
      message: 'Semua notifikasi ditandai telah dibaca.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui notifikasi.' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead
};
