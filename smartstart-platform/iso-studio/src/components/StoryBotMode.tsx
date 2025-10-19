import React, { useState, useEffect } from 'react';
import { Bot, CheckCircle, XCircle, ArrowRight, ArrowLeft, Sparkles, Trophy, Target, Shield, TrendingUp } from 'lucide-react';
import './StoryBotMode.css';

interface Question {
  id: string;
  category: string;
  question: string;
  options: {
    text: string;
    score: number;
    explanation: string;
  }[];
}

interface StoryBotModeProps {
  framework: 'iso27001' | 'cmmc';
  userName: string;
  onComplete: (results: any) => void;
  onBack: () => void;
}

export default function StoryBotMode({ framework, userName, onComplete, onBack }: StoryBotModeProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [readinessLevel, setReadinessLevel] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);

  const questions: Question[] = [
    {
      id: 'q1',
      category: 'Governance',
      question: 'How mature is your organization\'s information security governance structure?',
      options: [
        { text: 'No formal governance structure exists', score: 0, explanation: 'You need to establish governance first' },
        { text: 'Basic governance with informal policies', score: 2, explanation: 'Good start, but needs formalization' },
        { text: 'Formal governance with documented policies', score: 4, explanation: 'Solid foundation for compliance' },
        { text: 'Mature governance with regular reviews', score: 6, explanation: 'Excellent governance structure!' }
      ]
    },
    {
      id: 'q2',
      category: 'Risk Management',
      question: 'How frequently do you conduct information security risk assessments?',
      options: [
        { text: 'Never or ad-hoc only', score: 0, explanation: 'Risk assessment is critical for ISO 27001' },
        { text: 'Annually', score: 3, explanation: 'Annual assessments are a good baseline' },
        { text: 'Semi-annually', score: 5, explanation: 'Regular assessments show commitment' },
        { text: 'Quarterly or continuous', score: 7, explanation: 'Excellent risk management approach!' }
      ]
    },
    {
      id: 'q3',
      category: 'Access Control',
      question: 'How do you manage user access to information systems?',
      options: [
        { text: 'No formal access control process', score: 0, explanation: 'Access control is fundamental' },
        { text: 'Manual access requests and approvals', score: 2, explanation: 'Needs automation and documentation' },
        { text: 'Automated access management with regular reviews', score: 5, explanation: 'Good access control practices' },
        { text: 'Automated with continuous monitoring and MFA', score: 7, explanation: 'Excellent access control!' }
      ]
    },
    {
      id: 'q4',
      category: 'Incident Response',
      question: 'What is your incident response capability?',
      options: [
        { text: 'No incident response plan', score: 0, explanation: 'Incident response is essential' },
        { text: 'Basic plan but not tested', score: 2, explanation: 'Plan needs testing and refinement' },
        { text: 'Documented plan with annual testing', score: 5, explanation: 'Good incident response readiness' },
        { text: 'Mature plan with regular drills and automation', score: 7, explanation: 'Excellent incident response!' }
      ]
    },
    {
      id: 'q5',
      category: 'Business Continuity',
      question: 'How prepared is your organization for business disruptions?',
      options: [
        { text: 'No business continuity planning', score: 0, explanation: 'BCP is crucial for resilience' },
        { text: 'Basic plan exists but not tested', score: 2, explanation: 'Plan needs testing and updates' },
        { text: 'Tested plan with regular reviews', score: 5, explanation: 'Good business continuity posture' },
        { text: 'Comprehensive BCP with regular drills', score: 7, explanation: 'Excellent business continuity!' }
      ]
    },
    {
      id: 'q6',
      category: 'Compliance',
      question: 'What is your current compliance posture?',
      options: [
        { text: 'No formal compliance program', score: 0, explanation: 'Compliance program is foundational' },
        { text: 'Ad-hoc compliance activities', score: 2, explanation: 'Needs formal compliance framework' },
        { text: 'Structured compliance program', score: 5, explanation: 'Good compliance foundation' },
        { text: 'Mature compliance with automation', score: 7, explanation: 'Excellent compliance maturity!' }
      ]
    }
  ];

  const handleAnswer = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (selectedOption !== null) {
      const question = questions[currentQuestion];
      const newAnswers = {
        ...answers,
        [question.id]: question.options[selectedOption].score
      };
      setAnswers(newAnswers);

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption(null);
        setShowExplanation(false);
      } else {
        calculateResults(newAnswers);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  const calculateResults = (allAnswers: { [key: string]: number }) => {
    const totalScore = Object.values(allAnswers).reduce((sum, score) => sum + score, 0);
    const maxScore = questions.length * 7;
    const percentage = Math.round((totalScore / maxScore) * 100);
    
    setFinalScore(percentage);
    
    let level = '';
    const recs: string[] = [];
    
    if (percentage >= 80) {
      level = 'Excellent';
      recs.push('You\'re ready for ISO 27001:2022 certification!');
      recs.push('Consider advanced security frameworks like CMMC Level 3');
    } else if (percentage >= 60) {
      level = 'Good';
      recs.push('You\'re close to ISO 27001:2022 readiness');
      recs.push('Focus on formalizing policies and procedures');
    } else if (percentage >= 40) {
      level = 'Fair';
      recs.push('You have a foundation but need significant work');
      recs.push('Start with governance and risk management');
    } else {
      level = 'Needs Improvement';
      recs.push('You need to establish basic security controls first');
      recs.push('Focus on governance, access control, and incident response');
    }
    
    setReadinessLevel(level);
    setRecommendations(recs);
    setIsComplete(true);
  };

  if (isComplete) {
    return (
      <div className="story-bot-complete">
        <div className="story-bot-complete-content animate-scale-in">
          <div className="complete-header">
            <div className="trophy-icon">
              <Trophy size={48} />
            </div>
            <h1 className="complete-title">Assessment Complete! 🎉</h1>
            <p className="complete-subtitle">Great job, {userName}!</p>
          </div>

          <div className="score-card">
            <div className="score-circle">
              <div className="score-value">{finalScore}%</div>
              <div className="score-label">Readiness Score</div>
            </div>
            <div className="readiness-level">
              <Shield size={32} />
              <span>{readinessLevel}</span>
            </div>
          </div>

          <div className="recommendations-card">
            <h3 className="recommendations-title">Your Recommendations</h3>
            <ul className="recommendations-list">
              {recommendations.map((rec, index) => (
                <li key={index} className="recommendation-item">
                  <CheckCircle size={20} />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="complete-actions">
            <button className="btn-secondary" onClick={onBack}>
              Back to Dashboard
            </button>
            <button className="btn-primary" onClick={() => onComplete({ score: finalScore, level: readinessLevel, answers })}>
              View Detailed Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="story-bot-mode">
      <div className="story-bot-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
          <span className="progress-text">{currentQuestion + 1} / {questions.length}</span>
        </div>
      </div>

      <div className="story-bot-content">
        <div className="bot-avatar-large animate-float">
          <Bot size={64} />
        </div>

        <div className="question-card animate-slide-up">
          <div className="question-category">{question.category}</div>
          <h2 className="question-text">{question.question}</h2>

          <div className="options-grid">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`option-card ${selectedOption === index ? 'selected' : ''}`}
                onClick={() => handleAnswer(index)}
                disabled={showExplanation}
              >
                <div className="option-number">{index + 1}</div>
                <div className="option-text">{option.text}</div>
                {selectedOption === index && (
                  <div className="option-check">
                    <CheckCircle size={24} />
                  </div>
                )}
              </button>
            ))}
          </div>

          {showExplanation && (
            <div className="explanation-card animate-fade-in">
              <div className="explanation-icon">
                <Sparkles size={24} />
              </div>
              <p className="explanation-text">
                {question.options[selectedOption!].explanation}
              </p>
            </div>
          )}
        </div>

        <div className="story-bot-actions">
          <button
            className="btn-nav"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft size={20} />
            Previous
          </button>
          
          <button
            className="btn-nav btn-primary"
            onClick={handleNext}
            disabled={selectedOption === null}
          >
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

