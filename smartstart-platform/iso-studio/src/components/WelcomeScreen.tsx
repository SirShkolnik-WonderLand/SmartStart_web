import { useState } from 'react';
import { Shield, Sparkles, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: (userName: string) => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }
    onStart(userName.trim());
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
          Advanced Compliance Tracking & Assessment Tool
        </p>

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

          <button type="submit" className="btn-welcome">
            <span>Start Assessment</span>
            <ArrowRight size={20} />
          </button>
        </form>

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
      </div>
    </div>
  );
}

