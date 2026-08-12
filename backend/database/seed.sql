-- ProjectFlow Database Seed Data
-- Database: projectflow_db

USE `projectflow_db`;

-- 1. Roles
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'Administrator', 'System administrator with full permissions to manage users, roles, positions, system settings, and inspect system logs.'),
(2, 'Project Manager', 'Project manager responsible for creating and leading projects, defining tasks, assigning members, and tracking progress.'),
(3, 'Member', 'Team member executing assigned project tasks, commenting, uploading files, and updating task statuses.');

-- 2. Job Positions
INSERT INTO `positions` (`id`, `name`, `description`, `is_active`) VALUES
(1, 'System Administrator', 'Infrastructure, user access, and system security management', 1),
(2, 'Project Manager', 'Project planning, scope management, team coordination, and delivery', 1),
(3, 'Frontend Developer', 'User interface development, web components, and client-side integration', 1),
(4, 'Backend Developer', 'Server architecture, RESTful API design, database and business logic', 1),
(5, 'Fullstack Developer', 'End-to-end software development across client and server tech stack', 1),
(6, 'UI/UX Designer', 'Product interface design, user flow research, prototyping, and design systems', 1),
(7, 'Mobile Developer', 'Native and cross-platform mobile application development', 1),
(8, 'QA Engineer', 'Quality assurance, manual testing, test automation, and bug tracking', 1),
(9, 'DevOps Engineer', 'CI/CD deployment pipelines, containerization, cloud infrastructure, and monitoring', 1),
(10, 'Data Analyst', 'Business metrics analysis, data visualization, reporting, and intelligence', 1),
(11, 'Product Manager', 'Product strategy, roadmap definition, user research, and requirement specs', 1),
(12, 'Content Writer', 'Technical documentation, UX copy, marketing text, and content creation', 1);

