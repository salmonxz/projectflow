const pool = require('../config/database');
const { logActivity } = require('../services/activityService');
const { createNotification } = require('../services/notificationService');

const getProjects = async (req, res) => {
  try {
    const { status, search, project_manager_id } = req.query;
    const currentUser = req.user;

    let query = `
      SELECT p.id, p.name, p.description, p.client_name, p.start_date, p.due_date, p.status, p.project_manager_id, p.created_at, p.updated_at,
             pm_user.name AS project_manager_name, pm_user.avatar AS project_manager_avatar,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS total_tasks,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'Completed') AS completed_tasks
      FROM projects p
      JOIN users pm_user ON p.project_manager_id = pm_user.id
      WHERE 1=1
    `;
    const params = [];

    // Access category restrictions
    if (currentUser.role_name === 'Member') {
      query += ` AND p.id IN (SELECT project_id FROM project_members WHERE user_id = ?)`;
      params.push(currentUser.id);
    } else if (currentUser.role_name === 'Project Manager') {
      query += ` AND (p.project_manager_id = ? OR p.id IN (SELECT project_id FROM project_members WHERE user_id = ?))`;
      params.push(currentUser.id, currentUser.id);
    }

    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }
    if (project_manager_id) {
      query += ` AND p.project_manager_id = ?`;
      params.push(project_manager_id);
    }
    if (search) {
      query += ` AND (p.name LIKE ? OR p.client_name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY p.created_at DESC`;

    const [projects] = await pool.query(query, params);

    // Calculate progress and attach member summary
    const formattedProjects = await Promise.all(
      projects.map(async (project) => {
        const total = parseInt(project.total_tasks) || 0;
        const completed = parseInt(project.completed_tasks) || 0;
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

        const [members] = await pool.query(
          `SELECT u.id, u.name, u.avatar, pos.name AS position_name
           FROM project_members pm
           JOIN users u ON pm.user_id = u.id
           LEFT JOIN positions pos ON u.position_id = pos.id
           WHERE pm.project_id = ?`,
          [project.id]
        );

        return {
          ...project,
          total_tasks: total,
          completed_tasks: completed,
          progress,
          members
        };
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Daftar project berhasil diambil.',
      data: formattedProjects
    });
  } catch (error) {
    console.error('getProjects error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil data project.' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const [projects] = await pool.query(
      `SELECT p.id, p.name, p.description, p.client_name, p.start_date, p.due_date, p.status, p.project_manager_id, p.created_at, p.updated_at,
              pm_user.name AS project_manager_name, pm_user.avatar AS project_manager_avatar, pm_user.email AS project_manager_email
       FROM projects p
       JOIN users pm_user ON p.project_manager_id = pm_user.id
       WHERE p.id = ?`,
      [id]
    );

    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project tidak ditemukan.' });
    }

    const project = projects[0];

    // Check member access
    if (currentUser.role_name === 'Member') {
      const [isMember] = await pool.query(
        'SELECT id FROM project_members WHERE project_id = ? AND user_id = ?',
        [id, currentUser.id]
      );
      if (isMember.length === 0) {
        return res.status(403).json({ success: false, message: 'Anda tidak memiliki akses ke project ini.' });
      }
    }

    // Get members
    const [members] = await pool.query(
      `SELECT u.id, u.name, u.email, u.avatar, u.status, pos.name AS position_name, pos.id AS position_id, pm.joined_at
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       LEFT JOIN positions pos ON u.position_id = pos.id
       WHERE pm.project_id = ?
       ORDER BY u.name ASC`,
      [id]
    );

    // Get task breakdown stats
    const [taskStats] = await pool.query(
      `SELECT 
         COUNT(*) AS total,
         SUM(CASE WHEN status = 'Todo' THEN 1 ELSE 0 END) AS todo,
         SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
         SUM(CASE WHEN status = 'Review' THEN 1 ELSE 0 END) AS review,
         SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed,
         SUM(CASE WHEN status != 'Completed' AND due_date < CURDATE() THEN 1 ELSE 0 END) AS overdue
       FROM tasks WHERE project_id = ?`,
      [id]
    );

    const stats = taskStats[0];
    const total = parseInt(stats.total) || 0;
    const completed = parseInt(stats.completed) || 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      message: 'Detail project berhasil diambil.',
      data: {
        ...project,
        progress,
        task_stats: {
          total: parseInt(stats.total) || 0,
          todo: parseInt(stats.todo) || 0,
          in_progress: parseInt(stats.in_progress) || 0,
          review: parseInt(stats.review) || 0,
          completed: parseInt(stats.completed) || 0,
          overdue: parseInt(stats.overdue) || 0
        },
        members
      }
    });
  } catch (error) {
    console.error('getProjectById error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil detail project.' });
  }
};

