const pool = require('../config/database');
const { logActivity } = require('../services/activityService');
const { createNotification } = require('../services/notificationService');

// Get tasks for a specific project
const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status, priority, assigned_to, required_position_id, search } = req.query;

    let query = `
      SELECT t.id, t.project_id, t.title, t.description, t.assigned_to, t.required_position_id,
             t.priority, t.status, t.start_date, t.due_date, t.created_by, t.created_at, t.updated_at,
             u.name AS assignee_name, u.avatar AS assignee_avatar, u.email AS assignee_email,
             pos_user.name AS assignee_position,
             req_pos.name AS required_position_name,
             p.name AS project_name,
             (SELECT COUNT(*) FROM comments c WHERE c.task_id = t.id) AS comments_count,
             (SELECT COUNT(*) FROM attachments a WHERE a.task_id = t.id) AS attachments_count
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN positions pos_user ON u.position_id = pos_user.id
      LEFT JOIN positions req_pos ON t.required_position_id = req_pos.id
      WHERE t.project_id = ?
    `;
    const params = [projectId];

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }
    if (priority) {
      query += ` AND t.priority = ?`;
      params.push(priority);
    }
    if (assigned_to) {
      query += ` AND t.assigned_to = ?`;
      params.push(assigned_to);
    }
    if (required_position_id) {
      query += ` AND t.required_position_id = ?`;
      params.push(required_position_id);
    }
    if (search) {
      query += ` AND (t.title LIKE ? OR t.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY t.due_date ASC, t.id DESC`;

    const [tasks] = await pool.query(query, params);
    return res.status(200).json({
      success: true,
      message: 'Daftar task project berhasil diambil.',
      data: tasks
    });
  } catch (error) {
    console.error('getProjectTasks error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil task project.' });
  }
};

// Get tasks assigned to logged-in user or general search (for My Tasks & Calendar)
const getMyTasks = async (req, res) => {
  try {
    const currentUser = req.user;
    const { status, priority, project_id, search, calendar_view } = req.query;

    let query = `
      SELECT t.id, t.project_id, t.title, t.description, t.assigned_to, t.required_position_id,
             t.priority, t.status, t.start_date, t.due_date, t.created_by, t.created_at, t.updated_at,
             u.name AS assignee_name, u.avatar AS assignee_avatar,
             req_pos.name AS required_position_name,
             p.name AS project_name, p.status AS project_status
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      LEFT JOIN positions req_pos ON t.required_position_id = req_pos.id
      WHERE 1=1
    `;
    const params = [];

    if (currentUser.role_name === 'Member') {
      query += ` AND t.assigned_to = ?`;
      params.push(currentUser.id);
    } else if (req.query.assigned_only === 'true') {
      query += ` AND t.assigned_to = ?`;
      params.push(currentUser.id);
    }

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }
    if (priority) {
      query += ` AND t.priority = ?`;
      params.push(priority);
    }
    if (project_id) {
      query += ` AND t.project_id = ?`;
      params.push(project_id);
    }
    if (search) {
      query += ` AND (t.title LIKE ? OR t.description LIKE ? OR p.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY t.due_date ASC`;

    const [tasks] = await pool.query(query, params);
    return res.status(200).json({
      success: true,
      message: 'Daftar task berhasil diambil.',
      data: tasks
    });
  } catch (error) {
    console.error('getMyTasks error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data task.' });
  }
};