-- 3. Users (Password for all: password123)
-- Hash: $2a$10$Hgo7KQzsZgsN02O2jbDFderpIo6qwlRRRBheEMTLvinM6.8erDALa
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role_id`, `position_id`, `avatar`, `status`) VALUES
(1, 'Ryehan Alfiansyah', 'admin@gmail.com', '$2a$10$Hgo7KQzsZgsN02O2jbDFderpIo6qwlRRRBheEMTLvinM6.8erDALa', 1, 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Active'),
(2, 'Budi Pratama', 'manager@gmail.com', '$2a$10$Hgo7KQzsZgsN02O2jbDFderpIo6qwlRRRBheEMTLvinM6.8erDALa', 2, 2, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Active'),
(3, 'Siti Nurhaliza', 'frontend@gmail.com', '$2a$10$Hgo7KQzsZgsN02O2jbDFderpIo6qwlRRRBheEMTLvinM6.8erDALa', 3, 3, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Active'),
(4, 'Andi Wijaya', 'backend@gmail.com', '$2a$10$Hgo7KQzsZgsN02O2jbDFderpIo6qwlRRRBheEMTLvinM6.8erDALa', 3, 4, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Active'),
(5, 'Sinta Maharani', 'designer@gmail.com', '$2a$10$Hgo7KQzsZgsN02O2jbDFderpIo6qwlRRRBheEMTLvinM6.8erDALa', 3, 6, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', 'Active'),
(6, 'Dimas Prasetyo', 'qa@gmail.com', '$2a$10$Hgo7KQzsZgsN02O2jbDFderpIo6qwlRRRBheEMTLvinM6.8erDALa', 3, 8, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Active');

-- 4. Projects
INSERT INTO `projects` (`id`, `name`, `description`, `client_name`, `start_date`, `due_date`, `status`, `project_manager_id`) VALUES
(1, 'Website Company Profile SaaS', 'Redesign and development of modern corporate web application with interactive product showcase, lead generator, and customer portal.', 'PT Telkom Indonesia', '2026-08-01', '2026-09-30', 'On Going', 2),
(2, 'E-Commerce Mobile Application', 'Cross-platform mobile app development with real-time inventory management, payment gateway integration, and order tracking.', 'Tokopedia Marketplace', '2026-07-15', '2026-10-15', 'On Going', 2),
(3, 'Internal Logistics Dashboard', 'Enterprise resource analytics dashboard for monitoring fleet status, supply chain routes, and delivery efficiency metrics.', 'JNE Express', '2026-06-01', '2026-08-15', 'Completed', 2);

-- 5. Project Members
INSERT INTO `project_members` (`id`, `project_id`, `user_id`, `joined_at`) VALUES
(1, 1, 3, '2026-08-01 09:00:00'), -- Siti (Frontend) in Project 1
(2, 1, 4, '2026-08-01 09:00:00'), -- Andi (Backend) in Project 1
(3, 1, 5, '2026-08-01 09:00:00'), -- Sinta (UI/UX) in Project 1
(4, 1, 6, '2026-08-01 09:00:00'), -- Dimas (QA) in Project 1
(5, 2, 3, '2026-07-15 10:00:00'), -- Siti in Project 2
(6, 2, 4, '2026-07-15 10:00:00'), -- Andi in Project 2
(7, 2, 5, '2026-07-15 10:00:00'), -- Sinta in Project 2
(8, 3, 3, '2026-06-01 08:30:00'), -- Siti in Project 3
(9, 3, 4, '2026-06-01 08:30:00'); -- Andi in Project 3

-- 6. Tasks
INSERT INTO `tasks` (`id`, `project_id`, `title`, `description`, `assigned_to`, `required_position_id`, `priority`, `status`, `start_date`, `due_date`, `created_by`) VALUES
-- Project 1 Tasks
(1, 1, 'Design Figma Wireframes & UI Kit', 'Create high-fidelity wireframes and component library in Figma for dark/light themes.', 5, 6, 'High', 'Completed', '2026-08-01', '2026-08-10', 2),
(2, 1, 'Build Authentication REST API', 'Implement JWT token generation, bcrypt password hashing, login & logout routes.', 4, 4, 'Urgent', 'Completed', '2026-08-02', '2026-08-08', 2),
(3, 1, 'Develop React SaaS Landing Page', 'Build responsive hero section, feature cards, pricing tiers, and client logos using Tailwind CSS.', 3, 3, 'High', 'In Progress', '2026-08-05', '2026-08-18', 2),
(4, 1, 'Implement User Management Endpoints', 'Create REST CRUD endpoints for user accounts, role updates, and position filter.', 4, 4, 'Medium', 'In Progress', '2026-08-09', '2026-08-20', 2),
(5, 1, 'Setup Automated End-to-End QA Testing', 'Configure Playwright test suites for testing user authorization and critical workflows.', 6, 8, 'Medium', 'Todo', '2026-08-15', '2026-08-25', 2),
(6, 1, 'Integrate Payment Gateway Callback API', 'Setup webhook handlers for Midtrans / Xendit payment notification events.', 4, 4, 'Urgent', 'Review', '2026-08-07', '2026-08-14', 2),
(7, 1, 'Design Customer Support Modal UI', 'Design responsive feedback modal, ticket submission drawer, and contact form.', 5, 6, 'Low', 'Todo', '2026-08-18', '2026-08-28', 2),

-- Project 2 Tasks
(8, 2, 'Mobile Product Catalog UI Wireframes', 'Design mobile shopping screen flow, filtering drawer, and product details view.', 5, 6, 'High', 'Completed', '2026-07-16', '2026-07-25', 2),
(9, 2, 'Setup Express E-Commerce Microservice', 'Build REST endpoints for products catalog, category taxonomy, and full-text search.', 4, 4, 'Urgent', 'In Progress', '2026-07-26', '2026-08-22', 2),
(10, 2, 'React Native Product Search Component', 'Develop search bar with debounce, instant auto-suggestions, and filter badges.', 3, 3, 'Medium', 'Todo', '2026-08-12', '2026-08-26', 2),
(11, 2, 'Cart & Checkout Integration Tests', 'Write integration tests for shopping cart calculation, coupon discounts, and tax rates.', 6, 8, 'High', 'Review', '2026-08-08', '2026-08-16', 2),
(12, 2, 'Deploy Staging Environment on AWS', 'Configure Docker containers, Nginx reverse proxy, and SSL certificate renewals.', 4, 4, 'Urgent', 'Todo', '2026-08-20', '2026-08-30', 2),

-- Project 3 Tasks (Completed Project)
(13, 3, 'Fleet Tracker Database Schema', 'Design normalized MySQL database tables for vehicles, routes, drivers, and delivery logs.', 4, 4, 'High', 'Completed', '2026-06-02', '2026-06-12', 2),
(14, 3, 'Build Real-time Map Dashboard UI', 'Implement Leaflet/Mapbox map component showing live GPS vehicle locations.', 3, 3, 'Urgent', 'Completed', '2026-06-13', '2026-07-05', 2),
(15, 3, 'Final Security Audit & UAT Verification', 'Perform penetration testing, SQL injection checks, and obtain client sign-off.', 6, 8, 'High', 'Completed', '2026-07-06', '2026-07-20', 2);

-- 7. Comments
INSERT INTO `comments` (`id`, `task_id`, `user_id`, `content`, `created_at`) VALUES
(1, 2, 4, 'API endpoints for authentication are ready and fully tested on Postman.', '2026-08-08 14:20:00'),
(2, 3, 3, 'Hero component and pricing table done! Integrating with backend API now.', '2026-08-10 11:45:00'),
(3, 6, 4, 'Webhook callback listener built. Waiting for QA verification.', '2026-08-11 16:30:00'),
(4, 6, 6, 'Testing webhook payloads now. Signature verification passes clean.', '2026-08-12 10:15:00');

-- 8. Attachments
INSERT INTO `attachments` (`id`, `task_id`, `uploaded_by`, `file_name`, `file_path`, `file_type`, `file_size`, `created_at`) VALUES
(1, 1, 5, 'ProjectFlow_UI_Design_System.pdf', '/uploads/sample_design_system.pdf', 'application/pdf', 2450000, '2026-08-10 09:30:00'),
(2, 2, 4, 'Auth_API_Specs_v1.docx', '/uploads/sample_api_specs.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 512000, '2026-08-08 15:00:00');

-- 9. Activity Logs
INSERT INTO `activity_logs` (`id`, `user_id`, `project_id`, `entity_type`, `entity_id`, `action`, `description`, `created_at`) VALUES
(1, 2, 1, 'Project', 1, 'Created', 'Budi Pratama created project "Website Company Profile SaaS"', '2026-08-01 09:00:00'),
(2, 2, 1, 'Member', 3, 'Added', 'Budi Pratama added Siti Nurhaliza (Frontend Developer) to Website Company Profile SaaS', '2026-08-01 09:05:00'),
(3, 2, 1, 'Task', 3, 'Created', 'Budi Pratama created task "Develop React SaaS Landing Page"', '2026-08-05 10:00:00'),
(4, 3, 1, 'Task', 3, 'Status Updated', 'Siti Nurhaliza moved "Develop React SaaS Landing Page" from Todo to In Progress', '2026-08-05 11:30:00'),
(5, 4, 1, 'Task', 2, 'Status Updated', 'Andi Wijaya moved "Build Authentication REST API" from In Progress to Completed', '2026-08-08 14:00:00'),
(6, 4, 1, 'Comment', 2, 'Added', 'Andi Wijaya added a comment on "Build Authentication REST API"', '2026-08-08 14:20:00');

-- 10. Notifications
INSERT INTO `notifications` (`id`, `user_id`, `type`, `message`, `is_read`, `created_at`) VALUES
(1, 3, 'task_assigned', 'You have been assigned task "Develop React SaaS Landing Page"', 0, '2026-08-05 10:00:00'),
(2, 4, 'task_assigned', 'You have been assigned task "Implement User Management Endpoints"', 0, '2026-08-09 09:00:00'),
(3, 6, 'comment_added', 'Andi Wijaya commented on task "Integrate Payment Gateway Callback API"', 0, '2026-08-11 16:30:00'),
(4, 3, 'deadline_approaching', 'Task "Develop React SaaS Landing Page" is due in 6 days', 0, '2026-08-12 08:00:00');
