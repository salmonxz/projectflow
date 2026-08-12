import React from 'react';

export const StatusBadge = ({ status }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (status) {
    case 'Planning':
      style = 'bg-sky-50 text-sky-700 border-sky-200';
      break;
    case 'On Going':
    case 'In Progress':
      style = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'Review':
      style = 'bg-purple-50 text-purple-700 border-purple-200';
      break;
    case 'Completed':
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      break;
    case 'On Hold':
      style = 'bg-gray-100 text-gray-700 border-gray-200';
      break;
    case 'Cancelled':
      style = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case 'Todo':
      style = 'bg-slate-100 text-slate-600 border-slate-200';
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-75"></span>
      {status}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (priority) {
    case 'Low':
      style = 'bg-blue-50 text-blue-700 border-blue-200';
      break;
    case 'Medium':
      style = 'bg-amber-50 text-amber-700 border-amber-200';
      break;
    case 'High':
      style = 'bg-orange-50 text-orange-700 border-orange-200';
      break;
    case 'Urgent':
      style = 'bg-rose-50 text-rose-700 border-rose-200 font-bold';
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {priority}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (role) {
    case 'Administrator':
      style = 'bg-rose-50 text-rose-700 border-rose-200';
      break;
    case 'Project Manager':
      style = 'bg-indigo-50 text-indigo-700 border-indigo-200';
      break;
    case 'Member':
      style = 'bg-cyan-50 text-cyan-700 border-cyan-200';
      break;
    default:
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold border ${style}`}>
      {role}
    </span>
  );
};
