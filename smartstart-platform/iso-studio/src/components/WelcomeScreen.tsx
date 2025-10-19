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
  const [todoListFramework, setTodoListFramework] = useState<'iso27001' | 'cmmc'>('iso27001');

  const handleStart = (option: 'full' | 'story' | 'todo', framework: 'iso27001' | 'cmmc' = 'iso27001') => {
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
            ISO 27001 Readiness Studio
          </h1>
          <p className="welcome-subtitle-super">
            Choose your assessment method
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
            <p>Complete all 93 controls</p>
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
            <p>20 strategic questions</p>
            <div className="option-badge">Fast Track</div>
          </button>

          <button 
            className="option-card-super option-3"
            onClick={() => handleStart('todo', todoListFramework)}
            disabled={!userName.trim()}
          >
            <div className="option-icon-wrapper">
              <FileText size={56} />
            </div>
            <h3>Download Checklist</h3>
            <p>{todoListFramework === 'iso27001' ? '93 ISO controls' : '110 CMMC controls'}</p>
            <div className="option-badge">Offline</div>
          </button>
        </div>

        <div className="framework-tabs-super">
          <button 
            className={`framework-tab ${todoListFramework === 'iso27001' ? 'active' : ''}`}
            onClick={() => setTodoListFramework('iso27001')}
          >
            ISO 27001:2022
          </button>
          <button 
            className={`framework-tab ${todoListFramework === 'cmmc' ? 'active' : ''}`}
            onClick={() => setTodoListFramework('cmmc')}
          >
            CMMC 2.0
          </button>
        </div>
      </div>
    </div>
  );
}
