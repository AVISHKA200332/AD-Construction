// Utility to infer role from email / gmail string
// Customize patterns as needed
// Order matters (first match wins)
const ROLE_PATTERNS = [
  { role: 'Admin', test: /(^admin@)|(@admin\.)/i },
  { role: 'Project Manager', test: /(pm|projectmgr|manager)@/i },
  { role: 'Site Supervisor', test: /(supervisor|site\.sup)@/i },
  { role: 'Labor', test: /(labor|worker)@/i },
  // fallback: client
];

function inferRoleFromEmail(email) {
  if (!email) return 'Client';
  const lower = String(email).toLowerCase();
  for (const pattern of ROLE_PATTERNS) {
    if (pattern.test.test(lower)) return pattern.role;
  }
  return 'Client';
}

module.exports = { inferRoleFromEmail };