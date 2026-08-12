const pool = require('../config/database');

const getProjectActivities = async (req, res) => {
  try {
    const { id } = req.params;
    const [activities] = await pool.query(
      `SELECT al.id, al.user_id, al.project_id, al.entity_type, al.entity_id, al.action, al.description, al.created_at,
              u.name AS user_name, u.avatar AS user_avatar, pos.name AS user_position
       FROM activity_logs al
       JOIN users u ON al.user_id = u.id
       LEFT JOIN positions pos ON u.position_id = pos.id
       WHERE al.project_id = ?
       ORDER BY al.created_at DESC
       LIMIT 100`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: 'Aktivitas project berhasil diambil.',
      data: activities
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil log aktivitas project.' });
  }
};

const getAllActivities = async (req, res) => {
  try {
    const currentUser = req.user;
    let query = `
      SELECT al.id, al.user_id, al.project_id, al.entity_type, al.entity_id, al.action, al.description, al.created_at,
             u.name AS user_name, u.avatar AS user_avatar, pos.name AS user_position,
             p.name AS project_name
      FROM activity_logs al
      JOIN users u ON al.user_id = u.id
      LEFT JOIN positions pos ON u.position_id = pos.id
      LEFT JOIN projects p ON al.project_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (currentUser.role_name === 'Member') {
      query += ` AND al.project_id IN (SELECT project_id FROM project_members WHERE user_id = ?)`;
      params.push(currentUser.id);
    }

    query += ` ORDER BY al.created_at DESC LIMIT 100`;

    const [activities] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      message: 'Daftar log aktivitas berhasil diambil.',
      data: activities
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil log aktivitas.' });
  }
};

module.exports = {
  getProjectActivities,
  getAllActivities
};
