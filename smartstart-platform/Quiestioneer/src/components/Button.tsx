import { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import * as styles from './Button.css';
import { getMotionConfig } from '../lib/a11y';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'choice' | 'choiceSelected';
  as?: 'button' | 'a';
  href?: string;
}

export function Button({ 
  children, 
  variant = 'primary', 
  as = 'button',
  href,
  ...props 
}: ButtonProps) {
  const Component = as === 'a' ? motion.a : motion.button;
  const motionConfig = getMotionConfig();
  
  return (
    <Component
      className={styles.button[variant]}
      whileTap={{ scale: 0.97 }}
      transition={motionConfig.transition}
      {...(as === 'a' ? { href } : {})}
      {...props}
    >
      {children}
    </Component>
  );
}

