const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.'
      });
    }

    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.password, u.role_id, u.position_id, u.avatar, u.status,
              r.name AS role_name, p.name AS position_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN positions p ON u.position_id = p.id
       WHERE u.email = ?`,
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.'
      });
    }

    const user = users[0];

    if (user.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Akun Anda telah dinonaktifkan. Silakan hubungi Administrator.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.'
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role_name
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'projectflow_jwt_secret_key_2026_super_secure',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const { password: userPassword, ...userData } = user;

    return res.status(200).json({
      success: true,
      message: 'Login berhasil.',
      data: {
        token,
        user: userData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat login.'
    });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role_id, position_id } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nama lengkap wajib diisi.' });
    }
    if (!email || email.trim() === '') {
      return res.status(400).json({ success: false, message: 'Alamat email wajib diisi.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Format email tidak valid.' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password minimal 8 karakter.' });
    }

    if (!role_id) {
      return res.status(400).json({ success: false, message: 'Access Category (Role) wajib dipilih.' });
    }

    const parsedRoleId = parseInt(role_id);
    const parsedPositionId = position_id ? parseInt(position_id) : null;

    if (!parsedPositionId) {
      return res.status(400).json({ success: false, message: 'Job Position wajib dipilih.' });
    }

    if (parsedRoleId === 1) {
      return res.status(403).json({
        success: false,
        message: 'Pendaftaran sebagai Administrator tidak diperbolehkan. Peran Administrator hanya dapat dibuat oleh Admin.'
      });
    }

    const [roles] = await pool.query('SELECT name FROM roles WHERE id = ?', [parsedRoleId]);
    if (roles.length === 0 || (parsedRoleId !== 2 && parsedRoleId !== 3)) {
      return res.status(400).json({ success: false, message: 'Access Category tidak valid.' });
    }

    const [positions] = await pool.query('SELECT name FROM positions WHERE id = ?', [parsedPositionId]);
    if (positions.length === 0) {
      return res.status(400).json({ success: false, message: 'Job Position tidak valid.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar. Gunakan email lain.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=2563eb&color=ffffff`;

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password, role_id, position_id, avatar, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
      [name.trim(), email.trim().toLowerCase(), hashedPassword, parsedRoleId, parsedPositionId, defaultAvatar]
    );

    const newUserId = result.insertId;

    const [users] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role_id, u.position_id, u.avatar, u.status, u.created_at,
              r.name AS role_name, p.name AS position_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN positions p ON u.position_id = p.id
       WHERE u.id = ?`,
      [newUserId]
    );

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil. Silakan masuk dengan akun Anda.',
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat pendaftaran.'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, avatar } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nama lengkap tidak boleh kosong.' });
    }

    if (!email || email.trim() === '') {
      return res.status(400).json({ success: false, message: 'Email tidak boleh kosong.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Format email tidak valid.' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND id != ?', [
      email.trim().toLowerCase(),
      userId
    ]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Email sudah digunakan oleh pengguna lain.' });
    }

    let updatedAvatar = avatar;
    if (!updatedAvatar) {
      updatedAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=2563eb&color=ffffff`;
    }

    await pool.query('UPDATE users SET name = ?, email = ?, avatar = ? WHERE id = ?', [
      name.trim(),
      email.trim().toLowerCase(),
      updatedAvatar,
      userId
    ]);

    const [updatedUsers] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role_id, u.position_id, u.avatar, u.status, u.created_at,
              r.name AS role_name, p.name AS position_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN positions p ON u.position_id = p.id
       WHERE u.id = ?`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      data: updatedUsers[0]
    });
  } catch (error) {
    console.error('updateProfile error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui profil.' });
  }
};

const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file foto yang diunggah.' });
    }

    const userId = req.user.id;
    const avatarPath = `/uploads/${req.file.filename}`;

    await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [avatarPath, userId]);

    const [updatedUsers] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role_id, u.position_id, u.avatar, u.status, u.created_at,
              r.name AS role_name, p.name AS position_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN positions p ON u.position_id = p.id
       WHERE u.id = ?`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      message: 'Foto profil berhasil diunggah.',
      data: updatedUsers[0]
    });
  } catch (error) {
    console.error('uploadAvatar error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengunggah foto profil.' });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ success: false, message: 'Password saat ini dan password baru wajib diisi.' });
    }

    if (new_password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password baru minimal 8 karakter.' });
    }

    const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Password saat ini tidak sesuai.' });
    }

    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, userId]);

    return res.status(200).json({
      success: true,
      message: 'Password berhasil diperbarui.'
    });
  } catch (error) {
    console.error('changePassword error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui password.' });
  }
};

const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Data pengguna ditemukan.',
      data: req.user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server.'
    });
  }
};

const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Logout berhasil.'
  });
};

module.exports = {
  login,
  register,
  updateProfile,
  uploadAvatar,
  changePassword,
  getMe,
  logout
};
