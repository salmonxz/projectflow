const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak. Token tidak ditemukan.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'projectflow_jwt_secret_key_2026_super_secure');

    // Fetch latest user details including role and position
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.role_id, u.position_id, u.avatar, u.status,
              r.name AS role_name, p.name AS position_name
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN positions p ON u.position_id = p.id
       WHERE u.id = ? AND u.status = 'Active'`,
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna tidak aktif atau tidak ditemukan.'
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau telah kadaluwarsa.'
    });
  }
};

// Middleware to authorize specific Access Categories (Roles) by name
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Belum terautentikasi.' });
    }

    if (!allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak. Peran '${req.user.role_name}' tidak memiliki izin untuk fitur ini.`
      });
    }
    next();
  };
};

module.exports = {
  verifyToken,
  authorize
};
