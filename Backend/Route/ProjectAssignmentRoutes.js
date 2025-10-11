const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/rbac');
const Project = require('../Model/ProjectModel');
const User = require('../Model/UserModel');

router.use(auth);

// Admin can assign Site Manager to a project
router.post('/:id/assign-site-manager', requireRole('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { siteManagerId } = req.body;
    const proj = await Project.findById(id);
    if (!proj) return res.status(404).json({ success:false, message:'Project not found' });
    const user = await User.findById(siteManagerId);
    if (!user || user.role !== 'Site Manager') return res.status(400).json({ success:false, message:'Invalid site manager' });
    proj.siteManager = siteManagerId;
    await proj.save();
    res.json({ success:true, project: proj });
  } catch (e) { res.status(500).json({ success:false, message:'Failed to assign site manager', error:e.message }); }
});

// Admin can link a client user to a project (for client portal view)
router.post('/:id/add-client', requireRole('Admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { clientId } = req.body;
    const proj = await Project.findById(id);
    if (!proj) return res.status(404).json({ success:false, message:'Project not found' });
    const user = await User.findById(clientId);
    if (!user || user.role !== 'Client') return res.status(400).json({ success:false, message:'Invalid client' });
    proj.clients = proj.clients || [];
    if (!proj.clients.find(x => String(x) === String(clientId))) proj.clients.push(clientId);
    await proj.save();
    res.json({ success:true, project: proj });
  } catch (e) { res.status(500).json({ success:false, message:'Failed to add client to project', error:e.message }); }
});

module.exports = router;
// Optional admin utility: backfill siteManager by matching projectManager.name
router.post('/backfill/site-managers', requireRole('Admin'), async (req, res) => {
  try {
    const managers = await User.find({ role: 'Site Manager' }).select('_id name');
    const nameMap = new Map(managers.map(m => [String(m.name).toLowerCase(), m._id]));
    const projects = await Project.find({ $or: [ { siteManager: { $exists: false } }, { siteManager: null } ] });
    let updated = 0;
    for (const p of projects) {
      const pmName = p?.projectManager?.name ? String(p.projectManager.name).toLowerCase() : '';
      if (pmName && nameMap.has(pmName)) {
        p.siteManager = nameMap.get(pmName);
        await p.save();
        updated++;
      }
    }
    res.json({ success: true, updated });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Backfill failed', error: e.message });
  }
});
