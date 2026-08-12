const pool = require('../config/database');

const createNotification = async ({ userId, type, message }) => {
  try {
    if (!userId) return;
    await pool.query(
      `INSERT INTO notifications (user_id, type, message)
       VALUES (?, ?, ?)`,
      [userId, type, message]
    );
  } catch (error) {
    console.error('Error creating notification:', error.message);
  }
};

module.exports = {
  createNotification
};
