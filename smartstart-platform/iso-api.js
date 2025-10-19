// ISO Readiness Studio API - JSON-based implementation
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Data file paths
const FRAMEWORKS_PATH = path.join(__dirname, 'data/iso/frameworks.json');
const CONTROLS_PATH = path.join(__dirname, 'data/iso/controls.json');
const PROJECTS_PATH = path.join(__dirname, 'data/iso/projects.json');

// Helper function to read JSON files
function readJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return null;
  }
}

// Helper function to write JSON files
function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
}

// Initialize projects file if it doesn't exist
function initProjectsFile() {
  if (!fs.existsSync(PROJECTS_PATH)) {
    const initialData = {
      projects: [],
      metadata: {
        lastUpdated: new Date().toISOString(),
        version: "1.0.0"
      }
    };
    writeJSON(PROJECTS_PATH, initialData);
  }
}

// Initialize on load
initProjectsFile();

// ========================================
// FRAMEWORK ENDPOINTS
// ========================================

// Get all frameworks
router.get('/frameworks', (req, res) => {
  const data = readJSON(FRAMEWORKS_PATH);
  if (!data) {
    return res.status(500).json({ error: 'Failed to load frameworks' });
  }
  res.json(data.frameworks);
});

// Get a specific framework
router.get('/frameworks/:id', (req, res) => {
  const data = readJSON(FRAMEWORKS_PATH);
  if (!data) {
    return res.status(500).json({ error: 'Failed to load frameworks' });
  }
  
  const framework = data.frameworks.find(f => f.id === req.params.id);
  if (!framework) {
    return res.status(404).json({ error: 'Framework not found' });
  }
  
  res.json(framework);
});

// ========================================
// CONTROL ENDPOINTS
// ========================================

// Get all controls (with optional filtering)
router.get('/controls', (req, res) => {
  const data = readJSON(CONTROLS_PATH);
  if (!data) {
    return res.status(500).json({ error: 'Failed to load controls' });
  }
  
  let controls = data.controls;
  
  // Filter by framework
  if (req.query.frameworkId) {
    controls = controls.filter(c => c.frameworkId === req.query.frameworkId);
  }
  
  // Filter by domain
  if (req.query.domainId) {
    controls = controls.filter(c => c.domainId === req.query.domainId);
  }
  
  // Filter by tags
  if (req.query.tags) {
    const tags = req.query.tags.split(',');
    controls = controls.filter(c => 
      tags.some(tag => c.tags.includes(tag))
    );
  }
  
  res.json({
    controls,
    metadata: data.metadata,
    filters: {
      frameworkId: req.query.frameworkId || null,
      domainId: req.query.domainId || null,
      tags: req.query.tags || null
    }
  });
});

// Get a specific control
router.get('/controls/:id', (req, res) => {
  const data = readJSON(CONTROLS_PATH);
  if (!data) {
    return res.status(500).json({ error: 'Failed to load controls' });
  }
  
  const control = data.controls.find(c => c.id === req.params.id);
  if (!control) {
    return res.status(404).json({ error: 'Control not found' });
  }
  
  res.json(control);
});

// ========================================
// PROJECT ENDPOINTS
// ========================================

// Get all projects
router.get('/projects', (req, res) => {
  const data = readJSON(PROJECTS_PATH);
  if (!data) {
    return res.status(500).json({ error: 'Failed to load projects' });
  }
  
  res.json(data.projects);
});

