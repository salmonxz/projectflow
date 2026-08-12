const pool = require('../config/database');

const getPositions = async (req, res) => {
  try {
    const { activeOnly } = req.query;
    let query = 'SELECT * FROM positions';
    const params = [];

    if (activeOnly === 'true') {
      query += ' WHERE is_active = 1';
    }

    query += ' ORDER BY name ASC';

    const [positions] = await pool.query(query, params);
    return res.status(200).json({
      success: true,
      message: 'Daftar Job Position berhasil diambil.',
      data: positions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data Job Position.'
    });
  }
};

const createPosition = async (req, res) => {
  try {
    const { name, description, is_active = 1 } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, message: 'Nama Job Position wajib diisi.' });
    }

    const [existing] = await pool.query('SELECT id FROM positions WHERE name = ?', [name.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Nama Job Position sudah ada.' });
    }

    const [result] = await pool.query(
      'INSERT INTO positions (name, description, is_active) VALUES (?, ?, ?)',
      [name.trim(), description || null, is_active ? 1 : 0]
    );

    return res.status(201).json({
      success: true,
      message: 'Job Position berhasil ditambahkan.',
      data: { id: result.insertId, name: name.trim(), description, is_active: is_active ? 1 : 0 }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menambahkan Job Position.' });
  }
};

const updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const [pos] = await pool.query('SELECT * FROM positions WHERE id = ?', [id]);
    if (pos.length === 0) {
      return res.status(404).json({ success: false, message: 'Job Position tidak ditemukan.' });
    }

    if (name && name.trim() !== pos[0].name) {
      const [existing] = await pool.query('SELECT id FROM positions WHERE name = ? AND id != ?', [name.trim(), id]);
      if (existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Nama Job Position sudah digunakan.' });
      }
    }

    await pool.query(
      `UPDATE positions
       SET name = ?, description = ?, is_active = ?
       WHERE id = ?`,
      [
        name !== undefined ? name.trim() : pos[0].name,
        description !== undefined ? description : pos[0].description,
        is_active !== undefined ? (is_active ? 1 : 0) : pos[0].is_active,
        id
      ]
    );

    return res.status(200).json({
      success: true,
      message: 'Job Position berhasil diperbarui.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui Job Position.' });
  }
};

const deletePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const [pos] = await pool.query('SELECT * FROM positions WHERE id = ?', [id]);
    if (pos.length === 0) {
      return res.status(404).json({ success: false, message: 'Job Position tidak ditemukan.' });
    }

    // Check if position is currently used by users
    const [users] = await pool.query('SELECT id FROM users WHERE position_id = ?', [id]);
    if (users.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak dapat menghapus Job Position ini karena sedang digunakan oleh beberapa pengguna. Anda dapat menonaktifkannya.'
      });
    }

    await pool.query('DELETE FROM positions WHERE id = ?', [id]);
    return res.status(200).json({
      success: true,
      message: 'Job Position berhasil dihapus.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus Job Position.' });
  }
};

module.exports = {
  getPositions,
  createPosition,
  updatePosition,
  deletePosition
};
