const fs = require('fs');

const BASE_URL = 'http://localhost:5000/api';

async function runAudit() {
  console.log('🔍 Running Comprehensive ProjectFlow Feature & API Audit...\n');

  let errorsFound = [];

  // Helper for requests
  async function req(endpoint, options = {}, token = null) {
    const headers = { ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
      const data = await res.json();
      return { status: res.status, data };
    } catch (err) {
      return { status: 500, error: err.message };
    }
  }

  // 1. Test Login for 3 Roles
  console.log('--- 1. Testing Auth & Login ---');
  const adminLogin = await req('/auth/login', { method: 'POST', body: { email: 'demo-admin@projectflow.demo', password: 'DemoAdmin123!' } });
  const managerLogin = await req('/auth/login', { method: 'POST', body: { email: 'demo-manager@projectflow.demo', password: 'DemoManager123!' } });
  const memberLogin = await req('/auth/login', { method: 'POST', body: { email: 'demo-member@projectflow.demo', password: 'DemoMember123!' } });

  if (!adminLogin.data?.success) errorsFound.push('Admin login failed');
  if (!managerLogin.data?.success) errorsFound.push('PM login failed');
  if (!memberLogin.data?.success) errorsFound.push('Member login failed');

  const adminToken = adminLogin.data?.data?.token;
  const pmToken = managerLogin.data?.data?.token;
  const memberToken = memberLogin.data?.data?.token;

  console.log('✅ Admin Token:', !!adminToken);
  console.log('✅ PM Token:', !!pmToken);
  console.log('✅ Member Token:', !!memberToken);

  // 2. Test Get Me
  console.log('\n--- 2. Testing Auth /me ---');
  const meAdmin = await req('/auth/me', {}, adminToken);
  const mePM = await req('/auth/me', {}, pmToken);
  const meMember = await req('/auth/me', {}, memberToken);

  if (!meAdmin.data?.success) errorsFound.push('Admin /me failed');
  if (!mePM.data?.success) errorsFound.push('PM /me failed');
  if (!meMember.data?.success) errorsFound.push('Member /me failed');

  // 3. Test Dashboard Stats
  console.log('\n--- 3. Testing Dashboard Reports ---');
  const dbAdmin = await req('/reports/dashboard', {}, adminToken);
  const dbPM = await req('/reports/dashboard', {}, pmToken);
  const dbMember = await req('/reports/dashboard', {}, memberToken);

  if (!dbAdmin.data?.success) errorsFound.push('Admin dashboard stats failed: ' + JSON.stringify(dbAdmin));
  if (!dbPM.data?.success) errorsFound.push('PM dashboard stats failed: ' + JSON.stringify(dbPM));
  if (!dbMember.data?.success) errorsFound.push('Member dashboard stats failed: ' + JSON.stringify(dbMember));

  console.log('✅ Admin Dashboard Role:', dbAdmin.data?.data?.role);
  console.log('✅ PM Dashboard Role:', dbPM.data?.data?.role);
  console.log('✅ Member Dashboard Role:', dbMember.data?.data?.role);

  // 4. Test Workload & System Reports
  console.log('\n--- 4. Testing System Reports /workload ---');
  const workloadReport = await req('/reports/workload', {}, pmToken);
  if (!workloadReport.data?.success) {
    errorsFound.push('Workload report failed: ' + JSON.stringify(workloadReport));
  } else {
    console.log('✅ Workload Total Projects:', workloadReport.data.data.summary.total_projects);
    console.log('✅ Workload Member Workload Count:', workloadReport.data.data.member_workload.length);
  }

  // 5. Test Projects API
  console.log('\n--- 5. Testing Projects List & Details ---');
  const projectsList = await req('/projects', {}, pmToken);
  if (!projectsList.data?.success || !Array.isArray(projectsList.data.data)) {
    errorsFound.push('Projects list failed');
  } else {
    console.log('✅ Total Projects Count:', projectsList.data.data.length);
    const targetProject = projectsList.data.data[0];
    if (targetProject) {
      const projDetail = await req(`/projects/${targetProject.id}`, {}, pmToken);
      if (!projDetail.data?.success) errorsFound.push(`Get project ${targetProject.id} failed`);
      else console.log('✅ Project Detail Fetched:', projDetail.data.data.name);
    }
  }

  // 6. Test Tasks API
  console.log('\n--- 6. Testing Tasks List & Details ---');
  const myTasks = await req('/tasks', {}, memberToken);
  if (!myTasks.data?.success) {
    errorsFound.push('Member My Tasks failed');
  } else {
    console.log('✅ Member Assigned Tasks Count:', myTasks.data.data.length);
    if (myTasks.data.data.length > 0) {
      const taskDetail = await req(`/tasks/${myTasks.data.data[0].id}`, {}, memberToken);
      if (!taskDetail.data?.success) errorsFound.push('Task detail failed');
      else console.log('✅ Task Detail Fetched:', taskDetail.data.data.title);
    }
  }

  // 7. Test Users & Positions
  console.log('\n--- 7. Testing Users & Positions ---');
  const usersList = await req('/users?status=Active', {}, adminToken);
  const positionsList = await req('/positions', {}, adminToken);

  if (!usersList.data?.success) errorsFound.push('Users list failed');
  if (!positionsList.data?.success) errorsFound.push('Positions list failed');

  console.log('✅ Total Users Count:', usersList.data?.data?.length);
  console.log('✅ Total Positions Count:', positionsList.data?.data?.length);

  // 8. Test Role Authorization Restrictions
  console.log('\n--- 8. Testing Authorization Security Checks ---');
  // Admin tries to create project -> Should fail with 403
  const adminCreateProj = await req('/projects', { method: 'POST', body: { name: 'Unauthorized Admin Proj', start_date: '2026-08-01', due_date: '2026-08-30' } }, adminToken);
  if (adminCreateProj.status !== 403) {
    errorsFound.push(`Security flaw: Admin was able to create project (status ${adminCreateProj.status})`);
  } else {
    console.log('🔒 Security Check OK: Admin cannot create projects (403 Forbidden)');
  }

  // Member tries to create project -> Should fail with 403
  const memberCreateProj = await req('/projects', { method: 'POST', body: { name: 'Unauthorized Member Proj', start_date: '2026-08-01', due_date: '2026-08-30' } }, memberToken);
  if (memberCreateProj.status !== 403) {
    errorsFound.push(`Security flaw: Member was able to create project (status ${memberCreateProj.status})`);
  } else {
    console.log('🔒 Security Check OK: Member cannot create projects (403 Forbidden)');
  }

  // 9. Audit Summary
  console.log('\n========================================');
  if (errorsFound.length === 0) {
    console.log('🎉 AUDIT PASSED CLEAN! 0 Errors Found.');
  } else {
    console.log('⚠️ AUDIT FOUND ISSUES:');
    errorsFound.forEach((err, idx) => console.log(` ${idx + 1}. ${err}`));
  }
  console.log('========================================\n');
}

runAudit();