// Get single task detail with comments and attachments
const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const [tasks] = await pool.query(
      `SELECT t.id, t.project_id, t.title, t.description, t.assigned_to, t.required_position_id,
              t.priority, t.status, t.start_date, t.due_date, t.created_by, t.created_at, t.updated_at,
              u.name AS assignee_name, u.email AS assignee_email, u.avatar AS assignee_avatar,
              pos_user.name AS assignee_position,
              req_pos.name AS required_position_name,
              p.name AS project_name, p.project_manager_id,
              creator.name AS creator_name
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN positions pos_user ON u.position_id = pos_user.id
       LEFT JOIN positions req_pos ON t.required_position_id = req_pos.id
       LEFT JOIN users creator ON t.created_by = creator.id
       WHERE t.id = ?`,
      [id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Task tidak ditemukan.' });
    }

    const task = tasks[0];

    // Comments
    const [comments] = await pool.query(
      `SELECT c.id, c.task_id, c.user_id, c.content, c.created_at, c.updated_at,
              u.name AS user_name, u.avatar AS user_avatar, pos.name AS user_position
       FROM comments c
       JOIN users u ON c.user_id = u.id
       LEFT JOIN positions pos ON u.position_id = pos.id
       WHERE c.task_id = ?
       ORDER BY c.created_at ASC`,
      [id]
    );

    // Attachments
    const [attachments] = await pool.query(
      `SELECT a.id, a.task_id, a.uploaded_by, a.file_name, a.file_path, a.file_type, a.file_size, a.created_at,
              u.name AS uploader_name
       FROM attachments a
       JOIN users u ON a.uploaded_by = u.id
       WHERE a.task_id = ?
       ORDER BY a.created_at DESC`,
      [id]
    );

    // Task Activity History
    const [activities] = await pool.query(
      `SELECT al.id, al.user_id, al.action, al.description, al.created_at, u.name AS user_name
       FROM activity_logs al
       JOIN users u ON al.user_id = u.id
       WHERE al.entity_type = 'Task' AND al.entity_id = ?
       ORDER BY al.created_at DESC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: 'Detail task berhasil diambil.',
      data: {
        ...task,
        comments,
        attachments,
        activities
      }
    });
  } catch (error) {
    console.error('getTaskById error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail task.' });
  }
};

// Create Task
const createTask = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.body.project_id;
    const { title, description, assigned_to, required_position_id, priority = 'Medium', status = 'Todo', start_date, due_date } = req.body;

    if (!projectId) {
      return res.status(400).json({ success: false, message: 'Project ID wajib ditentukan.' });
    }

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Judul task wajib diisi.' });
    }

    const [projects] = await pool.query('SELECT name FROM projects WHERE id = ?', [projectId]);
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project tidak ditemukan.' });
    }

    // Verify assigned user is member of project if provided
    if (assigned_to) {
      const [isMember] = await pool.query('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, assigned_to]);
      if (isMember.length === 0) {
        return res.status(400).json({ success: false, message: 'Pengguna yang ditugaskan harus merupakan anggota project ini.' });
      }
    }

    if (start_date && due_date && new Date(due_date) < new Date(start_date)) {
      return res.status(400).json({ success: false, message: 'Tenggat waktu task tidak boleh sebelum tanggal mulai.' });
    }

    const [result] = await pool.query(
      `INSERT INTO tasks (project_id, title, description, assigned_to, required_position_id, priority, status, start_date, due_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        title.trim(),
        description || null,
        assigned_to || null,
        required_position_id || null,
        priority,
        status,
        start_date || null,
        due_date || null,
        req.user.id
      ]
    );

    const taskId = result.insertId;

    // Log Activity
    await logActivity({
      userId: req.user.id,
      projectId: projectId,
      entityType: 'Task',
      entityId: taskId,
      action: 'Created',
      description: `${req.user.name} membuat task "${title.trim()}" pada project "${projects[0].name}"`
    });

    // Notify assigned user
    if (assigned_to) {
      await createNotification({
        userId: assigned_to,
        type: 'task_assigned',
        message: `Anda mendapat task baru "${title.trim()}" di project "${projects[0].name}"`
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Task berhasil dibuat.',
      data: { id: taskId, title, status, priority }
    });
  } catch (error) {
    console.error('createTask error:', error);
    return res.status(500).json({ success: false, message: 'Gagal membuat task baru.' });
  }
};

