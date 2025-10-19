import { useState, useEffect } from 'react';
import { Shield, Search, Download, Upload, BarChart3, ChevronRight, Grid3x3, List, Filter, Sparkles } from 'lucide-react';
import StatsDashboard from './components/StatsDashboard';
import ControlsTable from './components/ControlsTable';
import ControlDetails from './components/ControlDetails';
import DomainOverview from './components/DomainOverview';
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
  const [viewStyle, setViewStyle] = useState<'grid' | 'table'>('table');
  const [loading, setLoading] = useState(true);

  // Load frameworks
  useEffect(() => {
    loadFrameworks();
    loadProject();
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

  const exportData = () => {
    if (!project) return;
    
    const dataStr = JSON.stringify({
      project,
      stats,
      exportedAt: new Date().toISOString()
    }, null, 2);
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `iso-assessment-${new Date().toISOString().split('T')[0]}.json`;
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

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <Shield className="logo-icon" size={32} />
            <div>
              <h1>ISO 27001 Readiness Studio</h1>
              <p className="subtitle">Advanced Compliance Tracking & Assessment Tool</p>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="btn-icon" onClick={exportData} title="Export Data">
              <Download size={20} />
            </button>
            <label className="btn-icon" title="Import Data">
              <Upload size={20} />
              <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
            </label>
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

            <ControlsTable
              controls={filteredControls}
              project={project}
              selectedControl={selectedControl}
              onSelectControl={setSelectedControl}
              viewStyle={viewStyle}
            />

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
      </div>
    </div>
  );
}

export default App;

