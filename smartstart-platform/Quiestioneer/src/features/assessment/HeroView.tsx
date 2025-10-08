import React from 'react';
import { motion } from 'framer-motion';
import { useAssessmentStore } from './useAssessmentStore';
import { type AssessmentMode, modeConfig } from './content';
import { AliceSolutionGroup } from '../../components/AliceSolutionGroup';
import * as styles from './HeroView.css';

const motionConfig = {
  transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export function HeroView() {
  const { mode, setMode, setView } = useAssessmentStore();

  const handleModeSelect = (selectedMode: AssessmentMode) => {
    setMode(selectedMode);
  };

  const handleStart = () => {
    setView('assessment');
  };

  const modes: Array<{
    key: AssessmentMode;
    name: string;
    description: string;
  }> = [
    {
      key: 'lite',
      name: 'Lite',
      description: 'Core security essentials for small teams',
    },
    {
      key: 'standard',
      name: 'Standard',
      description: 'Comprehensive assessment with email security & backups',
    },
    {
      key: 'pro',
      name: 'Pro',
      description: 'Complete security posture evaluation',
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.backgroundPattern} />
      
      <motion.div 
        className={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className={styles.logo}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.1 }}
        >
          <AliceSolutionGroup variant="full" size="lg" />
        </motion.div>

        <motion.h1
          className={`${styles.title} ${styles.mobileTitle}`}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.2 }}
        >
          SMB Cyber Health Check
        </motion.h1>

        <motion.p
          className={styles.subtitle}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.3 }}
        >
          Free cyber security assessment for Ontario & GTA small businesses. 
          Get your instant score, top 3 priority fixes, and compliance guidance 
          for PIPEDA, PHIPA, ISO 27001, and SOC 2.
        </motion.p>

        <motion.div
          className={`${styles.modeSelector} ${styles.mobileModeSelector}`}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.4 }}
        >
          {modes.map((modeOption) => (
            <motion.div
              key={modeOption.key}
              className={`
                ${styles.modeCard} 
                ${styles.mobileModeCard}
                ${mode === modeOption.key ? styles.modeCardSelected : ''}
              `}
              onClick={() => handleModeSelect(modeOption.key)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {modeOption.key === 'standard' && (
                <div className={styles.defaultBadge}>Default</div>
              )}
              
              <div className={styles.modeName}>{modeOption.name}</div>
              <div className={styles.modeQuestions}>
                {modeConfig[modeOption.key].questions} Questions
              </div>
              <div className={styles.modeTime}>
                {modeConfig[modeOption.key].time}
              </div>
              <div className={styles.modeDescription}>
                {modeOption.description}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          className={`${styles.startButton}`}
          onClick={handleStart}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.5 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Assessment
        </motion.button>

        <motion.div
          className={styles.badge}
          {...motionConfig}
          transition={{ ...motionConfig.transition, delay: 0.6 }}
        >
          <strong>Privacy First:</strong> We store your email and answers for 90 days to generate your PDF and follow up once. We do not sell data. Unsubscribe anytime.
        </motion.div>
      </motion.div>

      <motion.div
        className={styles.footer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        AliceSolutionGroup • Toronto, Canada
      </motion.div>
    </div>
  );
}