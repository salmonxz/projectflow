const pool = require('../config/database');
const { logActivity } = require('../services/activityService');
const { createNotification } = require('../services/notificationService');

const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const [comments] = await pool.query(
      `SELECT c.id, c.task_id, c.user_id, c.content, c.created_at, c.updated_at,
              u.name AS user_name, u.avatar AS user_avatar, pos.name AS user_position
       FROM comments c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN positions pos ON u.position_id = pos.id
       WHERE c.task_id = ?
       ORDER BY c.created_at ASC`,
      [taskId]
    );

    return res.status(200).json({
      success: true,
      message: 'Komentar berhasil diambil.',
      data: comments
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil komentar task.' });
  }
};

const addComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Isi komentar tidak boleh kosong.' });
    }

    const [tasks] = await pool.query(
      `SELECT t.id, t.title, t.project_id, t.assigned_to, p.project_manager_id
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = ?`,
      [taskId]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Task tidak ditemukan.' });
    }

    const task = tasks[0];

    const [result] = await pool.query(
      `INSERT INTO comments (task_id, user_id, content) VALUES (?, ?, ?)`,
      [taskId, req.user.id, content.trim()]
    );

    const commentId = result.insertId;

    // Log Activity
    await logActivity({
      userId: req.user.id,
      projectId: task.project_id,
      entityType: 'Comment',
      entityId: commentId,
      action: 'Added',
      description: `${req.user.name} menambahkan komentar pada task "${task.title}"`
    });

    // Notify Task Assignee if different from commenter
    if (task.assigned_to && task.assigned_to !== req.user.id) {
      await createNotification({
        userId: task.assigned_to,
        type: 'comment_added',
        message: `${req.user.name} berkomentar pada task Anda "${task.title}"`
      });
    }

    // Return new comment with user details
    const [newComment] = await pool.query(
      `SELECT c.id, c.task_id, c.user_id, c.content, c.created_at, c.updated_at,
              u.name AS user_name, u.avatar AS user_avatar, pos.name AS user_position
       FROM comments c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN positions pos ON u.position_id = pos.id
       WHERE c.id = ?`,
      [commentId]
    );

    return res.status(201).json({
      success: true,
      message: 'Komentar berhasil ditambahkan.',
      data: newComment[0]
    });
  } catch (error) {
    console.error('addComment error:', error);
    return res.status(500).json({ success: false, message: 'Gagal menambahkan komentar.' });
  }
};

const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'Isi komentar tidak boleh kosong.' });
    }

    const [comments] = await pool.query('SELECT * FROM comments WHERE id = ?', [id]);
    if (comments.length === 0) {
      return res.status(404).json({ success: false, message: 'Komentar tidak ditemukan.' });
    }

    const comment = comments[0];

    // Ownership check: user can only edit their own comment
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Anda hanya dapat mengubah komentar milik Anda sendiri.' });
    }

    await pool.query('UPDATE comments SET content = ? WHERE id = ?', [content.trim(), id]);

    return res.status(200).json({
      success: true,
      message: 'Komentar berhasil diperbarui.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui komentar.' });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const [comments] = await pool.query('SELECT * FROM comments WHERE id = ?', [id]);
    if (comments.length === 0) {
      return res.status(404).json({ success: false, message: 'Komentar tidak ditemukan.' });
    }

    const comment = comments[0];

    // Ownership or Admin check
    if (comment.user_id !== req.user.id && req.user.role_name !== 'Administrator') {
      return res.status(403).json({ success: false, message: 'Anda hanya dapat menghapus komentar milik Anda sendiri.' });
    }

    await pool.query('DELETE FROM comments WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Komentar berhasil dihapus.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus komentar.' });
  }
};

module.exports = {
  getTaskComments,
  addComment,
  updateComment,
  deleteComment
};
