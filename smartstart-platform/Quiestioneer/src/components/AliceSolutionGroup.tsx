import React from 'react';
import { motion } from 'framer-motion';
import * as styles from './AliceSolutionGroup.css';

interface AliceSolutionGroupProps {
  variant?: 'logo' | 'text' | 'full';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function AliceSolutionGroup({ 
  variant = 'full', 
  size = 'md', 
  animated = true,
  className = ''
}: AliceSolutionGroupProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
        staggerChildren: 0.1
      }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    }
  };

  const glowVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 1.2, 
        ease: 'easeOut',
        repeat: Infinity,
        repeatType: 'reverse' as const,
        repeatDelay: 2
      }
    }
  };

  if (variant === 'logo') {
    return (
      <motion.div
        className={`${styles.logo} ${styles[size]} ${className}`}
        variants={animated ? containerVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
      >
        <motion.div
          className={styles.logoIcon}
          variants={animated ? glowVariants : undefined}
        >
          <img 
            src="/Quiestioneer/assets/alice-solution-logo.png?v=2025-10-09" 
            alt="AliceSolutionsGroup" 
            className={styles.logoImage}
          />
        </motion.div>
      </motion.div>
    );
  }

  if (variant === 'text') {
    return (
      <motion.div
        className={`${styles.textOnly} ${styles[size]} ${className}`}
        variants={animated ? containerVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated ? 'visible' : undefined}
      >
        <motion.span variants={animated ? textVariants : undefined}>
          AliceSolutionGroup
        </motion.span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`${styles.fullBrand} ${styles[size]} ${className}`}
      variants={animated ? containerVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated ? 'visible' : undefined}
    >
      <motion.div
        className={styles.logoIcon}
        variants={animated ? glowVariants : undefined}
      >
        <img 
          src="/Quiestioneer/assets/alice-solution-logo.png?v=2025-10-09" 
          alt="AliceSolutionsGroup" 
          className={styles.logoImage}
        />
      </motion.div>
      
      <motion.div 
        className={styles.brandText}
        variants={animated ? textVariants : undefined}
      >
        <motion.span 
          className={styles.alice}
          variants={animated ? textVariants : undefined}
        >
          Alice
        </motion.span>
        <motion.span 
          className={styles.solution}
          variants={animated ? textVariants : undefined}
        >
          Solution
        </motion.span>
        <motion.span 
          className={styles.group}
          variants={animated ? textVariants : undefined}
        >
          Group
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
