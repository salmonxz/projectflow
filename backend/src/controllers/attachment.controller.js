const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const { logActivity } = require('../services/activityService');

const getTaskAttachments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const [attachments] = await pool.query(
      `SELECT a.id, a.task_id, a.uploaded_by, a.file_name, a.file_path, a.file_type, a.file_size, a.created_at,
              u.name AS uploader_name
       FROM attachments a
       JOIN users u ON a.uploaded_by = u.id
       WHERE a.task_id = ?
       ORDER BY a.created_at DESC`,
      [taskId]
    );

    return res.status(200).json({
      success: true,
      message: 'Lampiran file berhasil diambil.',
      data: attachments
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil lampiran file.' });
  }
};

const uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Pilih file yang ingin diunggah.' });
    }

    const [tasks] = await pool.query(
      `SELECT t.id, t.title, t.project_id FROM tasks t WHERE t.id = ?`,
      [taskId]
    );

    if (tasks.length === 0) {
      // Remove uploaded file if task invalid
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Task tidak ditemukan.' });
    }

    const task = tasks[0];
    const filePath = `/uploads/${path.basename(req.file.path)}`;

    const [result] = await pool.query(
      `INSERT INTO attachments (task_id, uploaded_by, file_name, file_path, file_type, file_size)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [taskId, req.user.id, req.file.originalname, filePath, req.file.mimetype, req.file.size]
    );

    const attachmentId = result.insertId;

    // Log Activity
    await logActivity({
      userId: req.user.id,
      projectId: task.project_id,
      entityType: 'Attachment',
      entityId: attachmentId,
      action: 'Uploaded',
      description: `${req.user.name} mengunggah file "${req.file.originalname}" pada task "${task.title}"`
    });

    const [newAttachment] = await pool.query(
      `SELECT a.id, a.task_id, a.uploaded_by, a.file_name, a.file_path, a.file_type, a.file_size, a.created_at,
              u.name AS uploader_name
       FROM attachments a
       JOIN users u ON a.uploaded_by = u.id
       WHERE a.id = ?`,
      [attachmentId]
    );

    return res.status(201).json({
      success: true,
      message: 'File berhasil diunggah.',
      data: newAttachment[0]
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('uploadAttachment error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengunggah file.' });
  }
};

const deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    const [attachments] = await pool.query(
      `SELECT a.*, t.project_id, p.project_manager_id
       FROM attachments a
       JOIN tasks t ON a.task_id = t.id
       JOIN projects p ON t.project_id = p.id
       WHERE a.id = ?`,
      [id]
    );

    if (attachments.length === 0) {
      return res.status(404).json({ success: false, message: 'File lampiran tidak ditemukan.' });
    }

    const attachment = attachments[0];

    // Authorization check: Uploader, Project Manager, or Admin
    if (
      attachment.uploaded_by !== req.user.id &&
      attachment.project_manager_id !== req.user.id &&
      req.user.role_name !== 'Administrator'
    ) {
      return res.status(403).json({ success: false, message: 'Anda tidak memiliki izin menghapus file ini.' });
    }

    // Delete file from disk if exists
    const diskPath = path.join(__dirname, '../../', attachment.file_path);
    if (fs.existsSync(diskPath)) {
      try {
        fs.unlinkSync(diskPath);
      } catch (err) {
        console.error('Error deleting file from disk:', err.message);
      }
    }

    await pool.query('DELETE FROM attachments WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'File lampiran berhasil dihapus.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus file lampiran.' });
  }
};

module.exports = {
  getTaskAttachments,
  uploadAttachment,
  deleteAttachment
};
