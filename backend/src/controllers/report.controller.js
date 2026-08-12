const pool = require('../config/database');

const getDashboardStats = async (req, res) => {
  try {
    const user = req.user;
    let data = {};

    if (user.role_name === 'Administrator') {
      const [[{ total_users }]] = await pool.query(`SELECT COUNT(*) AS total_users FROM users`);
      const [[{ active_users }]] = await pool.query(`SELECT COUNT(*) AS active_users FROM users WHERE status = 'Active'`);
      const [[{ total_projects }]] = await pool.query(`SELECT COUNT(*) AS total_projects FROM projects`);
      const [[{ active_projects }]] = await pool.query(`SELECT COUNT(*) AS active_projects FROM projects WHERE status = 'On Going'`);
      const [[{ total_tasks }]] = await pool.query(`SELECT COUNT(*) AS total_tasks FROM tasks`);

      const [recent_activities] = await pool.query(
        `SELECT al.*, u.name AS user_name, u.avatar AS user_avatar, pos.name AS user_position
         FROM activity_logs al
         JOIN users u ON al.user_id = u.id
         LEFT JOIN positions pos ON u.position_id = pos.id
         ORDER BY al.created_at DESC LIMIT 10`
      );

      const [my_projects] = await pool.query(
        `SELECT p.*,
                (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS total_tasks,
                (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'Completed') AS completed_tasks
         FROM projects p
         ORDER BY p.updated_at DESC LIMIT 5`
      );

      const formattedMyProjects = my_projects.map(p => {
        const tot = parseInt(p.total_tasks) || 0;
        const comp = parseInt(p.completed_tasks) || 0;
        return {
          ...p,
          progress: tot > 0 ? Math.round((comp / tot) * 100) : 0
        };
      });

      data = {
        role: 'Administrator',
        total_users,
        active_users,
        total_projects,
        active_projects,
        total_tasks,
        my_projects: formattedMyProjects,
        recent_activities
      };
    } else if (user.role_name === 'Project Manager') {
      const [[{ total_projects }]] = await pool.query(`SELECT COUNT(*) AS total_projects FROM projects WHERE project_manager_id = ?`, [user.id]);
      const [[{ active_projects }]] = await pool.query(`SELECT COUNT(*) AS active_projects FROM projects WHERE project_manager_id = ? AND status = 'On Going'`, [user.id]);
      const [[{ completed_projects }]] = await pool.query(`SELECT COUNT(*) AS completed_projects FROM projects WHERE project_manager_id = ? AND status = 'Completed'`, [user.id]);

      const [[{ total_tasks }]] = await pool.query(
        `SELECT COUNT(*) AS total_tasks FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.project_manager_id = ?`,
        [user.id]
      );
      const [[{ completed_tasks }]] = await pool.query(
        `SELECT COUNT(*) AS completed_tasks FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.project_manager_id = ? AND t.status = 'Completed'`,
        [user.id]
      );
      const [[{ overdue_tasks }]] = await pool.query(
        `SELECT COUNT(*) AS overdue_tasks FROM tasks t JOIN projects p ON t.project_id = p.id WHERE p.project_manager_id = ? AND t.status != 'Completed' AND t.due_date < CURDATE()`,
        [user.id]
      );

      const [my_projects] = await pool.query(
        `SELECT p.*,
                (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS total_tasks,
                (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'Completed') AS completed_tasks
         FROM projects p
         WHERE p.project_manager_id = ?
         ORDER BY p.updated_at DESC LIMIT 5`,
        [user.id]
      );

      const formattedMyProjects = my_projects.map(p => {
        const tot = parseInt(p.total_tasks) || 0;
        const comp = parseInt(p.completed_tasks) || 0;
        return {
          ...p,
          progress: tot > 0 ? Math.round((comp / tot) * 100) : 0
        };
      });

      const [recent_activities] = await pool.query(
        `SELECT al.*, u.name AS user_name, u.avatar AS user_avatar, pos.name AS user_position
         FROM activity_logs al
         JOIN users u ON al.user_id = u.id
         LEFT JOIN positions pos ON u.position_id = pos.id
         WHERE al.project_id IN (SELECT id FROM projects WHERE project_manager_id = ?)
         ORDER BY al.created_at DESC LIMIT 10`,
        [user.id]
      );

      data = {
        role: 'Project Manager',
        total_projects,
        active_projects,
        completed_projects,
        total_tasks,
        completed_tasks,
        overdue_tasks,
        my_projects: formattedMyProjects,
        recent_activities
      };
    } else {
      const [[{ my_projects_count }]] = await pool.query(
        `SELECT COUNT(*) AS my_projects_count FROM project_members WHERE user_id = ?`,
        [user.id]
      );
      const [[{ my_active_tasks }]] = await pool.query(
        `SELECT COUNT(*) AS my_active_tasks FROM tasks WHERE assigned_to = ? AND status != 'Completed'`,
        [user.id]
      );
      const [[{ completed_tasks }]] = await pool.query(
        `SELECT COUNT(*) AS completed_tasks FROM tasks WHERE assigned_to = ? AND status = 'Completed'`,
        [user.id]
      );
      const [[{ overdue_tasks }]] = await pool.query(
        `SELECT COUNT(*) AS overdue_tasks FROM tasks WHERE assigned_to = ? AND status != 'Completed' AND due_date < CURDATE()`,
        [user.id]
      );

      const [my_projects] = await pool.query(
        `SELECT p.*, pm.joined_at,
                (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS total_tasks,
                (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'Completed') AS completed_tasks
         FROM project_members pm
         JOIN projects p ON pm.project_id = p.id
         WHERE pm.user_id = ?
         ORDER BY p.updated_at DESC LIMIT 5`,
        [user.id]
      );

      const formattedMyProjects = my_projects.map(p => {
        const tot = parseInt(p.total_tasks) || 0;
        const comp = parseInt(p.completed_tasks) || 0;
        return {
          ...p,
          progress: tot > 0 ? Math.round((comp / tot) * 100) : 0
        };
      });

      const [upcoming_deadlines] = await pool.query(
        `SELECT t.*, p.name AS project_name
         FROM tasks t
         JOIN projects p ON t.project_id = p.id
         WHERE t.assigned_to = ? AND t.status != 'Completed'
         ORDER BY t.due_date ASC LIMIT 5`,
        [user.id]
      );

      const [recent_activities] = await pool.query(
        `SELECT al.*, u.name AS user_name, u.avatar AS user_avatar
         FROM activity_logs al
         JOIN users u ON al.user_id = u.id
         WHERE al.project_id IN (SELECT project_id FROM project_members WHERE user_id = ?)
         ORDER BY al.created_at DESC LIMIT 10`,
        [user.id]
      );

      data = {
        role: 'Member',
        my_projects_count,
        my_active_tasks,
        completed_tasks,
        overdue_tasks,
        my_projects: formattedMyProjects,
        upcoming_deadlines,
        recent_activities
      };
    }

    return res.status(200).json({
      success: true,
      message: 'Statistik dashboard berhasil diambil.',
      data
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil statistik dashboard.' });
  }
};

const getWorkloadReport = async (req, res) => {
  try {
    const { project_id } = req.query;

    let projectFilter = '';
    const queryParams = [];

    if (project_id) {
      projectFilter = ' WHERE t.project_id = ?';
      queryParams.push(project_id);
    }

    // 1. KPI Summary
    let totalProjectsQuery = 'SELECT COUNT(*) AS total FROM projects';
    let activeProjectsQuery = "SELECT COUNT(*) AS total FROM projects WHERE status = 'On Going'";
    let completedProjectsQuery = "SELECT COUNT(*) AS total FROM projects WHERE status = 'Completed'";
    
    if (project_id) {
      totalProjectsQuery += ` WHERE id = ${pool.escape(project_id)}`;
      activeProjectsQuery += ` AND id = ${pool.escape(project_id)}`;
      completedProjectsQuery += ` AND id = ${pool.escape(project_id)}`;
    }

    const [[{ total: total_projects }]] = await pool.query(totalProjectsQuery);
    const [[{ total: active_projects }]] = await pool.query(activeProjectsQuery);
    const [[{ total: completed_projects }]] = await pool.query(completedProjectsQuery);

    let totalTasksQuery = `SELECT COUNT(*) AS total FROM tasks t ${projectFilter}`;
    let completedTasksQuery = `SELECT COUNT(*) AS total FROM tasks t WHERE t.status = 'Completed' ${project_id ? 'AND t.project_id = ?' : ''}`;
    let overdueTasksQuery = `SELECT COUNT(*) AS total FROM tasks t WHERE t.status != 'Completed' AND t.due_date < CURDATE() ${project_id ? 'AND t.project_id = ?' : ''}`;

    const [[{ total: total_tasks }]] = await pool.query(totalTasksQuery, queryParams);
    const [[{ total: completed_tasks }]] = await pool.query(completedTasksQuery, queryParams);
    const [[{ total: overdue_tasks }]] = await pool.query(overdueTasksQuery, queryParams);

    const totTasks = parseInt(total_tasks) || 0;
    const compTasks = parseInt(completed_tasks) || 0;
    const completion_rate = totTasks > 0 ? Math.round((compTasks / totTasks) * 100) : 0;

    // 2. Task Status Distribution (Todo, In Progress, Review, Completed)
    const statuses = ['Todo', 'In Progress', 'Review', 'Completed'];
    const [statusRows] = await pool.query(
      `SELECT t.status, COUNT(*) AS count FROM tasks t ${projectFilter} GROUP BY t.status`,
      queryParams
    );

    const statusMap = new Map(statusRows.map(r => [r.status, parseInt(r.count)]));
    const task_status_distribution = statuses.map(st => ({
      status: st,
      count: statusMap.get(st) || 0
    }));

    // 3. Task Priority Distribution (Low, Medium, High, Urgent)
    const priorities = ['Low', 'Medium', 'High', 'Urgent'];
    const [priorityRows] = await pool.query(
      `SELECT t.priority, COUNT(*) AS count FROM tasks t ${projectFilter} GROUP BY t.priority`,
      queryParams
    );
    const priorityMap = new Map(priorityRows.map(r => [r.priority, parseInt(r.count)]));
    const task_priority_distribution = priorities.map(pr => ({
      priority: pr,
      count: priorityMap.get(pr) || 0
    }));

    // 4. Position Workload (Tasks per Job Position)
    const [positionRows] = await pool.query(
      `SELECT pos.name AS position_name,
              COUNT(t.id) AS total_tasks,
              SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS completed_tasks
       FROM positions pos
       LEFT JOIN users u ON u.position_id = pos.id
       LEFT JOIN tasks t ON t.assigned_to = u.id ${project_id ? 'AND t.project_id = ?' : ''}
       WHERE pos.is_active = 1
       GROUP BY pos.id, pos.name
       ORDER BY total_tasks DESC`,
      queryParams
    );

    const position_workload = positionRows.map(p => ({
      position_name: p.position_name,
      total_tasks: parseInt(p.total_tasks) || 0,
      completed_tasks: parseInt(p.completed_tasks) || 0
    }));

    // 5. Member Workload Table
    const [memberRows] = await pool.query(
      `SELECT u.id AS user_id, u.name AS user_name, u.email AS user_email, u.avatar AS user_avatar,
              pos.name AS position_name, r.name AS role_name,
              COUNT(t.id) AS total_assigned_tasks,
              SUM(CASE WHEN t.status = 'Todo' THEN 1 ELSE 0 END) AS todo_count,
              SUM(CASE WHEN t.status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_count,
              SUM(CASE WHEN t.status = 'Review' THEN 1 ELSE 0 END) AS review_count,
              SUM(CASE WHEN t.status = 'Completed' THEN 1 ELSE 0 END) AS completed_count
       FROM users u
       JOIN roles r ON u.role_id = r.id
       LEFT JOIN positions pos ON u.position_id = pos.id
       LEFT JOIN tasks t ON t.assigned_to = u.id ${project_id ? 'AND t.project_id = ?' : ''}
       WHERE u.status = 'Active' AND r.name != 'Administrator'
       GROUP BY u.id, u.name, u.email, u.avatar, pos.name, r.name
       ORDER BY total_assigned_tasks DESC, u.name ASC`,
      queryParams
    );

    const member_workload = memberRows.map(m => {
      const tot = parseInt(m.total_assigned_tasks) || 0;
      const comp = parseInt(m.completed_count) || 0;
      return {
        user_id: m.user_id,
        user_name: m.user_name,
        user_email: m.user_email,
        user_avatar: m.user_avatar,
        position_name: m.position_name || 'Member',
        role_name: m.role_name,
        total_assigned_tasks: tot,
        todo_count: parseInt(m.todo_count) || 0,
        in_progress_count: parseInt(m.in_progress_count) || 0,
        review_count: parseInt(m.review_count) || 0,
        completed_count: comp,
        completion_percentage: tot > 0 ? Math.round((comp / tot) * 100) : 0
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Laporan beban kerja dan statistik proyek berhasil diambil.',
      data: {
        summary: {
          total_projects,
          active_projects,
          completed_projects,
          total_tasks,
          completed_tasks,
          overdue_tasks,
          completion_rate
        },
        task_status_distribution,
        task_priority_distribution,
        position_workload,
        member_workload
      }
    });
  } catch (error) {
    console.error('getWorkloadReport error:', error);
    return res.status(500).json({ success: false, message: 'Gagal mengambil laporan beban kerja.' });
  }
};

module.exports = {
  getDashboardStats,
  getWorkloadReport
};
