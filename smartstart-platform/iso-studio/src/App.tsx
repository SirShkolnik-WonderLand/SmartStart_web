import { useState, useEffect } from 'react';
import { Shield, Search, Download, Upload, BarChart3, ChevronRight, Grid3x3, List, Filter, Sparkles, User, Mail } from 'lucide-react';
import WelcomeScreen from './components/WelcomeScreen';
import StatsDashboard from './components/StatsDashboard';
import ControlsTable from './components/ControlsTable';
import ControlDetails from './components/ControlDetails';
import DomainOverview from './components/DomainOverview';
import StoryView from './components/StoryView';
import ViewModeToggle from './components/ViewModeToggle';
import LoadingState from './components/LoadingState';
import EmptyState from './components/EmptyState';
import ProgressRing from './components/ProgressRing';
import StatusBadge from './components/StatusBadge';
import { Framework, Control, Project, Stats } from './types';
import './App.css';

function App() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalControls: 0,
    readyControls: 0,
    partialControls: 0,
    missingControls: 0,
    progressPercentage: 0,
    readinessPercentage: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'overview' | 'domains' | 'controls'>('overview');
  const [viewStyle, setViewStyle] = useState<'story' | 'list' | 'compact'>('story');
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [showWelcome, setShowWelcome] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);

  // Load frameworks
  useEffect(() => {
    loadFrameworks();
    loadProject();
    
    // Check if user already logged in
    const savedUser = localStorage.getItem('iso_studio_user');
    const savedEmail = localStorage.getItem('iso_studio_email');
    if (savedUser) {
      setUserName(savedUser);
      setShowWelcome(false);
    }
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
  }, []);

  // Load controls when framework changes
  useEffect(() => {
    if (selectedFramework) {
      loadControls(selectedFramework.id);
      setViewMode('overview');
      setSelectedDomain(null);
      setSelectedControl(null);
    }
  }, [selectedFramework]);

  // Update stats when answers change
  useEffect(() => {
    if (project && controls.length > 0) {
      updateStats();
    }
  }, [project, controls]);

  const loadFrameworks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/iso/frameworks');
      const data = await response.json();
      setFrameworks(data.frameworks);
    } catch (error) {
      console.error('Error loading frameworks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadControls = async (frameworkId: string) => {
    try {
      const response = await fetch(`/api/iso/frameworks/${frameworkId}/controls`);
      const data = await response.json();
      setControls(data.controls);
    } catch (error) {
      console.error('Error loading controls:', error);
    }
  };

  const loadProject = () => {
    const saved = localStorage.getItem('iso_project');
    if (saved) {
      setProject(JSON.parse(saved));
    } else {
      const newProject: Project = {
        id: `project_${Date.now()}`,
        name: 'ISO 27001:2022 Assessment',
        frameworkId: 'iso27001_2022',
        answers: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setProject(newProject);
      saveProject(newProject);
    }
  };

  const saveProject = (updatedProject: Project) => {
    localStorage.setItem('iso_project', JSON.stringify(updatedProject));
    setProject(updatedProject);
  };

  const updateStats = () => {
    if (!project) return;

    const total = controls.length;
    const ready = controls.filter(c => project.answers[c.id]?.status === 'ready').length;
    const partial = controls.filter(c => project.answers[c.id]?.status === 'partial').length;
    const missing = controls.filter(c => !project.answers[c.id] || project.answers[c.id]?.status === 'missing').length;

    setStats({
      totalControls: total,
      readyControls: ready,
      partialControls: partial,
      missingControls: missing,
      progressPercentage: total > 0 ? Math.round(((ready + partial) / total) * 100) : 0,
      readinessPercentage: total > 0 ? Math.round((ready / total) * 100) : 0
    });
  };

  const handleSaveAnswer = (answer: any) => {
    if (!project || !selectedControl) return;

    const updatedProject = {
      ...project,
      answers: {
        ...project.answers,
        [selectedControl.id]: {
          ...answer,
          updatedAt: new Date().toISOString()
        }
      },
      updatedAt: new Date().toISOString()
    };

    saveProject(updatedProject);
  };

  const handleWelcomeStart = (name: string) => {
    setUserName(name);
    setShowWelcome(false);
    localStorage.setItem('iso_studio_user', name);
  };

  const handleSaveEmail = async () => {
    if (!userEmail || !userEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    try {
      // Save email to localStorage
      localStorage.setItem('iso_studio_email', userEmail);
      
      // Send data to backend
      const response = await fetch('/api/iso/save-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: userName,
          email: userEmail,
          project: project,
          stats: stats,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        alert('Email saved successfully! You will receive your assessment results shortly.');
        setShowEmailModal(false);
      } else {
        alert('Failed to save email. Please try again.');
      }
    } catch (error) {
      console.error('Error saving email:', error);
      alert('Failed to save email. Please try again.');
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      userName,
      userEmail,
      project,
      stats,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iso-assessment-${userName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportData = () => {
    if (!project) return;
    
    const dataStr = JSON.stringify({
      userName,
      project,
      stats,
      exportedAt: new Date().toISOString()
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iso-assessment-${userName}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.project) {
          setProject(data.project);
          saveProject(data.project);
          alert('✅ Data imported successfully!');
        }
      } catch (error) {
        alert('❌ Error importing data');
      }
    };
    reader.readAsText(file);
  };

  const filteredControls = controls.filter(control => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      control.title.toLowerCase().includes(searchLower) ||
      control.code.toLowerCase().includes(searchLower) ||
      control.description.toLowerCase().includes(searchLower) ||
      control.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'ready' && project?.answers[control.id]?.status === 'ready') ||
      (statusFilter === 'partial' && project?.answers[control.id]?.status === 'partial') ||
      (statusFilter === 'missing' && (!project?.answers[control.id] || project?.answers[control.id]?.status === 'missing'));
    
    return matchesSearch && matchesStatus;
  });

  const getDomainStats = (domainId: string) => {
    const domainControls = controls.filter(c => c.domainId === domainId);
    const ready = domainControls.filter(c => project?.answers[c.id]?.status === 'ready').length;
    const partial = domainControls.filter(c => project?.answers[c.id]?.status === 'partial').length;
    const missing = domainControls.filter(c => !project?.answers[c.id] || project?.answers[c.id]?.status === 'missing').length;
    const progress = domainControls.length > 0 ? Math.round((ready / domainControls.length) * 100) : 0;
    
    return { total: domainControls.length, ready, partial, missing, progress };
  };

  if (showWelcome) {
    return <WelcomeScreen onStart={handleWelcomeStart} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-logo">
              <img 
                src="/assets/images/AliceSolutionsGroup-logo-owl-rabbit-fox.png" 
                alt="AliceSolutionsGroup"
                className="company-logo-small"
              />
            </div>
            <div>
              <h1>ISO 27001 Readiness Studio</h1>
              <p className="subtitle">Advanced Compliance Tracking & Assessment Tool</p>
            </div>
          </div>
          
                 <div className="header-right">
                   <div className="user-info">
                     <User size={18} />
                     <span>{userName}</span>
                   </div>
                   <div className="header-actions">
                     <button className="btn-icon" onClick={() => setShowEmailModal(true)} title="Save Email & Send Results">
                       <Mail size={20} />
                     </button>
                     <button className="btn-icon" onClick={handleExportData} title="Export Data">
                       <Download size={20} />
                     </button>
                     <label className="btn-icon" title="Import Data">
                       <Upload size={20} />
                       <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
                     </label>
                   </div>
                 </div>
        </div>

        <div className="breadcrumb">
          <button 
            className={`breadcrumb-item ${viewMode === 'overview' ? 'active' : ''}`}
            onClick={() => setViewMode('overview')}
          >
            <BarChart3 size={16} />
            Overview
          </button>
          {selectedFramework && (
            <>
              <ChevronRight size={16} className="breadcrumb-separator" />
              <button 
                className={`breadcrumb-item ${viewMode === 'domains' ? 'active' : ''}`}
                onClick={() => setViewMode('domains')}
              >
                Domains
              </button>
            </>
          )}
          {selectedDomain && (
            <>
              <ChevronRight size={16} className="breadcrumb-separator" />
              <button 
                className={`breadcrumb-item ${viewMode === 'controls' ? 'active' : ''}`}
                onClick={() => setViewMode('controls')}
              >
                Controls
              </button>
            </>
          )}
        </div>
      </header>

      <div className="main-content">
        {loading ? (
          <LoadingState message="Loading frameworks..." />
        ) : !selectedFramework ? (
          <div className="framework-selection">
            <div className="framework-selection-header">
              <div className="sparkle-icon">
                <Sparkles size={32} />
              </div>
              <h2>Select a Framework</h2>
              <p>Choose a compliance framework to begin your assessment journey</p>
            </div>
            <div className="framework-cards">
              {frameworks.map(framework => (
                <div
                  key={framework.id}
                  className="framework-card-large"
                  onClick={() => setSelectedFramework(framework)}
                >
                  <div className="framework-card-glow"></div>
                  <div className="framework-icon">
                    <Shield size={48} />
                  </div>
                  <h3>{framework.name}</h3>
                  <p>{framework.description}</p>
                  <div className="framework-meta">
                    <span>{framework.domains.length} Domains</span>
                    <span>•</span>
                    <span>{framework.controlCount} Controls</span>
                  </div>
                  <div className="framework-card-arrow">
                    <ChevronRight size={24} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : viewMode === 'overview' ? (
          <StatsDashboard
            stats={stats}
            controls={controls}
            project={project}
            frameworks={frameworks}
            onNavigateToDomains={() => setViewMode('domains')}
          />
        ) : viewMode === 'domains' ? (
          <DomainOverview
            framework={selectedFramework}
            controls={controls}
            project={project}
            onSelectDomain={(domainId) => {
              setSelectedDomain(domainId);
              setViewMode('controls');
            }}
          />
        ) : (
          <div className="controls-view">
            <div className="controls-header-bar">
              <div className="controls-info">
                <h2>
                  {selectedFramework?.domains.find(d => d.id === selectedDomain)?.name || 'Controls'}
                </h2>
                <span className="controls-count">{filteredControls.length} controls</span>
              </div>
              <div className="controls-actions">
                <div className="filter-group">
                  <Filter size={16} />
                  <select 
                    className="filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="ready">✅ Ready</option>
                    <option value="partial">⚠️ Partial</option>
                    <option value="missing">❌ Missing</option>
                  </select>
                </div>
                <div className="search-container">
                  <Search className="search-icon" size={18} />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search controls..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="view-toggle">
                  <button 
                    className={`view-btn ${viewStyle === 'table' ? 'active' : ''}`}
                    onClick={() => setViewStyle('table')}
                    title="Table View"
                  >
                    <List size={18} />
                  </button>
                  <button 
                    className={`view-btn ${viewStyle === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewStyle('grid')}
                    title="Grid View"
                  >
                    <Grid3x3 size={18} />
                  </button>
                </div>
              </div>
            </div>

            <ViewModeToggle
              currentMode={viewStyle}
              onModeChange={setViewStyle}
            />

            {viewStyle === 'story' ? (
              <StoryView
                controls={filteredControls}
                project={project}
                onSelectControl={setSelectedControl}
              />
            ) : (
              <ControlsTable
                controls={filteredControls}
                project={project}
                selectedControl={selectedControl}
                onSelectControl={setSelectedControl}
                viewStyle={viewStyle === 'list' ? 'table' : 'grid'}
              />
            )}

            {selectedControl && (
              <ControlDetails
                control={selectedControl}
                answer={project?.answers[selectedControl.id]}
                onSave={handleSaveAnswer}
                onClose={() => setSelectedControl(null)}
              />
            )}
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && (
          <div className="modal-backdrop animate-fade-in" onClick={() => setShowEmailModal(false)}>
            <div className="modal-content animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Save Email & Send Results</h2>
                <button className="modal-close-btn" onClick={() => setShowEmailModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                  Enter your email to receive your ISO 27001 assessment results and save your progress.
                </p>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="your.email@company.com"
                  />
                </div>
                <div className="form-actions">
                  <button className="btn-save" onClick={handleSaveEmail}>
                    Save & Send Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

