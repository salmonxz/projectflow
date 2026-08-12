const pool = require('../src/config/database');
const bcrypt = require('bcryptjs');

async function seed() {
  console.log('🌱 Seeding ProjectFlow Database with Portfolio Demo Data...');

  try {
    // 1. Roles
    const roles = [
      [1, 'Administrator', 'System administrator with full permissions to manage users, roles, positions, system settings, and inspect system logs.'],
      [2, 'Project Manager', 'Project manager responsible for creating and leading projects, defining tasks, assigning members, and tracking progress.'],
      [3, 'Member', 'Team member executing assigned project tasks, commenting, uploading files, and updating task statuses.']
    ];

    for (const [id, name, description] of roles) {
      await pool.query(
        `INSERT INTO roles (id, name, description) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description)`,
        [id, name, description]
      );
    }
    console.log('✅ Roles seeded');

    // 2. Positions
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
      await pool.query(
        `INSERT INTO positions (id, name, description, is_active) VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), is_active=VALUES(is_active)`,
        [id, name, description, is_active]
      );
    }
    console.log('✅ Positions seeded');

    // 3. Demo Passwords
    const adminPassHash = await bcrypt.hash('DemoAdmin123!', 10);
    const managerPassHash = await bcrypt.hash('DemoManager123!', 10);
    const memberPassHash = await bcrypt.hash('DemoMember123!', 10);
    const defaultPassHash = await bcrypt.hash('password123', 10);

    // 4. Users (Demo & Sample Accounts)
    const users = [
      // Demo Accounts (Requirements 4, 6, 7, 8)
      [10, 'Demo Administrator', 'demo-admin@projectflow.demo', adminPassHash, 1, 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Active'],
      [11, 'Demo Project Manager', 'demo-manager@projectflow.demo', managerPassHash, 2, 2, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Active'],
      [12, 'Demo Member', 'demo-member@projectflow.demo', memberPassHash, 3, 3, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Active'],

      // Existing accounts for realistic team context
      [1, 'Ryehan Alfiansyah', 'admin@gmail.com', defaultPassHash, 1, 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Active'],
      [2, 'Budi Pratama', 'manager@gmail.com', defaultPassHash, 2, 2, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Active'],
      [3, 'Ryehan (Frontend)', 'frontend@gmail.com', defaultPassHash, 3, 3, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Active'],
      [4, 'Andi Wijaya', 'backend@gmail.com', defaultPassHash, 3, 4, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Active'],
      [5, 'Sinta Maharani', 'designer@gmail.com', defaultPassHash, 3, 6, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 'Active'],
      [6, 'Dimas Prasetyo', 'qa@gmail.com', defaultPassHash, 3, 8, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Active']
    ];

    for (const [id, name, email, password, role_id, position_id, avatar, status] of users) {
      await pool.query(
        `INSERT INTO users (id, name, email, password, role_id, position_id, avatar, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), password=VALUES(password), role_id=VALUES(role_id), position_id=VALUES(position_id), avatar=VALUES(avatar), status=VALUES(status)`,
        [id, name, email, password, role_id, position_id, avatar, status]
      );
    }
    console.log('✅ Demo & Sample Users seeded');

    // 5. Projects Managed by Demo PM (ID: 11) & PM (ID: 2)
    const projects = [
      [1, 'Website Company Profile', 'Redesign and development of modern corporate web application with interactive product showcase, lead generator, and customer portal.', 'PT Telkom Indonesia', '2026-08-01', '2026-09-30', 'On Going', 11],
      [2, 'E-Commerce Mobile Application', 'Cross-platform mobile app development with real-time inventory management, payment gateway integration, and order tracking.', 'Tokopedia Marketplace', '2026-07-15', '2026-10-15', 'On Going', 11],
      [3, 'Internal Logistics Dashboard', 'Enterprise resource analytics dashboard for monitoring fleet status, supply chain routes, and delivery efficiency metrics.', 'JNE Express', '2026-06-01', '2026-08-15', 'Completed', 11],
      [4, 'SaaS Analytics Platform', 'Cloud-based multi-tenant analytics dashboard with automated PDF reporting and real-time WebSocket metrics.', 'ProjectFlow Tech', '2026-08-05', '2026-11-01', 'On Going', 11]
    ];

    for (const [id, name, description, client_name, start_date, due_date, status, project_manager_id] of projects) {
      await pool.query(
        `INSERT INTO projects (id, name, description, client_name, start_date, due_date, status, project_manager_id)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), client_name=VALUES(client_name), start_date=VALUES(start_date), due_date=VALUES(due_date), status=VALUES(status), project_manager_id=VALUES(project_manager_id)`,
        [id, name, description, client_name, start_date, due_date, status, project_manager_id]
      );
    }
    console.log('✅ Projects seeded');

    // 6. Project Members (Demo Member ID: 12 is in projects 1, 2, 3, 4)
    const projectMembers = [
      [1, 1, 12], // Demo Member (Frontend) in Project 1
      [2, 1, 4],  // Andi (Backend) in Project 1
      [3, 1, 5],  // Sinta (UI/UX) in Project 1
      [4, 1, 6],  // Dimas (QA) in Project 1
      [5, 2, 12], // Demo Member in Project 2
      [6, 2, 4],  // Andi in Project 2
      [7, 2, 5],  // Sinta in Project 2
      [8, 3, 12], // Demo Member in Project 3
      [9, 3, 4],  // Andi in Project 3
      [10, 4, 12] // Demo Member in Project 4
    ];

    for (const [id, project_id, user_id] of projectMembers) {
      await pool.query(
        `INSERT INTO project_members (id, project_id, user_id)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE project_id=VALUES(project_id), user_id=VALUES(user_id)`,
        [id, project_id, user_id]
      );
    }
    console.log('✅ Project Members seeded');

    // 7. Tasks (Required: Demo Member ID: 12 has multiple tasks: Todo, In Progress, Review, Completed)
    const tasks = [
      // Project 1 Tasks
      [1, 1, 'Design Homepage', 'Create high-fidelity wireframes and component library in Figma for dark/light themes.', 5, 6, 'High', 'Completed', '2026-08-01', '2026-08-10', 11],
      [2, 1, 'Create REST API', 'Implement JWT token generation, bcrypt password hashing, login & logout routes.', 4, 4, 'Urgent', 'In Progress', '2026-08-02', '2026-08-08', 11],
      [3, 1, 'Build Homepage', 'Build responsive hero section, feature cards, pricing tiers, and client logos using Tailwind CSS.', 12, 3, 'High', 'Todo', '2026-08-05', '2026-08-18', 11],
      [4, 1, 'Implement Navbar', 'Develop sticky header navbar with notifications drawer, user avatar dropdown, and responsive mobile menu.', 12, 3, 'Medium', 'In Progress', '2026-08-09', '2026-08-20', 11],
      [5, 1, 'Testing Login', 'Configure Playwright test suites for testing user authorization and critical workflows.', 6, 8, 'Medium', 'Review', '2026-08-15', '2026-08-25', 11],
      [6, 1, 'Responsive Dashboard', 'Optimize dashboard grid layout for mobile tablets and high-DPI desktop viewports.', 12, 3, 'Urgent', 'Review', '2026-08-07', '2026-08-14', 11],
      [7, 1, 'Fix Mobile Layout', 'Fix padding overflow and font scaling issues on mobile Safari browser.', 12, 3, 'Low', 'Completed', '2026-08-02', '2026-08-10', 11],

      // Project 2 Tasks
      [8, 2, 'Mobile Product Catalog UI Wireframes', 'Design mobile shopping screen flow, filtering drawer, and product details view.', 5, 6, 'High', 'Completed', '2026-07-16', '2026-07-25', 11],
      [9, 2, 'Setup Express E-Commerce Microservice', 'Build REST endpoints for products catalog, category taxonomy, and full-text search.', 4, 4, 'Urgent', 'In Progress', '2026-07-26', '2026-08-22', 11],
      [10, 2, 'React Native Product Search Component', 'Develop search bar with debounce, instant auto-suggestions, and filter badges.', 12, 3, 'Medium', 'Todo', '2026-08-12', '2026-08-26', 11],
      [11, 2, 'Cart & Checkout Integration Tests', 'Write integration tests for shopping cart calculation, coupon discounts, and tax rates.', 6, 8, 'High', 'Review', '2026-08-08', '2026-08-16', 11],

      // Project 3 Tasks (Completed)
      [12, 3, 'Fleet Tracker Database Schema', 'Design normalized MySQL database tables for vehicles, routes, drivers, and delivery logs.', 4, 4, 'High', 'Completed', '2026-06-02', '2026-06-12', 11],
      [13, 3, 'Build Real-time Map Dashboard UI', 'Implement Leaflet/Mapbox map component showing live GPS vehicle locations.', 12, 3, 'Urgent', 'Completed', '2026-06-13', '2026-07-05', 11]
    ];

    for (const [id, project_id, title, description, assigned_to, required_position_id, priority, status, start_date, due_date, created_by] of tasks) {
      await pool.query(
        `INSERT INTO tasks (id, project_id, title, description, assigned_to, required_position_id, priority, status, start_date, due_date, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE title=VALUES(title), description=VALUES(description), assigned_to=VALUES(assigned_to), required_position_id=VALUES(required_position_id), priority=VALUES(priority), status=VALUES(status), start_date=VALUES(start_date), due_date=VALUES(due_date)`,
        [id, project_id, title, description, assigned_to, required_position_id, priority, status, start_date, due_date, created_by]
      );
    }
    console.log('✅ Tasks seeded');

    // 8. Comments
    const comments = [
      [1, 2, 4, 'API endpoints for authentication are ready and fully tested on Postman.', '2026-08-08 14:20:00'],
      [2, 4, 12, 'Implement Navbar is currently in progress. Mobile drawer menu completed!', '2026-08-10 11:45:00'],
      [3, 6, 12, 'Responsive Dashboard is ready for PM review.', '2026-08-11 16:30:00'],
      [4, 5, 6, 'Testing login flow scenarios. All assertions passing clean.', '2026-08-12 10:15:00']
    ];

    for (const [id, task_id, user_id, content, created_at] of comments) {
      await pool.query(
        `INSERT INTO comments (id, task_id, user_id, content, created_at)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE content=VALUES(content)`,
        [id, task_id, user_id, content, created_at]
      );
    }
    console.log('✅ Comments seeded');

    // 9. Activity Logs
    const activities = [
      [1, 11, 1, 'Project', 1, 'Created', 'Demo Project Manager created project "Website Company Profile"', '2026-08-01 09:00:00'],
      [2, 11, 1, 'Member', 12, 'Added', 'Demo Project Manager added Demo Member (Frontend Developer) to Website Company Profile', '2026-08-01 09:05:00'],
      [3, 11, 1, 'Task', 4, 'Created', 'Demo Project Manager created task "Implement Navbar"', '2026-08-05 10:00:00'],
      [4, 12, 1, 'Task', 4, 'Status Updated', 'Demo Member moved "Implement Navbar" from Todo to In Progress', '2026-08-05 11:30:00'],
      [5, 12, 1, 'Task', 7, 'Status Updated', 'Demo Member moved "Fix Mobile Layout" from In Progress to Completed', '2026-08-08 14:00:00'],
      [6, 12, 1, 'Comment', 2, 'Added', 'Demo Member added a comment on "Implement Navbar"', '2026-08-10 11:45:00']
    ];

    for (const [id, user_id, project_id, entity_type, entity_id, action, description, created_at] of activities) {
      await pool.query(
        `INSERT INTO activity_logs (id, user_id, project_id, entity_type, entity_id, action, description, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE description=VALUES(description)`,
        [id, user_id, project_id, entity_type, entity_id, action, description, created_at]
      );
    }
    console.log('✅ Activity Logs seeded');

    // 10. Notifications
    const notifications = [
      [1, 12, 'task_assigned', 'You have been assigned task "Build Homepage"', 0, '2026-08-05 10:00:00'],
      [2, 12, 'task_assigned', 'You have been assigned task "Implement Navbar"', 0, '2026-08-09 09:00:00'],
      [3, 12, 'task_assigned', 'You have been assigned task "Responsive Dashboard"', 0, '2026-08-10 16:30:00'],
      [4, 12, 'deadline_approaching', 'Task "Build Homepage" is due soon', 0, '2026-08-12 08:00:00']
    ];

    for (const [id, user_id, type, message, is_read, created_at] of notifications) {
      await pool.query(
        `INSERT INTO notifications (id, user_id, type, message, is_read, created_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE message=VALUES(message)`,
        [id, user_id, type, message, is_read, created_at]
      );
    }
    console.log('✅ Notifications seeded');

    console.log('🎉 ProjectFlow Portfolio Seed Completed Successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

if (require.main === module) {
  seed().then(() => process.exit(0));
}

module.exports = seed;
