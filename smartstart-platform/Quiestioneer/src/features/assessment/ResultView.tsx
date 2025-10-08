import React from 'react';
import { motion } from 'framer-motion';
import { Download, Calendar, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAssessmentStore } from './useAssessmentStore';
import { calculateScore } from './ScoreEngine';
import { fixDescriptions, canadaBaseline } from './content';
import { ResultGauge3D } from '../../components/ResultGauge3D';
import { AliceSolutionGroup } from '../../components/AliceSolutionGroup';
import * as styles from './ResultView.css';

const motionConfig = {
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function ResultView() {
  const { mode, answers, email, company, setView } = useAssessmentStore();

  // Calculate results
  const result = calculateScore(mode, answers);
  const { score, max, percent, tier, top_fixes, compliance_hint } = result;

  const handleDownloadPDF = () => {
    // This will trigger the email modal
    setView('email-modal');
  };

  const handleBookConsult = () => {
    // Open Calendly in new tab
    window.open('https://calendly.com/alicesolutiongroup', '_blank');
  };

  const getTierIcon = () => {
    switch (tier) {
      case 'red':
        return <AlertTriangle size={20} />;
      case 'amber':
        return <Shield size={20} />;
      case 'green':
        return <CheckCircle size={20} />;
    }
  };

  const getTierBadgeClass = () => {
    switch (tier) {
      case 'red':
        return `${styles.tierBadge} ${styles.tierBadgeRed}`;
      case 'amber':
        return `${styles.tierBadge} ${styles.tierBadgeAmber}`;
      case 'green':
        return `${styles.tierBadge} ${styles.tierBadgeGreen}`;
    }
  };

  const getTierCopy = () => {
    switch (tier) {
      case 'red':
        return "You're exposed. Fix the basics below first.";
      case 'amber':
        return 'Getting there. Close your top gaps next.';
      case 'green':
        return 'Solid baseline. Formalize and monitor.';
    }
  };

  return (
    <div className={`${styles.container} ${styles.mobileContainer}`}>
      <motion.div 
        className={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div 
          className={styles.header}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.1 }}
        >
          <h1 className={styles.title}>Your Cyber Health Score</h1>
        </motion.div>

        <motion.div 
          className={styles.gaugeContainer}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.2 }}
        >
          <ResultGauge3D 
            percent={percent} 
            tier={tier} 
            score={score} 
            max={max} 
          />
          
          <div className={getTierBadgeClass()}>
            {getTierIcon()}
            {tier.toUpperCase()}
          </div>
        </motion.div>

        <motion.p 
          className={styles.tierCopy}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.3 }}
        >
          {getTierCopy()}
        </motion.p>

        <motion.div 
          className={`${styles.sections} ${styles.mobileSections}`}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.4 }}
        >
          <div className={`${styles.section} ${styles.mobileSection}`}>
            <h2 className={styles.sectionTitle}>
              <AlertTriangle size={20} />
              Top 3 Priority Fixes
            </h2>
            <ul className={styles.fixList}>
              {top_fixes.map((fix, index) => (
                <li 
                  key={index} 
                  className={`${styles.fixItem} ${index === top_fixes.length - 1 ? styles.fixItemLast : ''}`}
                >
                  <div className={styles.fixTitle}>{fix}</div>
                  <div className={styles.fixDescription}>
                    {fixDescriptions[fix] || 'Detailed implementation guidance available in your PDF report.'}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${styles.section} ${styles.mobileSection}`}>
            <h2 className={styles.sectionTitle}>
              <CheckCircle size={20} />
              Canada Baseline Checklist
            </h2>
            <ul className={styles.fixList}>
              {canadaBaseline.slice(0, 8).map((item, index) => (
                <li 
                  key={index} 
                  className={`${styles.fixItem} ${index === 7 ? styles.fixItemLast : ''}`}
                >
                  <div className={styles.fixDescription}>{item}</div>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        <motion.div 
          className={styles.complianceSection}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.5 }}
        >
          <h3 className={styles.complianceTitle}>Compliance Guidance</h3>
          <p className={styles.complianceText}>{compliance_hint}</p>
        </motion.div>

        <motion.div 
          className={`${styles.ctaSection} ${styles.mobileCtaSection}`}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.6 }}
        >
          <button 
            className={`${styles.ctaButton} ${styles.mobileCtaButton}`}
            onClick={handleDownloadPDF}
          >
            <Download size={18} />
            Download Full Report
          </button>
          
          <a 
            href="https://calendly.com/alicesolutiongroup"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.ctaButton} ${styles.ctaButtonSecondary} ${styles.mobileCtaButton}`}
            onClick={handleBookConsult}
          >
            <Calendar size={18} />
            Book 20-min Consult
          </a>
        </motion.div>

        <motion.div 
          className={styles.footer}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.7 }}
        >
          <div style={{ marginBottom: '16px' }}>
            <AliceSolutionGroup variant="full" size="md" />
          </div>
          <p>
            Questions? Email us at{' '}
            <a 
              href="mailto:hello@alicesolutiongroup.com"
              className={`${styles.footerLink}`}
            >
              hello@alicesolutiongroup.com
            </a>
          </p>
          <p style={{ marginTop: '8px', fontSize: '12px' }}>
            Toronto, Canada
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}