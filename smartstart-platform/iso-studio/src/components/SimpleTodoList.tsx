import React, { useState } from 'react';
import { FileText, Download, Mail, CheckCircle, Circle, ArrowLeft, Sparkles } from 'lucide-react';
import './SimpleTodoList.css';

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
    // A.5 - Information Security Policies (2 controls)
    'Establish Information Security Policy (A.5.1)',
    'Review and Update Information Security Policy (A.5.2)',
    
    // A.6 - Organization of Information Security (7 controls)
    'Define Roles and Responsibilities (A.6.1)',
    'Segregation of Duties (A.6.2)',
    'Contact with Authorities (A.6.3)',
    'Contact with Special Interest Groups (A.6.4)',
    'Information Security in Project Management (A.6.5)',
    'Information Security for Use of Cloud Services (A.6.6)',
    'Information Security Incident Response Planning (A.6.7)',
    
    // A.7 - Human Resource Security (6 controls)
    'Screening (A.7.1)',
    'Terms and Conditions of Employment (A.7.2)',
    'Information Security Awareness, Education and Training (A.7.3)',
    'Disciplinary Process (A.7.4)',
    'Responsibilities After Termination or Change of Employment (A.7.5)',
    'Confidentiality or Non-Disclosure Agreements (A.7.6)',
    
    // A.8 - Asset Management (10 controls)
    'Inventory of Information and Other Associated Assets (A.8.1)',
    'Ownership of Assets (A.8.2)',
    'Acceptable Use of Information and Other Associated Assets (A.8.3)',
    'Return of Assets (A.8.4)',
    'Classification of Information (A.8.5)',
    'Labelling of Information (A.8.6)',
    'Handling of Information (A.8.7)',
    'Disposal of Information (A.8.8)',
    'Management of Removable Media (A.8.9)',
    'Logging and Monitoring of Systems (A.8.10)',
    
    // A.9 - Access Control (14 controls)
    'Access Control Policy (A.9.1)',
    'User Registration and De-registration (A.9.2)',
    'User Access Provisioning (A.9.3)',
    'Management of Privileged Access Rights (A.9.4)',
    'Management of Secret Authentication Information (A.9.5)',
    'Review of User Access Rights (A.9.6)',
    'Restriction or Removal of Access Rights (A.9.7)',
    'Information Access Restriction (A.9.8)',
    'Access to Source Code (A.9.9)',
    'Secure Log-On Procedures (A.9.10)',
    'Password Management System (A.9.11)',
    'Use of Privileged Utility Programs (A.9.12)',
    'Access Control to Program Source Code (A.9.13)',
    'Information Security Event Logging (A.9.14)',
    
    // A.10 - Cryptography (2 controls)
    'Cryptographic Controls (A.10.1)',
    'Key Management (A.10.2)',
    
    // A.11 - Physical and Environmental Security (15 controls)
    'Physical Security Perimeters (A.11.1)',
    'Physical Entry Controls (A.11.2)',
    'Securing Offices, Rooms and Facilities (A.11.3)',
    'Physical Security Monitoring (A.11.4)',
    'Protecting Against Physical and Environmental Threats (A.11.5)',
    'Working in Secure Areas (A.11.6)',
    'Clear Desk and Clear Screen (A.11.7)',
    'Equipment Siting and Protection (A.11.8)',
    'Security of Assets Off-Premises (A.11.9)',
    'Storage Media (A.11.10)',
    'Supporting Utilities (A.11.11)',
    'Cabling Security (A.11.12)',
    'Equipment Maintenance (A.11.13)',
    'Secure Disposal or Re-Use of Equipment (A.11.14)',
    'Unattended User Equipment (A.11.15)',
    
    // A.12 - Operations Security (14 controls)
    'Documented Operating Procedures (A.12.1)',
    'Change Management (A.12.2)',
    'Capacity Management (A.12.3)',
    'Separation of Development, Testing and Operational Environments (A.12.4)',
    'Protection from Malware (A.12.5)',
    'Management of Technical Vulnerabilities (A.12.6)',
    'Management of Backups (A.12.7)',
    'Information Security Event Logging (A.12.8)',
    'Installation of Software on Operational Systems (A.12.9)',
    'Network Controls (A.12.10)',
    'Management of Removable Media (A.12.11)',
    'Information Handling Procedures (A.12.12)',
    'Data Leakage Prevention (A.12.13)',
    'Monitoring Activities (A.12.14)',
    
    // A.13 - Communications Security (7 controls)
    'Network Security Management (A.13.1)',
    'Information Transfer Policies and Procedures (A.13.2)',
    'Agreements on Information Transfer (A.13.3)',
    'Electronic Messaging (A.13.4)',
    'Confidentiality or Non-Disclosure Agreements (A.13.5)',
    'Secure Log-On Procedures (A.13.6)',
    'Information Security Event Logging (A.13.7)',
    
    // A.14 - System Acquisition, Development and Maintenance (13 controls)
    'Information Security Requirements Analysis and Specification (A.14.1)',
    'Securing Application Services on Public Networks (A.14.2)',
    'Protecting Application Services Transactions (A.14.3)',
    'Secure Development Policy (A.14.4)',
    'System Development Procedures (A.14.5)',
    'Secure Development Environment (A.14.6)',
    'Outsourced Development (A.14.7)',
    'System Security Testing (A.14.8)',
    'System Acceptance Testing (A.14.9)',
    'Protection of Test Data (A.14.10)',
    'Security Functionality of Information Systems (A.14.11)',
    'Secure Coding (A.14.12)',
    'Development and Support Processes (A.14.13)',
    
    // A.15 - Supplier Relationships (5 controls)
    'Information Security Policy for Supplier Relationships (A.15.1)',
    'Addressing Security Within Supplier Agreements (A.15.2)',
    'Information and Communication Technology Supply Chain (A.15.3)',
    'Monitoring and Review of Supplier Services (A.15.4)',
    'Managing Changes to Supplier Services (A.15.5)',
    
    // A.16 - Information Security Incident Management (7 controls)
    'Responsibilities and Procedures (A.16.1)',
    'Reporting Information Security Events (A.16.2)',
    'Reporting Information Security Weaknesses (A.16.3)',
    'Assessment of and Decision on Information Security Events (A.16.4)',
    'Response to Information Security Incidents (A.16.5)',
    'Learning from Information Security Incidents (A.16.6)',
    'Collection of Evidence (A.16.7)',
    
    // A.17 - Information Security Aspects of Business Continuity Management (4 controls)
    'Planning Information Security Continuity (A.17.1)',
    'Implementing Information Security Continuity (A.17.2)',
    'Verify, Review and Evaluate Information Security Continuity (A.17.3)',
    'Availability of Information Processing Facilities (A.17.4)',
    
    // A.18 - Compliance (8 controls)
    'Identification of Applicable Legislation and Contractual Requirements (A.18.1)',
    'Intellectual Property Rights (A.18.2)',
    'Protection of Records (A.18.3)',
    'Privacy and Protection of Personally Identifiable Information (A.18.4)',
    'Independent Review of Information Security (A.18.5)',
    'Compliance with Security Policies and Standards (A.18.6)',
    'Independent Review of Information Security (A.18.7)',
    'Technical Compliance Review (A.18.8)',
  ] : [
    // CMMC 2.0 Level 2 Controls (110 controls)
    // Access Control (AC) - 22 controls
    'AC.L1-3.1.1 - Limit information system access to authorized users',
    'AC.L1-3.1.2 - Limit information system access to authorized processes',
    'AC.L1-3.1.3 - Control information posted or processed on publicly accessible systems',
    'AC.L2-3.1.4 - Verify and control/limit connections to and use of external systems',
    'AC.L2-3.1.5 - Employ least privilege principle',
    'AC.L2-3.1.6 - Use non-privileged accounts or roles when accessing nonsecurity functions',
    'AC.L2-3.1.7 - Prevent non-privileged users from executing privileged functions',
    'AC.L2-3.1.8 - Limit unsuccessful logon attempts',
    'AC.L2-3.1.9 - Provide privacy and security notices',
    'AC.L2-3.1.10 - Use session locks with pattern-hiding displays',
    'AC.L2-3.1.11 - Terminate user sessions automatically',
    'AC.L2-3.1.12 - Monitor and control remote access sessions',
    'AC.L2-3.1.13 - Employ cryptographic mechanisms to protect CUI',
    'AC.L2-3.1.14 - Control remote access to systems',
    'AC.L2-3.1.15 - Authorize remote execution of privileged commands',
    'AC.L2-3.1.16 - Route remote access via managed access control points',
    'AC.L2-3.1.17 - Control wireless access',
    'AC.L2-3.1.18 - Protect wireless access using authentication and encryption',
    'AC.L2-3.1.19 - Control mobile device access',
    'AC.L2-3.1.20 - Verify and control/limit connections to external systems',
    'AC.L2-3.1.21 - Limit use of portable storage devices',
    'AC.L2-3.1.22 - Control CUI posted or processed on publicly accessible systems',
    
    // Awareness and Training (AT) - 3 controls
    'AT.L1-3.2.1 - Ensure that managers, systems administrators, and users are made aware of security risks',
    'AT.L2-3.2.2 - Ensure that personnel are trained to carry out their assigned duties',
    'AT.L2-3.2.3 - Provide security awareness training on recognizing and reporting potential indicators',
    
    // Audit and Accountability (AU) - 14 controls
    'AU.L1-3.3.1 - Create and retain system audit logs and records',
    'AU.L1-3.3.2 - Ensure that the actions of individual system users can be uniquely traced',
    'AU.L2-3.3.3 - Review and update logged events',
    'AU.L2-3.3.4 - Alert in the event of an audit logging process failure',
    'AU.L2-3.3.5 - Correlate audit record review, analysis, and reporting processes',
    'AU.L2-3.3.6 - Provide audit record reduction and report generation capability',
    'AU.L2-3.3.7 - Provide a system capability that compares and synchronizes internal system clocks',
    'AU.L2-3.3.8 - Protect audit information and audit logging tools from unauthorized access',
    'AU.L2-3.3.9 - Limit management of audit logging functionality to a subset of privileged users',
    'AU.L2-3.3.10 - Generate audit records containing information',
    'AU.L2-3.3.11 - Review audit records',
    'AU.L2-3.3.12 - Alert designated organizational officials in the event of an audit failure',
    'AU.L2-3.3.13 - Provide audit record reduction and report generation capability',
    'AU.L2-3.3.14 - Provide a system capability that compares and synchronizes internal system clocks',
    
    // Configuration Management (CM) - 9 controls
    'CM.L1-3.4.1 - Establish and maintain baseline configurations',
    'CM.L1-3.4.2 - Establish and enforce security configuration settings',
    'CM.L2-3.4.3 - Track, review, approve/disapprove, and log changes',
    'CM.L2-3.4.4 - Analyze the security impact of changes prior to implementation',
    'CM.L2-3.4.5 - Define, document, approve, and enforce physical and logical access restrictions',
    'CM.L2-3.4.6 - Employ the principle of least functionality',
    'CM.L2-3.4.7 - Restrict, disable, or prevent the use of nonessential programs, functions, ports, protocols, and services',
    'CM.L2-3.4.8 - Apply deny-by-exception (blacklisting) policy to prevent the use of unauthorized software',
    'CM.L2-3.4.9 - Control and monitor user-installed software',
    
    // Identification and Authentication (IA) - 11 controls
    'IA.L1-3.5.1 - Identify system users, processes acting on behalf of users, or devices',
    'IA.L1-3.5.2 - Authenticate identities of users, processes, or devices',
    'IA.L2-3.5.3 - Use multifactor authentication for local and network access',
    'IA.L2-3.5.4 - Employ replay-resistant authentication mechanisms',
    'IA.L2-3.5.5 - Prevent reuse of identifiers',
    'IA.L2-3.5.6 - Disable identifiers after a defined period of inactivity',
    'IA.L2-3.5.7 - Enforce a minimum password complexity and change of characters',
    'IA.L2-3.5.8 - Prohibit password reuse for a specified number of generations',
    'IA.L2-3.5.9 - Allow temporary password use for system logons',
    'IA.L2-3.5.10 - Store and transmit only cryptographically protected passwords',
    'IA.L2-3.5.11 - Obscure feedback of authentication information',
    
    // Incident Response (IR) - 6 controls
    'IR.L1-3.6.1 - Establish an operational incident-handling capability',
    'IR.L1-3.6.2 - Track, document, and report incidents to designated officials',
    'IR.L2-3.6.3 - Test the incident response capability',
    'IR.L2-3.6.4 - Incorporate lessons learned from incident handling activities',
    'IR.L2-3.6.5 - Ensure the incident response capability includes preparation, detection, analysis, containment, recovery, and user response activities',
    'IR.L2-3.6.6 - Track, document, and report incidents to designated officials',
    
    // Maintenance (MA) - 6 controls
    'MA.L1-3.7.1 - Perform maintenance on organizational systems',
    'MA.L1-3.7.2 - Provide effective controls on the tools, techniques, mechanisms, and personnel used to conduct system maintenance',
    'MA.L2-3.7.3 - Ensure equipment removed for off-site maintenance is sanitized',
    'MA.L2-3.7.4 - Check media containing diagnostic and test programs for malicious code',
    'MA.L2-3.7.5 - Require multifactor authentication to establish nonlocal maintenance sessions',
    'MA.L2-3.7.6 - Supervise the maintenance activities of maintenance personnel',
    
    // Media Protection (MP) - 8 controls
    'MP.L1-3.8.1 - Protect (i.e., physically control and securely store) system media',
    'MP.L1-3.8.2 - Limit access to CUI on system media',
    'MP.L2-3.8.3 - Sanitize or destroy system media containing CUI before disposal or release for reuse',
    'MP.L2-3.8.4 - Mark media with necessary CUI markings and distribution limitations',
    'MP.L2-3.8.5 - Control access to media containing CUI',
    'MP.L2-3.8.6 - Implement cryptographic mechanisms to protect the confidentiality of CUI',
    'MP.L2-3.8.7 - Control the use of removable media',
    'MP.L2-3.8.8 - Prohibit the use of portable storage devices',
    
    // Personnel Security (PS) - 3 controls
    'PS.L1-3.9.1 - Screen individuals prior to authorizing access',
    'PS.L2-3.9.2 - Ensure that organizational systems containing CUI are protected',
    'PS.L2-3.9.3 - Terminate system access upon termination of employment',
    
    // Physical Protection (PE) - 6 controls
    'PE.L1-3.10.1 - Limit physical access to organizational systems, equipment, and operating environments',
    'PE.L1-3.10.2 - Protect and monitor the physical facility and support infrastructure',
    'PE.L2-3.10.3 - Escort visitors and monitor visitor activity',
    'PE.L2-3.10.4 - Maintain audit logs of physical access',
    'PE.L2-3.10.5 - Control and manage physical access devices',
    'PE.L2-3.10.6 - Enforce safeguarding measures for CUI at alternate work sites',
    
    // Recovery (RE) - 4 controls
    'RE.L1-3.11.1 - Manage backups',
    'RE.L2-3.11.2 - Test backup information',
    'RE.L2-3.11.3 - Ensure alternate processing sites are available',
    'RE.L2-3.11.4 - Protect backup and restoration information',
    
    // Risk Management (RM) - 3 controls
    'RM.L1-3.12.1 - Periodically assess the risk to organizational operations',
    'RM.L2-3.12.2 - Develop and implement a risk management strategy',
    'RM.L2-3.12.3 - Manage the supply chain risk',
    
    // Security Assessment (CA) - 4 controls
    'CA.L1-3.13.1 - Periodically assess the security controls in organizational systems',
    'CA.L2-3.13.2 - Develop a plan of action and milestones for the assessment program',
    'CA.L2-3.13.3 - Monitor security control assessment activities',
    'CA.L2-3.13.4 - Accept the results of the assessment of security controls',
    
    // System and Communications Protection (SC) - 12 controls
    'SC.L1-3.14.1 - Monitor, control, and protect communications',
    'SC.L1-3.14.2 - Employ architectural designs, software development techniques, and systems engineering principles',
    'SC.L2-3.14.3 - Separate user functionality from system management functionality',
    'SC.L2-3.14.4 - Prevent unauthorized and unintended information transfer via shared system resources',
    'SC.L2-3.14.5 - Implement subnetworks for publicly accessible system components',
    'SC.L2-3.14.6 - Deny network communications traffic by default',
    'SC.L2-3.14.7 - Prevent remote devices from simultaneously establishing non-remote connections',
    'SC.L2-3.14.8 - Implement cryptographic mechanisms to prevent unauthorized disclosure of CUI',
    'SC.L2-3.14.9 - Terminate network connections associated with communications sessions',
    'SC.L2-3.14.10 - Establish and manage cryptographic keys',
    'SC.L2-3.14.11 - Employ FIPS-validated cryptography',
    'SC.L2-3.14.12 - Use organizationally approved cryptographic algorithms',
    
    // System and Information Integrity (SI) - 7 controls
    'SI.L1-3.15.1 - Identify, report, and correct information and information system flaws',
    'SI.L1-3.15.2 - Provide protection from malicious code at appropriate locations',
    'SI.L2-3.15.3 - Identify unauthorized use of organizational systems',
    'SI.L2-3.15.4 - Update malicious code protection mechanisms',
    'SI.L2-3.15.5 - Perform periodic scans of the information system',
    'SI.L2-3.15.6 - Monitor system security alerts and advisories',
    'SI.L2-3.15.7 - Monitor system security alerts and advisories',
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
    // Organize controls by domain for ISO 27001
    const organizeByDomain = (items: string[]) => {
      const domains: { [key: string]: string[] } = {};
      
      items.forEach(item => {
        // Extract domain from control code (e.g., A.5.1 -> A.5)
        const match = item.match(/([A-Z]\.[0-9]+)/);
        if (match) {
          const domainCode = match[1];
          const domainName = getDomainName(domainCode);
          if (!domains[domainName]) {
            domains[domainName] = [];
          }
          domains[domainName].push(item);
        } else {
          // For CMMC or items without domain codes
          if (!domains['General']) {
            domains['General'] = [];
          }
          domains['General'].push(item);
        }
      });
      
      return domains;
    };
    
    const getDomainName = (code: string) => {
      const domainMap: { [key: string]: string } = {
        'A.5': 'Information Security Policies',
        'A.6': 'Organization of Information Security',
        'A.7': 'Human Resource Security',
        'A.8': 'Asset Management',
        'A.9': 'Access Control',
        'A.10': 'Cryptography',
        'A.11': 'Physical and Environmental Security',
        'A.12': 'Operations Security',
        'A.13': 'Communications Security',
        'A.14': 'System Acquisition, Development and Maintenance',
        'A.15': 'Supplier Relationships',
        'A.16': 'Information Security Incident Management',
        'A.17': 'Information Security Aspects of Business Continuity Management',
        'A.18': 'Compliance',
      };
      return domainMap[code] || code;
    };
    
    const organizedControls = organizeByDomain(todoItems);
    const totalControls = todoItems.length;
    
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
      max-width: 1000px;
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
    
    .logo img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 0 15px rgba(59, 130, 246, 0.8));
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
    
    .stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    
    .stat-card {
      flex: 1;
      min-width: 200px;
      background: rgba(34, 197, 94, 0.1);
      border: 2px solid rgba(34, 197, 94, 0.3);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
    }
    
    .stat-value {
      font-size: 2.5rem;
      font-weight: 900;
      color: #22c55e;
      margin-bottom: 0.5rem;
    }
    
    .stat-label {
      font-size: 0.95rem;
      color: #94a3b8;
    }
    
    .domain-section {
      margin-bottom: 3rem;
      page-break-inside: avoid;
    }
    
    .domain-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #3b82f6;
      margin-bottom: 1rem;
      padding: 1rem;
      background: rgba(59, 130, 246, 0.1);
      border-left: 4px solid #3b82f6;
      border-radius: 8px;
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
      
      .domain-title {
        background: #f1f5f9;
        color: #1e293b;
        border-left-color: #3b82f6;
      }
      
      .todo-item {
        background: #f8fafc;
        border-color: #cbd5e1;
        color: #1e293b;
      }
      
      .todo-text {
        color: #1e293b;
      }
      
      .stat-card {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }
      
      .stat-value {
        color: #22c55e;
      }
      
      .stat-label {
        color: #64748b;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMzgiIGZpbGw9IiMwZjE3MmEiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSI0MCIgZmlsbD0iIzNiODJmNiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCfjL08L3RleHQ+PC9zdmc+" alt="Cyber Owl" />
      </div>
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
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-value">${totalControls}</div>
        <div class="stat-label">Total Controls</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${Object.keys(organizedControls).length}</div>
        <div class="stat-label">Security Domains</div>
      </div>
    </div>
    
    ${Object.entries(organizedControls).map(([domain, items]) => `
      <div class="domain-section">
        <h2 class="domain-title">${domain} (${items.length} controls)</h2>
      <ol class="todo-list">
          ${items.map(item => `
          <li class="todo-item">
            <span class="todo-text">${item}</span>
          </li>
        `).join('')}
      </ol>
    </div>
    `).join('')}
    
    <div class="footer">
      <p><strong>AliceSolutionsGroup</strong> - ISO 27001 Readiness Studio</p>
      <p>Generated for ${userName} • ${new Date().getFullYear()}</p>
      <p style="margin-top: 1rem; font-size: 0.85rem;">This checklist is based on ${framework === 'iso27001' ? 'ISO 27001:2022' : 'CMMC 2.0 Level 2'} standards and best practices.</p>
    </div>
  </div>
</body>
</html>
    `;
  };

  return (
    <div className="simple-todo-list">
      <div className="todo-content">
        <div className="todo-header-super">
          <button className="back-btn-super" onClick={onBack}>
          <ArrowLeft size={20} />
          Back
        </button>
          <div className="todo-logo-super">
            <Sparkles size={40} />
          </div>
          <h1 className="todo-title-super">
            {framework.toUpperCase()} TODO List
          </h1>
          <p className="todo-subtitle-super">
            Your Complete Compliance Checklist
          </p>
        </div>

        <div className="todo-form-super">
          <div className="form-group-super">
            <label htmlFor="email" className="form-label-super">
              <Mail size={20} />
              Enter your email to download
            </label>
            <input
              type="email"
              id="email"
              className="form-input-super"
              placeholder="your.email@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
            />
            {emailError && <p className="error-message-super">{emailError}</p>}
          </div>

          <button 
            className="btn-download-super" 
            onClick={handleDownloadPDF}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Sparkles size={20} className="spinning" />
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

        <div className="todo-preview-super">
          <h3>What's Included ({todoItems.length} Total Controls):</h3>
          <ul className="preview-list-super">
            {todoItems.slice(0, 5).map((item, index) => (
              <li key={index}>
                <Circle size={16} />
                <span>{item}</span>
              </li>
            ))}
            <li className="more-items-super">
              <span>... and {todoItems.length - 5} more controls in the PDF</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

