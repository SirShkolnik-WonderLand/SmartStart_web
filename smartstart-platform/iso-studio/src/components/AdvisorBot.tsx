import React, { useState, useEffect, useRef } from 'react';
import { Bot, AlertTriangle, TrendingUp, Shield, Info, X } from 'lucide-react';
import { Stats, Control, Project } from '../types';

interface AdvisorBotProps {
  stats: Stats;
  controls: Control[];
  project: Project | null;
  userName: string;
}

interface AdviceMessage {
  type: 'warning' | 'info' | 'success' | 'tip';
  title: string;
  message: string;
  action?: string;
  priority: number;
}

export default function AdvisorBot({ stats, controls, project, userName }: AdvisorBotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentAdvice, setCurrentAdvice] = useState<AdviceMessage | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Show advisor when data changes
    showAdvisor();
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [stats, project]);

  const showAdvisor = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Generate advice
    generateAdvice();

    // Show the advisor
    setIsVisible(true);

    // Auto-hide after 7 seconds
    timeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 7000);
  };

  const handleClose = () => {
    setIsVisible(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const generateAdvice = () => {
    const advice: AdviceMessage[] = [];

    // High priority warnings
    if (stats.readinessPercentage === 0) {
      advice.push({
        type: 'warning',
        title: '🚨 Zero Controls Ready',
        message: 'You haven\'t started implementing any ISO 27001 controls yet. This leaves your organization vulnerable to cyber attacks.',
        action: 'Start with A.5.1 (Policies for information security)',
        priority: 10
      });
    }

    if (stats.missingControls > 50) {
      advice.push({
        type: 'warning',
        title: '⚠️ Critical Gap Detected',
        message: `${stats.missingControls} controls are missing. Organizations with incomplete security controls face 3x higher breach risk.`,
        action: 'Focus on Organizational Controls (A.5) first',
        priority: 9
      });
    }

    // Cybersecurity statistics
    if (stats.readinessPercentage < 30) {
      advice.push({
        type: 'info',
        title: '📊 Recent Cyber Attack Stats',
        message: 'In 2024, 68% of organizations with incomplete ISO 27001 controls experienced data breaches. Companies with full implementation reduced incidents by 87%.',
        action: 'Complete your controls to reduce risk',
        priority: 8
      });
    }

    // Progress encouragement
    if (stats.readyControls > 0 && stats.readyControls < 20) {
      advice.push({
        type: 'success',
        title: '✅ Good Start!',
        message: `You've completed ${stats.readyControls} controls. Keep going! Organizations typically see 40% fewer security incidents after reaching 50% completion.`,
        action: 'Continue with People Controls (A.6)',
        priority: 6
      });
    }

    // Domain-specific advice
    const orgControls = controls.filter(c => c.domainId === 'A5');
    const orgReady = orgControls.filter(c => project?.answers[c.id]?.status === 'ready').length;
    if (orgReady < 10 && orgControls.length > 0) {
      advice.push({
        type: 'tip',
        title: '💡 Quick Win',
        message: 'Organizational Controls (A.5) are the foundation. Start with policies and procedures - they\'re quick to implement and provide immediate compliance.',
        action: 'View A.5 controls',
        priority: 7
      });
    }

    // Risk assessment
    const highRiskControls = controls.filter(c => {
      const answer = project?.answers[c.id];
      return answer && (answer.riskImpact >= 4 || answer.effort >= 4);
    });

    if (highRiskControls.length > 0) {
      advice.push({
        type: 'warning',
        title: '🔴 High-Risk Controls Identified',
        message: `${highRiskControls.length} controls have high risk or effort ratings. These should be prioritized to prevent potential breaches.`,
        action: 'Review high-risk controls',
        priority: 9
      });
    }

    // Sort by priority and get the top one
    advice.sort((a, b) => b.priority - a.priority);
    setCurrentAdvice(advice[0] || null);
  };

  if (!currentAdvice || !isVisible) return null;

  const getIcon = () => {
    switch (currentAdvice.type) {
      case 'warning': return <AlertTriangle size={24} />;
      case 'info': return <Info size={24} />;
      case 'success': return <Shield size={24} />;
      case 'tip': return <TrendingUp size={24} />;
    }
  };

  const getBgColor = () => {
    switch (currentAdvice.type) {
      case 'warning': return 'rgba(239, 68, 68, 0.15)';
      case 'info': return 'rgba(59, 130, 246, 0.15)';
      case 'success': return 'rgba(34, 197, 94, 0.15)';
      case 'tip': return 'rgba(245, 158, 11, 0.15)';
    }
  };

  const getBorderColor = () => {
    switch (currentAdvice.type) {
      case 'warning': return 'rgba(239, 68, 68, 0.4)';
      case 'info': return 'rgba(59, 130, 246, 0.4)';
      case 'success': return 'rgba(34, 197, 94, 0.4)';
      case 'tip': return 'rgba(245, 158, 11, 0.4)';
    }
  };

  return (
    <div className="advisor-bot-popup" style={{ background: getBgColor(), borderColor: getBorderColor() }}>
      <div className="advisor-bot-header">
        <div className="advisor-bot-avatar">
          <Bot size={28} />
        </div>
        <div className="advisor-bot-info">
          <h3 className="advisor-bot-name">Security Advisor</h3>
          <p className="advisor-bot-role">ISO 27001 Compliance Expert</p>
        </div>
        <button className="advisor-bot-close" onClick={handleClose}>
          <X size={20} />
        </button>
      </div>
      
      <div className="advisor-bot-content">
        <div className="advisor-bot-icon" style={{ color: getBorderColor() }}>
          {getIcon()}
        </div>
        <div className="advisor-bot-message">
          <h4 className="advisor-bot-title">{currentAdvice.title}</h4>
          <p className="advisor-bot-text">{currentAdvice.message}</p>
          {currentAdvice.action && (
            <div className="advisor-bot-action">
              <span className="advisor-bot-action-label">💡 Suggested Action:</span>
              <span className="advisor-bot-action-text">{currentAdvice.action}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