// Update Task
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, assigned_to, required_position_id, priority, status, start_date, due_date } = req.body;

    const [tasks] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Task tidak ditemukan.' });
    }

    const task = tasks[0];

    // Verify assigned user if changed
    if (assigned_to && assigned_to !== task.assigned_to) {
      const [isMember] = await pool.query('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?', [task.project_id, assigned_to]);
      if (isMember.length === 0) {
        return res.status(400).json({ success: false, message: 'Pengguna yang ditugaskan harus merupakan anggota project ini.' });
      }
    }

    const updatedStartDate = start_date !== undefined ? start_date : task.start_date;
    const updatedDueDate = due_date !== undefined ? due_date : task.due_date;

    if (updatedStartDate && updatedDueDate && new Date(updatedDueDate) < new Date(updatedStartDate)) {
      return res.status(400).json({ success: false, message: 'Tenggat waktu task tidak boleh sebelum tanggal mulai.' });
    }

    await pool.query(
      `UPDATE tasks
       SET title = ?, description = ?, assigned_to = ?, required_position_id = ?, priority = ?, status = ?, start_date = ?, due_date = ?
       WHERE id = ?`,
      [
        title !== undefined ? title.trim() : task.title,
        description !== undefined ? description : task.description,
        assigned_to !== undefined ? (assigned_to || null) : task.assigned_to,
        required_position_id !== undefined ? (required_position_id || null) : task.required_position_id,
        priority !== undefined ? priority : task.priority,
        status !== undefined ? status : task.status,
        updatedStartDate || null,
        updatedDueDate || null,
        id
      ]
    );

    // Activity Log & Notification for assignee change
    if (assigned_to && assigned_to !== task.assigned_to) {
      const [assignedUser] = await pool.query('SELECT name FROM users WHERE id = ?', [assigned_to]);
      await logActivity({
        userId: req.user.id,
        projectId: task.project_id,
        entityType: 'Task',
        entityId: id,
        action: 'Reassigned',
        description: `${req.user.name} menugaskan task "${task.title}" kepada ${assignedUser[0]?.name}`
      });

      await createNotification({
        userId: assigned_to,
        type: 'task_assigned',
        message: `Anda ditugaskan pada task "${task.title}"`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task berhasil diperbarui.'
    });
  } catch (error) {
    console.error('updateTask error:', error);
    return res.status(500).json({ success: false, message: 'Gagal memperbarui task.' });
  }
};

// Update Task Status (Kanban / Detail status change)
const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Todo', 'In Progress', 'Review', 'Completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status task tidak valid.' });
    }

    const [tasks] = await pool.query(
      `SELECT t.*, p.name AS project_name, p.project_manager_id
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.id = ?`,
      [id]
    );

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Task tidak ditemukan.' });
    }

    const task = tasks[0];

    // Authorization: Administrator cannot manage or update task status. Member can only update tasks assigned to them.
    if (req.user.role_name === 'Administrator') {
      return res.status(403).json({ success: false, message: 'Administrator tidak memiliki wewenang untuk mengelola atau mengubah status task.' });
    }
    if (req.user.role_name === 'Member' && task.assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Anda hanya dapat mengubah status task yang ditugaskan kepada Anda.' });
    }

    const oldStatus = task.status;
    if (oldStatus === status) {
      return res.status(200).json({ success: true, message: 'Status task tidak berubah.', data: task });
    }

    await pool.query('UPDATE tasks SET status = ? WHERE id = ?', [status, id]);

    // Log Activity
    await logActivity({
      userId: req.user.id,
      projectId: task.project_id,
      entityType: 'Task',
      entityId: id,
      action: 'Status Updated',
      description: `${req.user.name} memindahkan task "${task.title}" dari ${oldStatus} ke ${status}`
    });

    // Notify Project Manager or Assignee if status changed by member
    if (req.user.id !== task.project_manager_id) {
      await createNotification({
        userId: task.project_manager_id,
        type: 'status_changed',
        message: `${req.user.name} mengubah status task "${task.title}" menjadi ${status}`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Status task berhasil diubah menjadi ${status}.`,
      data: { id: parseInt(id), status }
    });
  } catch (error) {
    console.error('updateTaskStatus error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengubah status task.' });
  }
};

// Delete Task
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const [tasks] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'Task tidak ditemukan.' });
    }

    const task = tasks[0];
    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    await logActivity({
      userId: req.user.id,
      projectId: task.project_id,
      entityType: 'Task',
      entityId: id,
      action: 'Deleted',
      description: `${req.user.name} menghapus task "${task.title}"`
    });

    return res.status(200).json({
      success: true,
      message: 'Task berhasil dihapus.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus task.' });
  }
};

// Position Suggestion Helper Endpoint: returns members of project matching position_id
const suggestMembersForTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { position_id } = req.query;

    let query = `
      SELECT u.id, u.name, u.email, u.avatar, pos.name AS position_name, pos.id AS position_id
      FROM project_members pm
      JOIN users u ON pm.user_id = u.id
      LEFT JOIN positions pos ON u.position_id = pos.id
      WHERE pm.project_id = ?
    `;
    const params = [projectId];

    if (position_id) {
      query += ` AND u.position_id = ?`;
      params.push(position_id);
    }

    query += ` ORDER BY u.name ASC`;

    const [suggestedMembers] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      message: 'Daftar rekomendasi anggota berhasil diambil.',
      data: suggestedMembers
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil rekomendasi anggota.' });
  }
};

module.exports = {
  getProjectTasks,
  getMyTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  suggestMembersForTask
};
