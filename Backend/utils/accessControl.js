/**
 * Role-based access helpers for users, projects, and finances.
 */

const PROJECT_LIST_ROLES = [
  'Admin',
  'Project Manager',
  'Site Manager',
  'Site Supervisor',
  'Supervisor',
  'Client',
];

const PROJECT_WRITE_ROLES = [
  'Admin',
  'Project Manager',
  'Site Manager',
  'Site Supervisor',
  'Supervisor',
];

const FINANCE_READ_ROLES = ['Admin', 'Project Manager', 'Site Manager'];
const FINANCE_WRITE_ROLES = ['Admin'];

function hasRole(user, ...roles) {
  return Boolean(user?.role && roles.includes(user.role));
}

function isAdmin(user) {
  return user?.role === 'Admin';
}

function isSelf(user, id) {
  if (!user || id == null) return false;
  return String(user._id) === String(id);
}

function canListUsers(user) {
  return isAdmin(user);
}

function canCreateUser(user) {
  return isAdmin(user);
}

function canDeleteUser(user) {
  return isAdmin(user);
}

function canViewUser(user, targetId) {
  return isAdmin(user) || isSelf(user, targetId);
}

function canUpdateUser(user, targetId) {
  return isAdmin(user) || isSelf(user, targetId);
}

function canListProjects(user) {
  return hasRole(user, ...PROJECT_LIST_ROLES);
}

function canCreateProject(user) {
  return isAdmin(user);
}

function canDeleteProject(user) {
  return isAdmin(user);
}

function canUpdateProject(user) {
  return hasRole(user, ...PROJECT_WRITE_ROLES);
}

function canViewProjectStats(user) {
  return hasRole(user, 'Admin', 'Project Manager', 'Site Manager');
}

function canViewAuditLogs(user) {
  return hasRole(
    user,
    'Admin',
    'Project Manager',
    'Site Manager',
    'Site Supervisor',
    'Supervisor'
  );
}

function canReadFinance(user) {
  return hasRole(user, ...FINANCE_READ_ROLES);
}

function canWriteFinance(user) {
  return hasRole(user, ...FINANCE_WRITE_ROLES);
}

/** Scope project list queries by role (Client / Site Supervisor). */
function applyProjectListFilter(filter, user) {
  const next = { ...filter };
  if (!user) return next;

  if (user.role === 'Client') {
    const clientFilter = {
      $or: [
        { 'clientContact.email': new RegExp(`^${escapeRegex(user.gmail || '')}$`, 'i') },
      ],
    };
    if (user.name) {
      clientFilter.$or.push({ client: new RegExp(escapeRegex(user.name), 'i') });
    }
    return { $and: [next, clientFilter] };
  }

  if (user.role === 'Site Supervisor' || user.role === 'Supervisor') {
    return {
      $and: [next, { supervisors: user._id }],
    };
  }

  return next;
}

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Whether this user may read or mutate a single project document. */
function canAccessProject(user, project) {
  if (!user || !project) return false;
  if (isAdmin(user)) return true;
  if (hasRole(user, 'Project Manager', 'Site Manager')) return true;

  if (user.role === 'Site Supervisor' || user.role === 'Supervisor') {
    const uid = String(user._id);
    const supervisors = project.supervisors || [];
    if (supervisors.some((s) => String(s) === uid)) return true;
    if (project.siteManager && String(project.siteManager) === uid) return true;
    return false;
  }

  if (user.role === 'Client') {
    const email = project.clientContact?.email;
    if (email && user.gmail && email.toLowerCase() === user.gmail.toLowerCase()) {
      return true;
    }
    if (
      project.client &&
      user.name &&
      project.client.toLowerCase().includes(user.name.toLowerCase())
    ) {
      return true;
    }
    return false;
  }

  return false;
}

module.exports = {
  PROJECT_LIST_ROLES,
  PROJECT_WRITE_ROLES,
  FINANCE_READ_ROLES,
  FINANCE_WRITE_ROLES,
  hasRole,
  isAdmin,
  isSelf,
  canListUsers,
  canCreateUser,
  canDeleteUser,
  canViewUser,
  canUpdateUser,
  canListProjects,
  canCreateProject,
  canDeleteProject,
  canUpdateProject,
  canViewProjectStats,
  canViewAuditLogs,
  canReadFinance,
  canWriteFinance,
  applyProjectListFilter,
  canAccessProject,
};