const createProject = async (req, res) => {
  try {
    const { name, description, client_name, start_date, due_date, status = 'Planning', project_manager_id } = req.body;

    if (!name || !start_date || !due_date) {
      return res.status(400).json({ success: false, message: 'Nama project, tanggal mulai, dan tenggat waktu wajib diisi.' });
    }

    if (new Date(due_date) < new Date(start_date)) {
      return res.status(400).json({ success: false, message: 'Tenggat waktu (due date) tidak boleh sebelum tanggal mulai (start date).' });
    }

    // Default project manager to current user if not specified or if logged in PM
    const pmId = req.user.role_name === 'Project Manager' ? req.user.id : (project_manager_id || req.user.id);

    const [result] = await pool.query(
      `INSERT INTO projects (name, description, client_name, start_date, due_date, status, project_manager_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), description || null, client_name || null, start_date, due_date, status, pmId]
    );

    const projectId = result.insertId;

    // Log Activity
    await logActivity({
      userId: req.user.id,
      projectId: projectId,
      entityType: 'Project',
      entityId: projectId,
      action: 'Created',
      description: `${req.user.name} membuat project "${name.trim()}"`
    });

    return res.status(201).json({
      success: true,
      message: 'Project berhasil dibuat.',
      data: { id: projectId, name, status }
    });
  } catch (error) {
    console.error('createProject error:', error);
    return res.status(500).json({ success: false, message: 'Gagal membuat project.' });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, client_name, start_date, due_date, status, project_manager_id } = req.body;

    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project tidak ditemukan.' });
    }

    const project = projects[0];

    // Check permission: Admin or the PM assigned to this project
    if (req.user.role_name === 'Project Manager' && project.project_manager_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Anda hanya dapat memperbarui project yang Anda kelola.' });
    }

    const updatedStartDate = start_date || project.start_date;
    const updatedDueDate = due_date || project.due_date;

    if (new Date(updatedDueDate) < new Date(updatedStartDate)) {
      return res.status(400).json({ success: false, message: 'Tenggat waktu (due date) tidak boleh sebelum tanggal mulai (start date).' });
    }

    await pool.query(
      `UPDATE projects
       SET name = ?, description = ?, client_name = ?, start_date = ?, due_date = ?, status = ?, project_manager_id = ?
       WHERE id = ?`,
      [
        name !== undefined ? name.trim() : project.name,
        description !== undefined ? description : project.description,
        client_name !== undefined ? client_name : project.client_name,
        updatedStartDate,
        updatedDueDate,
        status !== undefined ? status : project.status,
        project_manager_id !== undefined ? project_manager_id : project.project_manager_id,
        id
      ]
    );

    // Log Activity
    await logActivity({
      userId: req.user.id,
      projectId: id,
      entityType: 'Project',
      entityId: id,
      action: 'Updated',
      description: `${req.user.name} memperbarui data project "${name || project.name}"`
    });

    return res.status(200).json({
      success: true,
      message: 'Project berhasil diperbarui.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal memperbarui project.' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const [projects] = await pool.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project tidak ditemukan.' });
    }

    const project = projects[0];
    if (req.user.role_name === 'Project Manager' && project.project_manager_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Anda hanya dapat menghapus project yang Anda kelola.' });
    }

    await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    return res.status(200).json({
      success: true,
      message: 'Project berhasil dihapus.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus project.' });
  }
};

// Project Members Management
const getProjectMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const [members] = await pool.query(
      `SELECT u.id, u.name, u.email, u.avatar, pos.name AS position_name, pos.id AS position_id, pm.joined_at
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       LEFT JOIN positions pos ON u.position_id = pos.id
       WHERE pm.project_id = ?
       ORDER BY u.name ASC`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: 'Anggota project berhasil diambil.',
      data: members
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal mengambil anggota project.' });
  }
};

const addProjectMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'ID pengguna wajib dipilih.' });
    }

    const [projects] = await pool.query('SELECT name FROM projects WHERE id = ?', [id]);
    if (projects.length === 0) {
      return res.status(404).json({ success: false, message: 'Project tidak ditemukan.' });
    }

    const [users] = await pool.query('SELECT name FROM users WHERE id = ?', [user_id]);
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
    }

    const [existing] = await pool.query('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?', [id, user_id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Pengguna sudah menjadi anggota di project ini.' });
    }

    await pool.query('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [id, user_id]);

    // Activity & Notification
    await logActivity({
      userId: req.user.id,
      projectId: id,
      entityType: 'Member',
      entityId: user_id,
      action: 'Added',
      description: `${req.user.name} menambahkan ${users[0].name} ke project "${projects[0].name}"`
    });

    await createNotification({
      userId: user_id,
      type: 'project_added',
      message: `Anda telah ditambahkan ke project "${projects[0].name}" oleh ${req.user.name}`
    });

    return res.status(201).json({
      success: true,
      message: 'Anggota berhasil ditambahkan ke project.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menambahkan anggota ke project.' });
  }
};

const removeProjectMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const [members] = await pool.query('SELECT id FROM project_members WHERE project_id = ? AND user_id = ?', [id, userId]);
    if (members.length === 0) {
      return res.status(404).json({ success: false, message: 'Anggota tidak ditemukan di project ini.' });
    }

    const [users] = await pool.query('SELECT name FROM users WHERE id = ?', [userId]);
    const [projects] = await pool.query('SELECT name FROM projects WHERE id = ?', [id]);

    await pool.query('DELETE FROM project_members WHERE project_id = ? AND user_id = ?', [id, userId]);

    if (users.length > 0 && projects.length > 0) {
      await logActivity({
        userId: req.user.id,
        projectId: id,
        entityType: 'Member',
        entityId: userId,
        action: 'Removed',
        description: `${req.user.name} menghapus ${users[0].name} dari project "${projects[0].name}"`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Anggota berhasil dihapus dari project.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Gagal menghapus anggota dari project.' });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  removeProjectMember
};
