import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, Calendar, ArrowLeft } from 'lucide-react';
import { useAssessmentStore } from './useAssessmentStore';
import { AliceSolutionGroup } from '../../components/AliceSolutionGroup';
import * as styles from './ThankYouView.css';

const motionConfig = {
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function ThankYouView() {
  const { reset } = useAssessmentStore();

  const handleDownloadPDF = () => {
    // In a real app, this would download the PDF
    // For now, we'll just show a message
    alert('PDF download would start here. In production, this would trigger the actual download.');
  };

  const handleBookConsult = () => {
    window.open('https://calendly.com/alicesolutiongroup', '_blank');
  };

  const handleStartOver = () => {
    reset();
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
          className={styles.icon}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.1 }}
        >
          <CheckCircle size={64} />
        </motion.div>

        <motion.h1
          className={styles.title}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.2 }}
        >
          Thank You!
        </motion.h1>

        <motion.p
          className={styles.description}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.3 }}
        >
          Your cyber health assessment is complete. Check your email for your 
          comprehensive PDF report with detailed implementation guidance for your 
          top security fixes.
        </motion.p>

        <motion.div 
          className={`${styles.actions} ${styles.mobileActions}`}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.4 }}
        >
          <button 
            className={`${styles.button} ${styles.mobileButton}`}
            onClick={handleDownloadPDF}
          >
            <Download size={18} />
            Download PDF Again
          </button>
          
          <a 
            href="https://calendly.com/alicesolutiongroup"
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.button} ${styles.buttonSecondary} ${styles.mobileButton}`}
            onClick={handleBookConsult}
          >
            <Calendar size={18} />
            Book Free Consult
          </a>
          
          <button 
            className={`${styles.button} ${styles.buttonSecondary} ${styles.mobileButton}`}
            onClick={handleStartOver}
          >
            <ArrowLeft size={18} />
            Start New Assessment
          </button>
        </motion.div>

        <motion.div 
          className={styles.footer}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.5 }}
        >
          <div style={{ marginBottom: '16px' }}>
            <AliceSolutionGroup variant="full" size="md" />
          </div>
          <p>
            Questions? Email us at{' '}
            <a 
              href="mailto:hello@alicesolutiongroup.com"
              className={styles.footerLink}
            >
              hello@alicesolutiongroup.com
            </a>
          </p>
          <p style={{ fontSize: '14px', color: '#8b95a6', marginTop: '8px' }}>
            Toronto, Canada
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}