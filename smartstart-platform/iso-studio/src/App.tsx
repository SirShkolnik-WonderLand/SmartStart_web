import { useState, useEffect } from 'react';
import { Shield, Search, Filter, Download, Upload, BarChart3, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import FrameworkPanel from './components/FrameworkPanel';
import ControlsPanel from './components/ControlsPanel';
import InspectorPanel from './components/InspectorPanel';
import StatsDashboard from './components/StatsDashboard';
import { Framework, Control, Project, Stats } from './types';
import './App.css';

function App() {
  const [frameworks, setFrameworks] = useState<Framework[]>([]);
  const [controls, setControls] = useState<Control[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);
  const [selectedControl, setSelectedControl] = useState<Control | null>(null);
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
  const [activeTab, setActiveTab] = useState<'studio' | 'dashboard'>('studio');

  // Load frameworks
  useEffect(() => {
    loadFrameworks();
    loadProject();
  }, []);

  // Load controls when framework changes
  useEffect(() => {
    if (selectedFramework) {
      loadControls(selectedFramework.id);
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
      const response = await fetch('/api/iso/frameworks');
      const data = await response.json();
      setFrameworks(data.frameworks);
    } catch (error) {
      console.error('Error loading frameworks:', error);
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
    return (
      control.title.toLowerCase().includes(searchLower) ||
      control.code.toLowerCase().includes(searchLower) ||
      control.description.toLowerCase().includes(searchLower) ||
      control.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

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

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'studio' ? 'active' : ''}`}
            onClick={() => setActiveTab('studio')}
          >
            <BarChart3 size={18} />
            Studio
          </button>
          <button 
            className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <BarChart3 size={18} />
            Dashboard
          </button>
        </div>
      </header>

      {activeTab === 'studio' && (
        <div className="main-grid">
          <FrameworkPanel
            frameworks={frameworks}
            selectedFramework={selectedFramework}
            onSelectFramework={setSelectedFramework}
          />

          <div className="controls-section">
            <div className="controls-header">
              <div className="controls-title">
                <Filter size={20} />
                <span>Controls</span>
                {controls.length > 0 && (
                  <span className="count-badge">{filteredControls.length} / {controls.length}</span>
                )}
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
            </div>

            <div className="controls-grid">
              {filteredControls.map(control => {
                const answer = project?.answers[control.id];
                const status = answer?.status || 'missing';
                
                return (
                  <div
                    key={control.id}
                    className={`control-card ${selectedControl?.id === control.id ? 'selected' : ''} status-${status}`}
                    onClick={() => setSelectedControl(control)}
                  >
                    <div className="control-header">
                      <div className="control-code">{control.code}</div>
                      <div className="status-icon">
                        {status === 'ready' && <CheckCircle size={20} className="icon-ready" />}
                        {status === 'partial' && <AlertCircle size={20} className="icon-partial" />}
                        {status === 'missing' && <XCircle size={20} className="icon-missing" />}
                      </div>
                    </div>
                    <div className="control-title">{control.title}</div>
                    <div className="control-description">{control.description.substring(0, 100)}...</div>
                    {control.tags && control.tags.length > 0 && (
                      <div className="control-tags">
                        {control.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <InspectorPanel
            control={selectedControl}
            answer={selectedControl ? project?.answers[selectedControl.id] : null}
            onSave={handleSaveAnswer}
          />
        </div>
      )}

      {activeTab === 'dashboard' && (
        <StatsDashboard
          stats={stats}
          controls={controls}
          project={project}
          frameworks={frameworks}
        />
      )}
    </div>
  );
}

export default App;

