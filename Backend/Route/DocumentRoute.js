const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Project = require('../Model/ProjectModel');
const authMiddleware = require('../middleware/authMiddleware');

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/documents'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// POST /api/projects/:id/upload-document
// Secure all document routes for logged-in users
router.use(authMiddleware);

router.post('/projects/:id/upload-document', upload.single('document'), async (req, res) => {
  try {
    const projectId = req.params.id;
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const doc = {
      filename: file.originalname,
      url: `/uploads/documents/${file.filename}`,
      uploadedBy: req.user._id,
      uploadedAt: new Date()
    };
    project.documents.push(doc);
    await project.save();
    res.status(200).json({ message: 'Document uploaded', document: doc });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload document', error: err.message });
  }
});

module.exports = router;
