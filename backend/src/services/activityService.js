const pool = require('../config/database');

const logActivity = async ({ userId, projectId = null, entityType, entityId = null, action, description }) => {
  try {
    await pool.query(
      `INSERT INTO activity_logs (user_id, project_id, entity_type, entity_id, action, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, projectId, entityType, entityId, action, description]
    );
  } catch (error) {
    console.error('Error logging activity:', error.message);
  }
};

module.exports = {
  logActivity
};
