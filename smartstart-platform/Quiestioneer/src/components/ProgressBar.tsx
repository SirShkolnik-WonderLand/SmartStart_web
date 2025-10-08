import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import * as styles from './ProgressBar.css';
import { prefersReducedMotion } from '../lib/a11y';

interface ProgressBarProps {
  current: number;
  total: number;
  showLabel?: boolean;
}

export function ProgressBar({ current, total, showLabel = true }: ProgressBarProps) {
  const fillRef = useRef<HTMLDivElement>(null);
  const percentage = Math.round((current / total) * 100);

  useEffect(() => {
    if (!fillRef.current) return;
    
    const reduced = prefersReducedMotion();
    gsap.to(fillRef.current, {
      width: `${percentage}%`,
      duration: reduced ? 0.01 : 0.6,
      ease: 'power2.out',
    });
  }, [percentage]);

  return (
    <div>
      {showLabel && (
        <div className={styles.label}>
          <span>Progress</span>
          <span>{current} of {total}</span>
        </div>
      )}
      <div className={styles.container} role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
        <div ref={fillRef} className={styles.fill} style={{ width: '0%' }} />
      </div>
    </div>
  );
}

