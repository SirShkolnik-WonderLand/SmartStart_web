import { useState } from 'react';
import { Shield, Sparkles, ArrowRight, Bot, Target } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (userName: string) => void;
  onStartStoryBot: (userName: string, framework: 'iso27001' | 'cmmc') => void;
}

export default function WelcomeScreen({ onStart, onStartStoryBot }: WelcomeScreenProps) {
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [showFrameworkSelect, setShowFrameworkSelect] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }
    onStart(userName.trim());
  };

  const handleStoryBotClick = () => {
    if (!userName.trim()) {
      setError('Please enter your name first');
      return;
    }
    setShowFrameworkSelect(true);
  };

  const handleFrameworkSelect = (framework: 'iso27001' | 'cmmc') => {
    onStartStoryBot(userName.trim(), framework);
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-logo">
          <div className="logo-container">
            <img 
              src="/assets/images/AliceSolutionsGroup-logo-owl-rabbit-fox.png" 
              alt="AliceSolutionsGroup Logo"
              className="company-logo"
            />
          </div>
        </div>

        <div className="welcome-icon">
          <Shield size={80} />
        </div>

        <h1 className="welcome-title">
          Welcome to ISO 27001
          <br />
          <span className="gradient-text">Readiness Studio</span>
        </h1>

        <p className="welcome-subtitle">
          Choose your assessment method below
        </p>

        <div className="assessment-methods-info">
          <div className="method-card">
            <div className="method-icon">
              <Target size={32} />
            </div>
            <div className="method-content">
              <h3>Full Questionnaire</h3>
              <p>Complete all 93 controls manually with detailed assessment</p>
              <span className="method-badge">Recommended</span>
            </div>
          </div>
          <div className="method-card">
            <div className="method-icon">
              <Bot size={32} />
            </div>
            <div className="method-content">
              <h3>Story Bot Mode</h3>
              <p>Quick 20-question assessment with AI-guided recommendations</p>
              <span className="method-badge">Fast Track</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="welcome-form">
          <div className="form-group">
            <label htmlFor="userName" className="form-label">
              Enter your name to begin
            </label>
            <input
              id="userName"
              type="text"
              className="form-input"
              placeholder="e.g., John Doe, CISO"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                setError('');
              }}
              autoFocus
            />
            {error && <p className="error-message">{error}</p>}
          </div>

          <button type="submit" className="btn-welcome btn-full-questionnaire">
            <Target size={20} />
            <span>Start Full Questionnaire</span>
            <ArrowRight size={20} />
          </button>
        </form>

        {!showFrameworkSelect ? (
          <>
            <div className="welcome-divider">
              <span>OR</span>
            </div>

            <button 
              className="btn-story-bot"
              onClick={handleStoryBotClick}
              disabled={!userName.trim()}
            >
              <Bot size={24} />
              <div>
                <span className="story-bot-title">Start Story Bot Mode</span>
                <span className="story-bot-subtitle">20 quick questions with AI recommendations</span>
              </div>
              <ArrowRight size={20} />
            </button>

            <div className="welcome-features">
              <div className="feature-item">
                <Sparkles size={20} />
                <span>93 ISO 27001:2022 Controls</span>
              </div>
              <div className="feature-item">
                <Sparkles size={20} />
                <span>Real-time Progress Tracking</span>
              </div>
              <div className="feature-item">
                <Sparkles size={20} />
                <span>Export & Share Reports</span>
              </div>
            </div>
          </>
        ) : (
          <div className="framework-selection-modal">
            <h3 className="framework-selection-title">Choose Your Framework</h3>
            <div className="framework-cards">
              <button 
                className="framework-card"
                onClick={() => handleFrameworkSelect('iso27001')}
              >
                <Shield size={48} />
                <div className="framework-card-content">
                  <h4>ISO 27001:2022</h4>
                  <p>Information Security Management</p>
                  <span className="framework-badge">93 Controls</span>
                </div>
              </button>
              <button 
                className="framework-card"
                onClick={() => handleFrameworkSelect('cmmc')}
              >
                <Target size={48} />
                <div className="framework-card-content">
                  <h4>CMMC 2.0</h4>
                  <p>Cybersecurity Maturity Model</p>
                  <span className="framework-badge">110 Controls</span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

