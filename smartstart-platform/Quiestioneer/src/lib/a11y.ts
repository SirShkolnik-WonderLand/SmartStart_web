export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function getMotionConfig() {
  const reduced = prefersReducedMotion();
  return {
    transition: {
      duration: reduced ? 0.01 : 0.3,
      ease: 'easeInOut',
    },
  };
}

