const pool = require('../config/database');

const getRoles = async (req, res) => {
  try {
    const [roles] = await pool.query('SELECT * FROM roles ORDER BY id ASC');
    return res.status(200).json({
      success: true,
      message: 'Daftar role berhasil diambil.',
      data: roles
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data role.'
    });
  }
};

module.exports = {
  getRoles
};
