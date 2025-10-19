import { useState } from 'react';
import { Shield, Bot, FileText, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (userName: string) => void;
  onStartStoryBot: (userName: string, framework: 'iso27001' | 'cmmc') => void;
  onStartTodoList: (userName: string, framework: 'iso27001' | 'cmmc') => void;
}

export default function WelcomeScreen({ onStart, onStartStoryBot, onStartTodoList }: WelcomeScreenProps) {
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<'iso27001' | 'cmmc'>('iso27001');

  const handleStart = (option: 'full' | 'story' | 'todo', framework: 'iso27001' | 'cmmc' = selectedFramework) => {
    if (!userName.trim()) {
      setError('Please enter your name first');
      return;
    }
    
    if (option === 'full') {
      onStart(userName.trim());
    } else if (option === 'story') {
      onStartStoryBot(userName.trim(), framework);
    } else if (option === 'todo') {
      onStartTodoList(userName.trim(), framework);
    }
  };

  const frameworkInfo = {
    iso27001: {
      title: 'ISO 27001:2022',
      subtitle: 'Information Security Management',
      fullControls: 93,
      botQuestions: 20,
      todoControls: 93
    },
    cmmc: {
      title: 'CMMC 2.0',
      subtitle: 'Cybersecurity Maturity Model',
      fullControls: 110,
      botQuestions: 20,
      todoControls: 110
    }
  };

  const currentFramework = frameworkInfo[selectedFramework];

  return (
    <div className="welcome-screen-super">
      <div className="welcome-content-super">
        <div className="welcome-header-super">
          <div className="welcome-logo-super">
            <img 
              src="/cyber-owl-logo.png" 
              alt="Cyber Owl AI" 
              className="cyber-owl-logo"
            />
            <Sparkles className="sparkle-icon" size={40} />
          </div>
          <h1 className="welcome-title-super">
            {currentFramework.title} Readiness Studio
          </h1>
          <p className="welcome-subtitle-super">
            {currentFramework.subtitle} • Choose your assessment method
          </p>
        </div>

        <div className="name-input-super">
          <input
            type="text"
            className="name-input-field"
            placeholder="Your name"
            value={userName}
            onChange={(e) => {
              setUserName(e.target.value);
              setError('');
            }}
            autoFocus
          />
          {error && <p className="error-text-super">{error}</p>}
        </div>

        <div className="options-grid-super">
          <button 
            className="option-card-super option-1"
            onClick={() => handleStart('full')}
            disabled={!userName.trim()}
          >
            <div className="option-icon-wrapper">
              <Shield size={56} />
            </div>
            <h3>Full Assessment</h3>
            <p>Complete all {currentFramework.fullControls} controls</p>
            <div className="option-badge">Recommended</div>
          </button>

          <button 
            className="option-card-super option-2"
            onClick={() => handleStart('story')}
            disabled={!userName.trim()}
          >
            <div className="option-icon-wrapper">
              <Bot size={56} />
            </div>
            <h3>Quick Bot Mode</h3>
            <p>{currentFramework.botQuestions} strategic questions</p>
            <div className="option-badge">Fast Track</div>
          </button>

          <button 
            className="option-card-super option-3"
            onClick={() => handleStart('todo')}
            disabled={!userName.trim()}
          >
            <div className="option-icon-wrapper">
              <FileText size={56} />
            </div>
            <h3>Download Checklist</h3>
            <p>{currentFramework.todoControls} {selectedFramework === 'iso27001' ? 'ISO' : 'CMMC'} controls</p>
            <div className="option-badge">Offline</div>
          </button>
        </div>

        <div className="framework-tabs-super">
          <button 
            className={`framework-tab ${selectedFramework === 'iso27001' ? 'active' : ''}`}
            onClick={() => setSelectedFramework('iso27001')}
          >
            ISO 27001:2022
          </button>
          <button 
            className={`framework-tab ${selectedFramework === 'cmmc' ? 'active' : ''}`}
            onClick={() => setSelectedFramework('cmmc')}
          >
            CMMC 2.0
          </button>
        </div>
      </div>
    </div>
  );
}
