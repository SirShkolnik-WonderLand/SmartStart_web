import React from 'react';
import { motion } from 'framer-motion';
import * as styles from './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export function Card({ children, className = '', onClick, disabled = false }: CardProps) {
  return (
    <motion.div
      className={`${styles.card} ${className}`}
      onClick={disabled ? undefined : onClick}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}