const pool = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Seeding ProjectFlow Database with Real Team & Portfolio Demo Data...');

  try {
    // Reset existing database tables cleanly
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    await pool.query('TRUNCATE TABLE notifications');
    await pool.query('TRUNCATE TABLE activity_logs');
    await pool.query('TRUNCATE TABLE attachments');
    await pool.query('TRUNCATE TABLE comments');
    await pool.query('TRUNCATE TABLE tasks');
    await pool.query('TRUNCATE TABLE project_members');
    await pool.query('TRUNCATE TABLE projects');
    await pool.query('TRUNCATE TABLE users');
    await pool.query('TRUNCATE TABLE positions');
    await pool.query('TRUNCATE TABLE roles');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🧹 Cleaned existing database tables');

    // 1. Roles
    const roles = [
      [1, 'Administrator', 'System administrator with full permissions to manage users, roles, positions, system settings, and inspect system logs.'],
      [2, 'Project Manager', 'Project manager responsible for creating and leading projects, defining tasks, assigning members, and tracking progress.'],
      [3, 'Member', 'Team member executing assigned project tasks, commenting, uploading files, and updating task statuses.']
    ];

    for (const [id, name, description] of roles) {
      await pool.query(`INSERT INTO roles (id, name, description) VALUES (?, ?, ?)`, [id, name, description]);
    }
    console.log('✅ Roles seeded');

    // 2. Job Positions
    const positions = [
      [1, 'System Administrator', 'Infrastructure, user access, and system security management', 1],
      [2, 'Project Manager', 'Project planning, scope management, team coordination, and delivery', 1],
      [3, 'Frontend Developer', 'User interface development, web components, and client-side integration', 1],
      [4, 'Backend Developer', 'Server architecture, RESTful API design, database and business logic', 1],
      [5, 'Fullstack Developer', 'End-to-end software development across client and server tech stack', 1],
      [6, 'UI/UX Designer', 'Product interface design, user flow research, prototyping, and design systems', 1],
      [7, 'Mobile Developer', 'Native and cross-platform mobile application development', 1],
      [8, 'QA Engineer', 'Quality assurance, manual testing, test automation, and bug tracking', 1],
      [9, 'DevOps Engineer', 'CI/CD deployment pipelines, containerization, cloud infrastructure, and monitoring', 1],
      [10, 'Data Analyst', 'Business metrics analysis, data visualization, reporting, and intelligence', 1],
      [11, 'Product Manager', 'Product strategy, roadmap definition, user research, and requirement specs', 1],
      [12, 'Content Writer', 'Technical documentation, UX copy, marketing text, and content creation', 1]
    ];

    for (const [id, name, description, is_active] of positions) {
      await pool.query(`INSERT INTO positions (id, name, description, is_active) VALUES (?, ?, ?, ?)`, [id, name, description, is_active]);
    }
    console.log('✅ Positions seeded');

    // 3. Demo Passwords
    const adminPassHash = await bcrypt.hash('DemoAdmin123!', 10);
    const managerPassHash = await bcrypt.hash('DemoManager123!', 10);
    const memberPassHash = await bcrypt.hash('DemoMember123!', 10);
    const defaultPassHash = await bcrypt.hash('password123', 10);

    // 4. Users (Team Members: Ryehan, Ravir, Yosiana, Rivai + Portfolio Demo Accounts)
    const users = [
      // Portfolio Demo Accounts
      [10, 'Demo Administrator', 'demo-admin@projectflow.demo', adminPassHash, 1, 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Active'],
      [11, 'Demo Project Manager', 'demo-manager@projectflow.demo', managerPassHash, 2, 2, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Active'],
      [12, 'Demo Member', 'demo-member@projectflow.demo', memberPassHash, 3, 3, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Active'],

      // Real Team Accounts (Ryehan, Ravir, Yosiana, Rivai)
      [1, 'Ryehan Alfiansyah', 'admin@gmail.com', defaultPassHash, 1, 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Active'],
      [2, 'Ravir', 'ravir@gmail.com', defaultPassHash, 2, 2, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Active'],
      [3, 'Yosiana', 'yosiana@gmail.com', defaultPassHash, 3, 6, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 'Active'],
      [4, 'Rivai', 'rivai@gmail.com', defaultPassHash, 3, 4, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Active']
    ];

    for (const [id, name, email, password, role_id, position_id, avatar, status] of users) {
      await pool.query(
        `INSERT INTO users (id, name, email, password, role_id, position_id, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, email, password, role_id, position_id, avatar, status]
      );
    }
    console.log('✅ Team Users seeded (Ryehan, Ravir, Yosiana, Rivai & Demo accounts)');

    // 5. Projects (Managed by Ravir ID: 2 & Demo PM ID: 11)
    const projects = [
      [1, 'Website Company Profile', 'Redesign and development of modern corporate web application with interactive product showcase, lead generator, and customer portal.', 'PT Telkom Indonesia', '2026-08-01', '2026-09-30', 'On Going', 2],
      [2, 'E-Commerce Mobile Application', 'Cross-platform mobile app development with real-time inventory management, payment gateway integration, and order tracking.', 'Tokopedia Marketplace', '2026-07-15', '2026-10-15', 'On Going', 2],
      [3, 'Internal Logistics Dashboard', 'Enterprise resource analytics dashboard for monitoring fleet status, supply chain routes, and delivery efficiency metrics.', 'JNE Express', '2026-06-01', '2026-08-15', 'Completed', 11],
      [4, 'SaaS Analytics Platform', 'Cloud-based multi-tenant analytics dashboard with automated PDF reporting and real-time WebSocket metrics.', 'ProjectFlow Tech', '2026-08-05', '2026-11-01', 'On Going', 11]
    ];

    for (const [id, name, description, client_name, start_date, due_date, status, project_manager_id] of projects) {
      await pool.query(
        `INSERT INTO projects (id, name, description, client_name, start_date, due_date, status, project_manager_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, description, client_name, start_date, due_date, status, project_manager_id]
      );
    }
    console.log('✅ Projects seeded');

    // 6. Project Members (Yosiana ID: 3, Rivai ID: 4, Demo Member ID: 12)
    const projectMembers = [
      [1, 1, 3],  // Yosiana (UI/UX) in Project 1
      [2, 1, 4],  // Rivai (Backend) in Project 1
      [3, 1, 12], // Demo Member (Frontend) in Project 1
      [4, 2, 3],  // Yosiana in Project 2
      [5, 2, 4],  // Rivai in Project 2
      [6, 2, 12], // Demo Member in Project 2
      [7, 3, 3],  // Yosiana in Project 3
      [8, 3, 4],  // Rivai in Project 3
      [9, 4, 12]  // Demo Member in Project 4
    ];

    for (const [id, project_id, user_id] of projectMembers) {
      await pool.query(`INSERT INTO project_members (id, project_id, user_id) VALUES (?, ?, ?)`, [id, project_id, user_id]);
    }
    console.log('✅ Project Members seeded');

    // 7. Tasks
    const tasks = [
      // Project 1 Tasks
      [1, 1, 'Design Figma Wireframes & UI Kit', 'Create high-fidelity wireframes and component library in Figma.', 3, 6, 'High', 'Completed', '2026-08-01', '2026-08-10', 2],
      [2, 1, 'Create REST API Authentication', 'Implement JWT token generation, bcrypt password hashing, login & logout routes.', 4, 4, 'Urgent', 'In Progress', '2026-08-02', '2026-08-08', 2],
      [3, 1, 'Build Homepage', 'Build responsive hero section, feature cards, pricing tiers, and client logos using Tailwind CSS.', 12, 3, 'High', 'Todo', '2026-08-05', '2026-08-18', 2],
      [4, 1, 'Implement Navbar', 'Develop sticky header navbar with notifications drawer, user avatar dropdown, and responsive mobile menu.', 12, 3, 'Medium', 'In Progress', '2026-08-09', '2026-08-20', 2],
      [5, 1, 'Responsive Dashboard', 'Optimize dashboard grid layout for mobile tablets and high-DPI desktop viewports.', 12, 3, 'Urgent', 'Review', '2026-08-07', '2026-08-14', 2],
      [6, 1, 'Fix Mobile Layout', 'Fix padding overflow and font scaling issues on mobile Safari browser.', 12, 3, 'Low', 'Completed', '2026-08-02', '2026-08-10', 2],

      // Project 2 Tasks
      [7, 2, 'Mobile Product Catalog UI Wireframes', 'Design mobile shopping screen flow, filtering drawer, and product details view.', 3, 6, 'High', 'Completed', '2026-07-16', '2026-07-25', 2],
      [8, 2, 'Setup Express E-Commerce Microservice', 'Build REST endpoints for products catalog, category taxonomy, and full-text search.', 4, 4, 'Urgent', 'In Progress', '2026-07-26', '2026-08-22', 2],
      [9, 2, 'React Native Product Search Component', 'Develop search bar with debounce, instant auto-suggestions, and filter badges.', 12, 3, 'Medium', 'Todo', '2026-08-12', '2026-08-26', 2],

      // Project 3 Tasks
      [10, 3, 'Fleet Tracker Database Schema', 'Design normalized MySQL database tables for vehicles, routes, drivers, and delivery logs.', 4, 4, 'High', 'Completed', '2026-06-02', '2026-06-12', 11],
      [11, 3, 'Build Real-time Map Dashboard UI', 'Implement Leaflet/Mapbox map component showing live GPS vehicle locations.', 3, 6, 'Urgent', 'Completed', '2026-06-13', '2026-07-05', 11]
    ];

    for (const [id, project_id, title, description, assigned_to, required_position_id, priority, status, start_date, due_date, created_by] of tasks) {
      await pool.query(
        `INSERT INTO tasks (id, project_id, title, description, assigned_to, required_position_id, priority, status, start_date, due_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, project_id, title, description, assigned_to, required_position_id, priority, status, start_date, due_date, created_by]
      );
    }
    console.log('✅ Tasks seeded');

    // 8. Comments
    const comments = [
      [1, 1, 3, 'Wireframes and Figma design system components are updated and ready for review!', '2026-08-05 14:20:00'],
      [2, 2, 4, 'Authentication REST endpoints are tested on Postman and ready for integration.', '2026-08-08 11:45:00'],
      [3, 4, 12, 'Implement Navbar is currently in progress. Mobile drawer menu completed!', '2026-08-10 16:30:00']
    ];

    for (const [id, task_id, user_id, content, created_at] of comments) {
      await pool.query(`INSERT INTO comments (id, task_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)`, [id, task_id, user_id, content, created_at]);
    }
    console.log('✅ Comments seeded');

    // 9. Activity Logs
    const activities = [
      [1, 2, 1, 'Project', 1, 'Created', 'Ravir created project "Website Company Profile"', '2026-08-01 09:00:00'],
      [2, 2, 1, 'Member', 3, 'Added', 'Ravir added Yosiana (UI/UX Designer) to Website Company Profile', '2026-08-01 09:05:00'],
      [3, 2, 1, 'Member', 4, 'Added', 'Ravir added Rivai (Backend Developer) to Website Company Profile', '2026-08-01 09:10:00'],
      [4, 3, 1, 'Task', 1, 'Status Updated', 'Yosiana moved "Design Figma Wireframes & UI Kit" to Completed', '2026-08-05 11:30:00'],
      [5, 4, 1, 'Task', 2, 'Status Updated', 'Rivai moved "Create REST API Authentication" to In Progress', '2026-08-08 14:00:00']
    ];

    for (const [id, user_id, project_id, entity_type, entity_id, action, description, created_at] of activities) {
      await pool.query(
        `INSERT INTO activity_logs (id, user_id, project_id, entity_type, entity_id, action, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, user_id, project_id, entity_type, entity_id, action, description, created_at]
      );
    }
    console.log('✅ Activity Logs seeded');

    // 10. Notifications
    const notifications = [
      [1, 3, 'task_assigned', 'You have been assigned task "Design Figma Wireframes & UI Kit"', 1, '2026-08-01 09:00:00'],
      [2, 4, 'task_assigned', 'You have been assigned task "Create REST API Authentication"', 0, '2026-08-02 10:00:00'],
      [3, 12, 'task_assigned', 'You have been assigned task "Build Homepage"', 0, '2026-08-05 10:00:00']
    ];

    for (const [id, user_id, type, message, is_read, created_at] of notifications) {
      await pool.query(`INSERT INTO notifications (id, user_id, type, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?)`, [id, user_id, type, message, is_read, created_at]);
    }
    console.log('✅ Notifications seeded');

    console.log('🎉 ProjectFlow Database Seeded with Ravir, Yosiana, Rivai, Ryehan & Portfolio Demo Accounts!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

if (require.main === module) {
  seed().then(() => process.exit(0));
}

module.exports = seed;
