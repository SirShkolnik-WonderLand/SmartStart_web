import React, { useState } from 'react';
import { FileText, Download, Mail, CheckCircle, Circle, ArrowLeft, Sparkles } from 'lucide-react';

interface SimpleTodoListProps {
  framework: 'iso27001' | 'cmmc';
  userName: string;
  onBack: () => void;
}

export default function SimpleTodoList({ framework, userName, onBack }: SimpleTodoListProps) {
  // Load saved email if available
  const [email, setEmail] = useState(() => localStorage.getItem('todoListEmail') || '');
  const [emailError, setEmailError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const todoItems = framework === 'iso27001' ? [
    'Establish Information Security Policy (A.5.1)',
    'Define Roles and Responsibilities (A.6.1)',
    'Implement Access Control Procedures (A.9.1)',
    'Set up Incident Response Plan (A.5.26)',
    'Conduct Risk Assessment (A.5.7)',
    'Document Business Continuity Plan (A.5.29)',
    'Implement Security Awareness Training (A.7.2)',
    'Set up Logging and Monitoring (A.12.4)',
    'Establish Change Management Process (A.12.1)',
    'Implement Backup and Recovery (A.12.3)',
    'Define Asset Management (A.8.1)',
    'Set up Physical Security Controls (A.11.1)',
    'Implement Encryption (A.10.1)',
    'Establish Supplier Relationships (A.15.1)',
    'Set up Compliance Monitoring (A.18.1)',
    'Document Security Procedures (A.5.1.1)',
    'Implement Network Security (A.13.1)',
    'Set up Vulnerability Management (A.12.6)',
    'Establish Data Classification (A.8.2)',
    'Implement Security Testing (A.14.2)',
  ] : [
    'Establish Access Control Policies (AC.L1-3.1.1)',
    'Implement Audit Logging (AU.L1-3.3.1)',
    'Set up Configuration Management (CM.L1-3.4.1)',
    'Implement Identification and Authentication (IA.L1-3.5.1)',
    'Establish Incident Response (IR.L1-3.6.1)',
    'Set up Maintenance Procedures (MA.L1-3.7.1)',
    'Implement Media Protection (MP.L1-3.8.1)',
    'Establish Physical Protection (PE.L1-3.10.1)',
    'Define Security Planning (PL.L1-3.11.1)',
    'Implement Personnel Security (PS.L1-3.12.1)',
    'Conduct Risk Assessment (RA.L1-3.13.1)',
    'Set up System Acquisition (SA.L1-3.14.1)',
    'Implement System Protection (SC.L1-3.13.1)',
    'Establish System Integrity (SI.L1-3.14.1)',
    'Document Security Controls (AC.L2-3.1.2)',
    'Implement Advanced Access Control (AC.L2-3.1.3)',
    'Set up Continuous Monitoring (SI.L2-3.14.2)',
    'Establish Advanced Audit Logging (AU.L2-3.3.2)',
    'Implement Security Training (AT.L2-3.2.1)',
    'Set up Advanced Incident Response (IR.L2-3.6.2)',
  ];

  const handleDownloadPDF = async () => {
    if (!email || !email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsGenerating(true);
    setEmailError('');

    try {
      // Generate PDF content
      const pdfContent = generatePDFContent();
      
      // Create and download HTML file (can be printed to PDF)
      const blob = new Blob([pdfContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${framework.toUpperCase()}-TODO-List-${userName}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Save email to localStorage for future use
      localStorage.setItem('todoListEmail', email);
      localStorage.setItem('todoListUserName', userName);
      localStorage.setItem('todoListFramework', framework);
      localStorage.setItem('todoListGenerated', new Date().toISOString());
      
      console.log('✅ PDF generated for:', email);
      console.log('✅ Data saved to localStorage');
      
      setIsGenerating(false);
      
      // Show success message
      setTimeout(() => {
        alert(`✅ Success!\n\nTODO List downloaded for:\n${userName}\n${email}\n\nOpen the file and print to PDF for best results!`);
      }, 100);
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      setIsGenerating(false);
      alert('❌ Error generating PDF. Please try again.');
    }
  };

  const generatePDFContent = () => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${framework.toUpperCase()} TODO List - ${userName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      color: #e2e8f0;
      padding: 2rem;
      line-height: 1.6;
    }
    
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: rgba(30, 41, 59, 0.95);
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    }
    
    .header {
      text-align: center;
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 2px solid rgba(59, 130, 246, 0.3);
    }
    
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
    }
    
    h1 {
      font-size: 2.5rem;
      font-weight: 900;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 0.5rem;
    }
    
    .subtitle {
      font-size: 1.1rem;
      color: #94a3b8;
    }
    
    .user-info {
      background: rgba(59, 130, 246, 0.1);
      border: 2px solid rgba(59, 130, 246, 0.3);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .user-info p {
      margin: 0.25rem 0;
      font-size: 1.05rem;
    }
    
    .user-info strong {
      color: #3b82f6;
    }
    
    .todo-section {
      margin-bottom: 2rem;
    }
    
    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #e2e8f0;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .section-title::before {
      content: '';
      width: 4px;
      height: 28px;
      background: linear-gradient(180deg, #3b82f6, #8b5cf6);
      border-radius: 2px;
    }
    
    .todo-list {
      list-style: none;
      counter-reset: todo-counter;
    }
    
    .todo-item {
      counter-increment: todo-counter;
      padding: 1rem 1.5rem;
      margin-bottom: 0.75rem;
      background: rgba(15, 23, 42, 0.5);
      border: 2px solid rgba(59, 130, 246, 0.2);
      border-radius: 12px;
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      transition: all 0.2s ease;
    }
    
    .todo-item::before {
      content: counter(todo-counter);
      width: 32px;
      height: 32px;
      background: rgba(59, 130, 246, 0.2);
      border: 2px solid rgba(59, 130, 246, 0.4);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #3b82f6;
      flex-shrink: 0;
    }
    
    .todo-item:hover {
      border-color: rgba(59, 130, 246, 0.5);
      background: rgba(15, 23, 42, 0.7);
      transform: translateX(8px);
    }
    
    .todo-text {
      flex: 1;
      font-size: 1.05rem;
      color: #e2e8f0;
    }
    
    .footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 2px solid rgba(59, 130, 246, 0.3);
      text-align: center;
      color: #94a3b8;
      font-size: 0.95rem;
    }
    
    .footer strong {
      color: #3b82f6;
    }
    
    @media print {
      body {
        background: white;
        color: #1e293b;
      }
      
      .container {
        background: white;
        box-shadow: none;
      }
      
      .todo-item {
        background: #f8fafc;
        border-color: #cbd5e1;
        color: #1e293b;
      }
      
      .todo-text {
        color: #1e293b;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">📋</div>
      <h1>${framework.toUpperCase()} TODO List</h1>
      <p class="subtitle">Your Complete Compliance Checklist</p>
    </div>
    
    <div class="user-info">
      <p><strong>Name:</strong> ${userName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Framework:</strong> ${framework.toUpperCase()}</p>
      <p><strong>Generated:</strong> ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
    </div>
    
    <div class="todo-section">
      <h2 class="section-title">Compliance Checklist</h2>
      <ol class="todo-list">
        ${todoItems.map((item, index) => `
          <li class="todo-item">
            <span class="todo-text">${item}</span>
          </li>
        `).join('')}
      </ol>
    </div>
    
    <div class="footer">
      <p><strong>AliceSolutionsGroup</strong> - ISO 27001 Readiness Studio</p>
      <p>Generated for ${userName} • ${new Date().getFullYear()}</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  return (
    <div className="simple-todo-list">
      <div className="todo-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="todo-title">
          <FileText size={32} />
          <h1>{framework.toUpperCase()} TODO List</h1>
        </div>
      </div>

      <div className="todo-content">
        <div className="todo-intro">
          <div className="intro-icon">
            <FileText size={48} />
          </div>
          <h2>Your Complete Compliance Checklist</h2>
          <p>Download a beautiful, printable PDF with all the tasks you need to complete for {framework.toUpperCase()} certification.</p>
        </div>

        <div className="todo-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <Mail size={18} />
              Enter your email to download
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="your.email@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
            />
            {emailError && <p className="error-message">{emailError}</p>}
          </div>

          <button 
            className="btn-download-pdf" 
            onClick={handleDownloadPDF}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <div className="spinner-icon"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <Download size={20} />
                Download TODO List PDF
              </>
            )}
          </button>
        </div>

        <div className="todo-preview">
          <h3>What's Included:</h3>
          <ul className="preview-list">
            {todoItems.slice(0, 5).map((item, index) => (
              <li key={index}>
                <Circle size={16} />
                <span>{item}</span>
              </li>
            ))}
            <li className="more-items">
              <span>... and {todoItems.length - 5} more items</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

