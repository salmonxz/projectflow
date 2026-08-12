const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const getUsers = async (req, res) => {
  try {
    const { role_id, position_id, status, search } = req.query;
    let query = `
      SELECT u.id, u.name, u.email, u.role_id, u.position_id, u.avatar, u.status, u.created_at, u.updated_at,
             r.name AS role_name, p.name AS position_name,
             (SELECT COUNT(*) FROM project_members pm WHERE pm.user_id = u.id) AS projects_count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN positions p ON u.position_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (req.query.exclude_admin === 'true') {
      query += " AND r.name != 'Administrator'";
    }
    if (role_id) {
      query += ' AND u.role_id = ?';
      params.push(role_id);
    }
    if (position_id) {
      query += ' AND u.position_id = ?';
      params.push(position_id);
    }
    if (status) {
      query += ' AND u.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY u.created_at DESC';

    const [users] = await pool.query(query, params);
    return res.status(200).json({
      success: true,
      message: 'Daftar pengguna berhasil diambil.',
      data: users
    });
  } catch (error) {
    console.error('getUsers error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data pengguna.' });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role_id, u.position_id, u.avatar, u.status, u.created_at, u.updated_at,
              r.name AS role_name, p.name AS position_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN positions p ON u.position_id = p.id
       WHERE u.id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    // Get user's projects
    const [projects] = await pool.query(
      `SELECT pr.id, pr.name, pr.status, pr.client_name, pm.joined_at
       FROM project_members pm
       JOIN projects pr ON pm.project_id = pr.id
       WHERE pm.user_id = ?`,
      [id]
    );

    const userData = {
      ...users[0],
      projects
    };

    return res.status(200).json({
      success: true,
      message: 'Detail pengguna berhasil diambil.',
      data: userData
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail pengguna.' });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role_id, position_id, avatar, status = 'Active' } = req.body;

    if (!name || !email || !password || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, password, dan Access Category (Role) wajib diisi.'
      });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultAvatar = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role_id, position_id, avatar, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), email.trim().toLowerCase(), hashedPassword, role_id, position_id || null, defaultAvatar, status]
    );

    return res.status(201).json({
      success: true,
      message: 'Pengguna berhasil dibuat.',
      data: { id: result.insertId, name, email, role_id, position_id, status }
    });
  } catch (error) {
    console.error('createUser error:', error);
    return res.status(500).json({ success: false, message: 'Gagal membuat pengguna baru.' });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role_id, position_id, avatar, status } = req.body;

    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const user = users[0];

    // Check authorization: Admin can edit any user; normal user can only update their own profile
    if (req.user.role_name !== 'Administrator' && req.user.id !== parseInt(id)) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki izin mengubah data akun pengguna ini.' });
    }

    if (email && email.toLowerCase() !== user.email) {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [email.toLowerCase(), id]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Email sudah digunakan oleh akun lain.' });
      }
    }

    let hashedPassword = user.password;
    if (password && password.trim() !== '') {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Only Admin can change role_id and status
    const updatedRoleId = req.user.role_name === 'Administrator' && role_id !== undefined ? role_id : user.role_id;
    const updatedStatus = req.user.role_name === 'Administrator' && status !== undefined ? status : user.status;
    const updatedPositionId = position_id !== undefined ? position_id : user.position_id;

    await pool.query(
      `UPDATE users
       SET name = ?, email = ?, password = ?, role_id = ?, position_id = ?, avatar = ?, status = ?
       WHERE id = ?`,
      [
        name !== undefined ? name.trim() : user.name,
        email !== undefined ? email.trim().toLowerCase() : user.email,
        hashedPassword,
        updatedRoleId,
        updatedPositionId || null,
        avatar !== undefined ? avatar : user.avatar,
        updatedStatus,
        id
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Pengguna berhasil diperbarui.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui pengguna.' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ success: false, message: 'Anda tidak dapat menghapus akun Anda sendiri.' });
    }

    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return res.status(200).json({
      success: true,
      message: 'Pengguna berhasil dihapus.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus pengguna.' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
