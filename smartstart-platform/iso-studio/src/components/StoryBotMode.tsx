import React, { useState, useEffect } from 'react';
import { Bot, CheckCircle, XCircle, ArrowRight, ArrowLeft, Sparkles, Trophy, Target, Shield, TrendingUp, LogOut } from 'lucide-react';
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
  onQuit: () => void;
}

export default function StoryBotMode({ framework, userName, onComplete, onBack, onQuit }: StoryBotModeProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [readinessLevel, setReadinessLevel] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  // Load saved answers
  useEffect(() => {
    const saved = localStorage.getItem(`story_bot_${framework}_answers`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setAnswers(parsed);
      // Find last answered question
      const lastQuestion = questions.findIndex(q => !parsed[q.id]);
      if (lastQuestion > 0) {
        setCurrentQuestion(lastQuestion);
      }
    }
  }, []);

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
    },
    {
      id: 'q7',
      category: 'Security Awareness',
      question: 'How do you ensure employees understand security policies?',
      options: [
        { text: 'No security awareness program', score: 0, explanation: 'Security awareness is critical' },
        { text: 'Annual training only', score: 2, explanation: 'Regular training is needed' },
        { text: 'Quarterly training with testing', score: 5, explanation: 'Good security awareness program' },
        { text: 'Continuous training with phishing simulations', score: 7, explanation: 'Excellent security awareness!' }
      ]
    },
    {
      id: 'q8',
      category: 'Data Protection',
      question: 'How do you protect sensitive data?',
      options: [
        { text: 'No data classification or protection', score: 0, explanation: 'Data protection is essential' },
        { text: 'Basic encryption for some data', score: 2, explanation: 'Needs comprehensive data protection' },
        { text: 'Encryption and access controls for sensitive data', score: 5, explanation: 'Good data protection practices' },
        { text: 'Comprehensive data protection with DLP', score: 7, explanation: 'Excellent data protection!' }
      ]
    },
    {
      id: 'q9',
      category: 'Network Security',
      question: 'How do you secure your network infrastructure?',
      options: [
        { text: 'No network security controls', score: 0, explanation: 'Network security is foundational' },
        { text: 'Basic firewall only', score: 2, explanation: 'Needs comprehensive network security' },
        { text: 'Firewall, IDS/IPS, and segmentation', score: 5, explanation: 'Good network security posture' },
        { text: 'Advanced network security with zero-trust', score: 7, explanation: 'Excellent network security!' }
      ]
    },
    {
      id: 'q10',
      category: 'Vulnerability Management',
      question: 'How do you manage security vulnerabilities?',
      options: [
        { text: 'No vulnerability management process', score: 0, explanation: 'Vulnerability management is critical' },
        { text: 'Ad-hoc vulnerability scanning', score: 2, explanation: 'Needs regular vulnerability management' },
        { text: 'Regular scanning with defined remediation', score: 5, explanation: 'Good vulnerability management' },
        { text: 'Continuous scanning with automated patching', score: 7, explanation: 'Excellent vulnerability management!' }
      ]
    },
    {
      id: 'q11',
      category: 'Change Management',
      question: 'How do you manage changes to IT systems?',
      options: [
        { text: 'No change management process', score: 0, explanation: 'Change management is essential' },
        { text: 'Informal change tracking', score: 2, explanation: 'Needs formal change management' },
        { text: 'Formal change management with approvals', score: 5, explanation: 'Good change management process' },
        { text: 'Automated change management with testing', score: 7, explanation: 'Excellent change management!' }
      ]
    },
    {
      id: 'q12',
      category: 'Physical Security',
      question: 'How do you protect physical assets?',
      options: [
        { text: 'No physical security controls', score: 0, explanation: 'Physical security is important' },
        { text: 'Basic locks and access cards', score: 2, explanation: 'Needs comprehensive physical security' },
        { text: 'Access control, monitoring, and secure areas', score: 5, explanation: 'Good physical security' },
        { text: 'Advanced physical security with biometrics', score: 7, explanation: 'Excellent physical security!' }
      ]
    },
    {
      id: 'q13',
      category: 'Third-Party Risk',
      question: 'How do you manage third-party security risks?',
      options: [
        { text: 'No third-party risk management', score: 0, explanation: 'Third-party risk is significant' },
        { text: 'Basic vendor assessments', score: 2, explanation: 'Needs comprehensive vendor management' },
        { text: 'Regular vendor assessments and contracts', score: 5, explanation: 'Good third-party risk management' },
        { text: 'Continuous vendor monitoring and audits', score: 7, explanation: 'Excellent third-party risk management!' }
      ]
    },
    {
      id: 'q14',
      category: 'Logging & Monitoring',
      question: 'How do you monitor security events?',
      options: [
        { text: 'No security monitoring', score: 0, explanation: 'Security monitoring is critical' },
        { text: 'Basic logging without analysis', score: 2, explanation: 'Needs security monitoring' },
        { text: 'Centralized logging with alerting', score: 5, explanation: 'Good security monitoring' },
        { text: 'SIEM with 24/7 SOC', score: 7, explanation: 'Excellent security monitoring!' }
      ]
    },
    {
      id: 'q15',
      category: 'Backup & Recovery',
      question: 'How do you handle data backup and recovery?',
      options: [
        { text: 'No backup strategy', score: 0, explanation: 'Backup is essential' },
        { text: 'Manual backups occasionally', score: 2, explanation: 'Needs automated backup strategy' },
        { text: 'Automated backups with regular testing', score: 5, explanation: 'Good backup strategy' },
        { text: 'Automated backups with offsite storage', score: 7, explanation: 'Excellent backup strategy!' }
      ]
    },
    {
      id: 'q16',
      category: 'Security Testing',
      question: 'How do you test your security controls?',
      options: [
        { text: 'No security testing', score: 0, explanation: 'Security testing is important' },
        { text: 'Ad-hoc manual testing', score: 2, explanation: 'Needs regular security testing' },
        { text: 'Annual penetration testing', score: 5, explanation: 'Good security testing program' },
        { text: 'Regular pen testing and red team exercises', score: 7, explanation: 'Excellent security testing!' }
      ]
    },
    {
      id: 'q17',
      category: 'Mobile Security',
      question: 'How do you secure mobile devices?',
      options: [
        { text: 'No mobile security controls', score: 0, explanation: 'Mobile security is important' },
        { text: 'Basic password requirements', score: 2, explanation: 'Needs comprehensive mobile security' },
        { text: 'MDM with encryption and remote wipe', score: 5, explanation: 'Good mobile security' },
        { text: 'Advanced MDM with containerization', score: 7, explanation: 'Excellent mobile security!' }
      ]
    },
    {
      id: 'q18',
      category: 'Cloud Security',
      question: 'How do you secure cloud services?',
      options: [
        { text: 'No cloud security controls', score: 0, explanation: 'Cloud security is critical' },
        { text: 'Basic cloud security settings', score: 2, explanation: 'Needs comprehensive cloud security' },
        { text: 'Cloud security policies and monitoring', score: 5, explanation: 'Good cloud security' },
        { text: 'Cloud security with CASB and governance', score: 7, explanation: 'Excellent cloud security!' }
      ]
    },
    {
      id: 'q19',
      category: 'Security Operations',
      question: 'How mature is your security operations?',
      options: [
        { text: 'No dedicated security operations', score: 0, explanation: 'Security operations are important' },
        { text: 'Part-time security staff', score: 2, explanation: 'Needs dedicated security team' },
        { text: 'Dedicated security team with processes', score: 5, explanation: 'Good security operations' },
        { text: '24/7 SOC with automation', score: 7, explanation: 'Excellent security operations!' }
      ]
    },
    {
      id: 'q20',
      category: 'Security Culture',
      question: 'How would you describe your security culture?',
      options: [
        { text: 'Security is not a priority', score: 0, explanation: 'Security culture needs improvement' },
        { text: 'Security is IT\'s responsibility only', score: 2, explanation: 'Needs organization-wide security culture' },
        { text: 'Security is everyone\'s responsibility', score: 5, explanation: 'Good security culture' },
        { text: 'Security-first culture with executive support', score: 7, explanation: 'Excellent security culture!' }
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
      
      // Save to localStorage
      localStorage.setItem(`story_bot_${framework}_answers`, JSON.stringify(newAnswers));

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
      // Load previous answer if exists
      const prevQuestion = questions[currentQuestion - 1];
      const prevAnswer = answers[prevQuestion.id];
      if (prevAnswer !== undefined) {
        setSelectedOption(prevAnswer);
        setShowExplanation(true);
      } else {
        setSelectedOption(null);
        setShowExplanation(false);
      }
    }
  };

  const handleChangeAnswer = () => {
    setSelectedOption(null);
    setShowExplanation(false);
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

  const handleQuit = () => {
    setShowQuitConfirm(true);
  };

  const confirmQuit = () => {
    onQuit();
  };

  const cancelQuit = () => {
    setShowQuitConfirm(false);
  };

  if (showQuitConfirm) {
    return (
      <div className="story-bot-mode">
        <div className="quit-confirm-modal">
          <div className="quit-confirm-content">
            <h2>Quit Assessment?</h2>
            <p>Your progress will be saved. You can return to the full questionnaire anytime.</p>
            <div className="quit-confirm-actions">
              <button className="btn-cancel" onClick={cancelQuit}>
                Continue Assessment
              </button>
              <button className="btn-quit" onClick={confirmQuit}>
                <LogOut size={18} />
                Go to Questionnaire
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
  const hasAnswer = answers[question.id] !== undefined;

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
        <button className="quit-btn" onClick={handleQuit} title="Quit and go to questionnaire">
          <LogOut size={18} />
          Quit
        </button>
      </div>

      <div className="story-bot-content">
        <div className="bot-avatar-large animate-float">
          <Bot size={64} />
        </div>

        <div className="question-card animate-slide-up">
          <div className="question-category">{question.category}</div>
          <h2 className="question-text">{question.question}</h2>

          {hasAnswer && (
            <div className="change-answer-banner">
              <span>You've already answered this question</span>
              <button className="btn-change-answer" onClick={handleChangeAnswer}>
                Change Answer
              </button>
            </div>
          )}

          <div className="options-grid">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`option-card ${selectedOption === index ? 'selected' : ''} ${hasAnswer && answers[question.id] === index ? 'previously-answered' : ''}`}
                onClick={() => handleAnswer(index)}
                disabled={showExplanation && selectedOption !== index}
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