// Get a specific project
router.get('/projects/:id', (req, res) => {
  const data = readJSON(PROJECTS_PATH);
  if (!data) {
    return res.status(500).json({ error: 'Failed to load projects' });
  }
  
  const project = data.projects.find(p => p.id === req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  res.json(project);
});

// Create a new project
router.post('/projects', (req, res) => {
  const data = readJSON(PROJECTS_PATH);
  if (!data) {
    return res.status(500).json({ error: 'Failed to load projects' });
  }
  
  const newProject = {
    id: `project_${Date.now()}`,
    name: req.body.name || 'Untitled Project',
    frameworkId: req.body.frameworkId || 'iso27001_2022',
    organizationId: req.body.organizationId || null,
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    answers: [],
    metadata: req.body.metadata || {}
  };
  
  data.projects.push(newProject);
  data.metadata.lastUpdated = new Date().toISOString();
  
  if (writeJSON(PROJECTS_PATH, data)) {
    res.status(201).json(newProject);
  } else {
    res.status(500).json({ error: 'Failed to save project' });
  }
});

// Update a project
router.put('/projects/:id', (req, res) => {
  const data = readJSON(PROJECTS_PATH);
  if (!data) {
    return res.status(500).json({ error: 'Failed to load projects' });
  }
  
  const projectIndex = data.projects.findIndex(p => p.id === req.params.id);
  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const project = data.projects[projectIndex];
  const updatedProject = {
    ...project,
    ...req.body,
    id: project.id, // Don't allow ID changes
    updatedAt: new Date().toISOString()
  };
  
  data.projects[projectIndex] = updatedProject;
  data.metadata.lastUpdated = new Date().toISOString();
  
  if (writeJSON(PROJECTS_PATH, data)) {
    res.json(updatedProject);
  } else {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// ========================================
// ANSWER ENDPOINTS
// ========================================

// Submit/update an answer for a control
router.post('/projects/:projectId/answers', (req, res) => {
  const projectsData = readJSON(PROJECTS_PATH);
  if (!projectsData) {
    return res.status(500).json({ error: 'Failed to load projects' });
  }
  
  const projectIndex = projectsData.projects.findIndex(p => p.id === req.params.projectId);
  if (projectIndex === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const project = projectsData.projects[projectIndex];
  
  const answer = {
    controlId: req.body.controlId,
    status: req.body.status || 'pending', // pending, ready, partial, missing
    ownerId: req.body.ownerId || null,
    ownerName: req.body.ownerName || null,
    dueDate: req.body.dueDate || null,
    notes: req.body.notes || '',
    references: req.body.references || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Update or add answer
  const existingAnswerIndex = project.answers.findIndex(a => a.controlId === answer.controlId);
  if (existingAnswerIndex !== -1) {
    project.answers[existingAnswerIndex] = {
      ...project.answers[existingAnswerIndex],
      ...answer,
      createdAt: project.answers[existingAnswerIndex].createdAt // Preserve original creation date
    };
  } else {
    project.answers.push(answer);
  }
  
  project.updatedAt = new Date().toISOString();
  projectsData.projects[projectIndex] = project;
  projectsData.metadata.lastUpdated = new Date().toISOString();
  
  if (writeJSON(PROJECTS_PATH, projectsData)) {
    res.json(answer);
  } else {
    res.status(500).json({ error: 'Failed to save answer' });
  }
});

// Get all answers for a project
router.get('/projects/:projectId/answers', (req, res) => {
  const data = readJSON(PROJECTS_PATH);
  if (!data) {
    return res.status(500).json({ error: 'Failed to load projects' });
  }
  
  const project = data.projects.find(p => p.id === req.params.projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  res.json(project.answers || []);
});

// Get a specific answer
router.get('/projects/:projectId/answers/:controlId', (req, res) => {
  const data = readJSON(PROJECTS_PATH);
  if (!data) {
    return res.status(500).json({ error: 'Failed to load projects' });
  }
  
  const project = data.projects.find(p => p.id === req.params.projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const answer = project.answers.find(a => a.controlId === req.params.controlId);
  if (!answer) {
    return res.status(404).json({ error: 'Answer not found' });
  }
  
  res.json(answer);
});

// ========================================
// ANALYTICS & REPORTING
// ========================================

// Get project statistics
router.get('/projects/:projectId/stats', (req, res) => {
  const projectsData = readJSON(PROJECTS_PATH);
  const controlsData = readJSON(CONTROLS_PATH);
  
  if (!projectsData || !controlsData) {
    return res.status(500).json({ error: 'Failed to load data' });
  }
  
  const project = projectsData.projects.find(p => p.id === req.params.projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const totalControls = controlsData.controls.length;
  const answeredControls = project.answers.length;
  const readyControls = project.answers.filter(a => a.status === 'ready').length;
  const partialControls = project.answers.filter(a => a.status === 'partial').length;
  const missingControls = project.answers.filter(a => a.status === 'missing').length;
  
  const stats = {
    projectId: project.id,
    projectName: project.name,
    totalControls,
    answeredControls,
    unansweredControls: totalControls - answeredControls,
    readyControls,
    partialControls,
    missingControls,
    progressPercentage: totalControls > 0 ? Math.round((answeredControls / totalControls) * 100) : 0,
    readinessPercentage: totalControls > 0 ? Math.round((readyControls / totalControls) * 100) : 0
  };
  
  res.json(stats);
});

module.exports = router;

