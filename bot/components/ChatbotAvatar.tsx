import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

type AvatarState = 'idle' | 'listening' | 'talking';
type EmotionState = 'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited' | 'sleepy';
type SpecialAnimation = 'none' | 'wave' | 'dance' | 'spin' | 'rainbow';
type ColorTheme = 'teal' | 'purple' | 'blue' | 'pink';

interface ChatbotAvatarProps {
  state: AvatarState;
  emotion?: EmotionState;
  specialAnimation?: SpecialAnimation;
  theme?: ColorTheme;
  size?: 'medium' | 'large';
  isClickable?: boolean;
  showAttentionSeeker?: boolean;
  onAnimationComplete?: () => void;
}

const THEME_COLORS = {
  teal: {
    primary: '#00C5D6',
    secondary: '#00E5FF',
    glow: 'rgba(0, 197, 214, 0.6)',
    glowRGB: '0, 197, 214',
  },
  purple: {
    primary: '#A855F7',
    secondary: '#C084FC',
    glow: 'rgba(168, 85, 247, 0.6)',
    glowRGB: '168, 85, 247',
  },
  blue: {
    primary: '#3B82F6',
    secondary: '#60A5FA',
    glow: 'rgba(59, 130, 246, 0.6)',
    glowRGB: '59, 130, 246',
  },
  pink: {
    primary: '#EC4899',
    secondary: '#F472B6',
    glow: 'rgba(236, 72, 153, 0.6)',
    glowRGB: '236, 72, 153',
  },
};

export function ChatbotAvatar({ 
  state, 
  emotion = 'neutral',
  specialAnimation = 'none',
  theme = 'teal',
  size = 'medium', 
  isClickable = false,
  showAttentionSeeker = false,
  onAnimationComplete
}: ChatbotAvatarProps) {
  const [eyeBlink, setEyeBlink] = useState(false);
  const [pupilPosition, setPupilPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [headRotation, setHeadRotation] = useState({ rotateY: 0, rotateX: 0 });
  const [isExcited, setIsExcited] = useState(false);
  const [idleDrift, setIdleDrift] = useState({ x: 0, y: 0 });
  const avatarRef = useRef<HTMLDivElement>(null);
  
  const dimensions = size === 'large' ? 'w-40 h-40' : 'w-32 h-32';
  const colors = THEME_COLORS[theme];

  // Get eye shape based on emotion
  const getEyeShape = () => {
    switch (emotion) {
      case 'happy':
        return 'scale-y-75'; // Squinty happy eyes
      case 'sleepy':
        return 'scale-y-50'; // Half-closed eyes
      case 'concerned':
        return 'scale-y-110'; // Wide eyes
      default:
        return 'scale-y-100';
    }
  };

  // Get mouth shape based on emotion
  const getMouthStyle = () => {
    switch (emotion) {
      case 'happy':
        return {
          transform: 'rotate(-15deg) scaleX(1.5)',
          borderRadius: '50%',
          height: '8px',
        };
      case 'thinking':
        return {
          transform: 'translateX(-3px)',
          width: '16px',
        };
      case 'concerned':
        return {
          transform: 'rotate(15deg)',
          opacity: 0.7,
        };
      case 'sleepy':
        return {
          opacity: 0.4,
          width: '16px',
        };
      default:
        return {};
    }
  };

  // Special animation configs
  const getSpecialAnimationProps = () => {
    switch (specialAnimation) {
      case 'wave':
        return {
          rotate: [0, -15, 15, -15, 0],
          transition: { duration: 1.2, ease: "easeInOut" }
        };
      case 'dance':
        return {
          rotate: [0, -10, 10, -10, 10, 0],
          y: [0, -10, 0, -10, 0],
          transition: { duration: 1.5, ease: "easeInOut" }
        };
      case 'spin':
        return {
          rotate: 360,
          transition: { duration: 1, ease: "easeInOut" }
        };
      default:
        return {};
    }
  };

  // Trigger animation complete callback
  useEffect(() => {
    if (specialAnimation !== 'none' && onAnimationComplete) {
      const timeout = setTimeout(() => {
        onAnimationComplete();
      }, specialAnimation === 'spin' ? 1000 : specialAnimation === 'wave' ? 1200 : 1500);
      return () => clearTimeout(timeout);
    }
  }, [specialAnimation, onAnimationComplete]);
  
  // Track mouse position and make head + pupils follow cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!avatarRef.current) return;
      
      const rect = avatarRef.current.getBoundingClientRect();
      const avatarCenterX = rect.left + rect.width / 2;
      const avatarCenterY = rect.top + rect.height / 2;
      
      const deltaX = (e.clientX - avatarCenterX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - avatarCenterY) / (window.innerHeight / 2);
      
      const maxHeadRotation = 12;
      const rotateY = deltaX * maxHeadRotation;
      const rotateX = -deltaY * (maxHeadRotation * 0.6);
      
      setHeadRotation({ rotateY, rotateX });
      
      const maxPupilMove = 3;
      const pupilX = Math.max(-maxPupilMove, Math.min(maxPupilMove, deltaX * maxPupilMove));
      const pupilY = Math.max(-maxPupilMove, Math.min(maxPupilMove, deltaY * maxPupilMove));
      
      setPupilPosition({ x: pupilX, y: pupilY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // React to mouse clicks with excitement
  useEffect(() => {
    const handleClick = () => {
      setIsExcited(true);
      setTimeout(() => setIsExcited(false), 600);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Random idle drift/look around behavior
  useEffect(() => {
    if (state !== 'idle') return;

    const driftAround = () => {
      const randomX = (Math.random() - 0.5) * 20;
      const randomY = (Math.random() - 0.5) * 10;
      setIdleDrift({ x: randomX, y: randomY });
      
      setTimeout(() => {
        setIdleDrift({ x: 0, y: 0 });
      }, 2000);
    };

    const interval = setInterval(driftAround, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, [state]);
  
  // Random eye blink effect
  useEffect(() => {
    if (emotion === 'sleepy') {
      // Blink more when sleepy
      const sleepyBlink = setInterval(() => {
        setEyeBlink(true);
        setTimeout(() => setEyeBlink(false), 300);
      }, 1500);
      return () => clearInterval(sleepyBlink);
    }

    const blinkInterval = setInterval(() => {
      setEyeBlink(true);
      setTimeout(() => setEyeBlink(false), 150);
      
      if (Math.random() > 0.7) {
        setTimeout(() => {
          setEyeBlink(true);
          setTimeout(() => setEyeBlink(false), 150);
        }, 300);
      }
    }, 2500 + Math.random() * 2500);
    
    return () => clearInterval(blinkInterval);
  }, [emotion]);

  // Glow animation variants
  const glowVariants = {
    idle: {
      scale: [1, 1.08, 1],
      opacity: [0.5, 0.7, 0.5],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    },
    listening: {
      scale: [1, 1.15, 1],
      opacity: [0.7, 1, 0.7],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
    talking: {
      scale: [1, 1.2, 1],
      opacity: [0.8, 1, 0.8],
      transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
    }
  };

  // Halo rotation
  const haloRotation = {
    idle: { rotate: 360, transition: { duration: 20, repeat: Infinity, ease: "linear" } },
    listening: { rotate: 360, transition: { duration: 8, repeat: Infinity, ease: "linear" } },
    talking: { rotate: 360, transition: { duration: 12, repeat: Infinity, ease: "linear" } }
  };

  return (
    <motion.div 
      ref={avatarRef}
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      animate={{
        y: [0, -4, 0],
        x: idleDrift.x,
        ...getSpecialAnimationProps()
      }}
      transition={{
        y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
        x: { duration: 2, ease: "easeInOut" }
      }}
    >
      {/* Attention seeker animation */}
      <AnimatePresence>
        {showAttentionSeeker && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [1, 0.6, 1],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute -inset-4 rounded-full border-2 pointer-events-none"
            style={{
              borderColor: colors.primary,
              filter: 'blur(2px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Clickable hint */}
      {isClickable && isHovered && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: -50 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 text-xs px-3 py-1.5 rounded-full whitespace-nowrap pointer-events-none z-10"
          style={{
            background: `rgba(${colors.glowRGB}, 0.2)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid rgba(${colors.glowRGB}, 0.4)`,
            color: colors.secondary,
            boxShadow: `0 4px 12px rgba(${colors.glowRGB}, 0.3)`
          }}
        >
          {specialAnimation === 'wave' ? '👋' : 'Click to chat'}
        </motion.div>
      )}

      {/* Rainbow mode special effect */}
      {specialAnimation === 'rainbow' && (
        <motion.div
          className="absolute inset-0 rounded-full scale-150"
          style={{
            background: 'conic-gradient(from 0deg, #ff0080, #ff8c00, #40e0d0, #9370db, #ff0080)',
            filter: 'blur(40px)',
          }}
          animate={{
            rotate: 360,
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
            opacity: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      )}

      {/* Multi-layer glow */}
      <motion.div
        className="absolute inset-0 rounded-full scale-150"
        style={{
          background: `radial-gradient(circle, rgba(${colors.glowRGB}, 0.4) 0%, rgba(${colors.glowRGB}, 0.2) 30%, transparent 60%)`,
          filter: 'blur(40px)'
        }}
        variants={glowVariants}
        animate={state}
      />
      <motion.div
        className="absolute inset-0 rounded-full scale-125"
        style={{
          background: `radial-gradient(circle, rgba(${colors.glowRGB}, 0.3) 0%, rgba(${colors.glowRGB}, 0.15) 40%, transparent 70%)`,
          filter: 'blur(30px)'
        }}
        animate={{
          scale: [1.2, 1.35, 1.2],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating particles */}
      {(state === 'listening' || state === 'talking' || isHovered || emotion === 'excited') && (
        <>
          {[...Array(emotion === 'excited' ? 12 : 8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                background: specialAnimation === 'rainbow' 
                  ? ['#ff0080', '#ff8c00', '#40e0d0', '#9370db'][i % 4]
                  : colors.glow,
                boxShadow: `0 0 8px ${colors.glow}`,
                filter: 'blur(1px)'
              }}
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{
                x: [0, Math.cos(i * 45 * Math.PI / 180) * 70],
                y: [0, Math.sin(i * 45 * Math.PI / 180) * 70],
                opacity: [0, 0.8, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeOut"
              }}
            />
          ))}
        </>
      )}

      {/* Rotating halo ring */}
      {(state === 'listening' || state === 'talking') && (
        <motion.div
          className={`absolute ${size === 'large' ? 'w-48 h-48' : 'w-40 h-40'}`}
          variants={haloRotation}
          animate={state}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <defs>
              <linearGradient id={`haloGradient-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={colors.primary} stopOpacity="0.8" />
                <stop offset="50%" stopColor={colors.secondary} stopOpacity="0.4" />
                <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={`url(#haloGradient-${theme})`}
              strokeWidth="2"
              strokeDasharray="10 5"
            />
          </svg>
        </motion.div>
      )}

      {/* Avatar container */}
      <motion.div
        className={`relative ${dimensions} rounded-full overflow-visible`}
        style={{
          background: 'transparent',
          border: `2px solid ${colors.glow}`,
          boxShadow: `0 0 50px ${colors.glow}, inset 0 0 30px rgba(${colors.glowRGB}, 0.1)`,
          backdropFilter: 'blur(10px)',
        }}
        animate={{
          scale: state === 'talking' ? [1, 1.03, 1] : isHovered ? 1.08 : isExcited ? 1.12 : 1,
        }}
        transition={{
          duration: 0.6,
          repeat: state === 'talking' ? Infinity : 0,
          ease: "easeInOut"
        }}
      >
        {/* Circuit pattern */}
        <motion.div 
          className="absolute inset-0 opacity-20 rounded-full overflow-hidden"
          animate={{ opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <pattern id={`circuit-${theme}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M10 0 L10 10 L0 10" stroke={colors.primary} strokeWidth="0.5" fill="none" />
              <circle cx="10" cy="10" r="1" fill={colors.primary} />
            </pattern>
            <rect width="100" height="100" fill={`url(#circuit-${theme})`} />
          </svg>
        </motion.div>

        {/* Scan line */}
        <motion.div
          className="absolute inset-x-0 h-0.5 opacity-30 rounded-full"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
            boxShadow: `0 0 8px ${colors.glow}`,
            filter: 'blur(0.5px)'
          }}
          animate={{ top: ['0%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />

        {/* Face */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full"
          animate={{
            rotateY: emotion === 'thinking' ? [-5, 5, -5] : headRotation.rotateY,
            rotateX: headRotation.rotateX,
            scale: isExcited ? [1, 1.05, 1] : 1,
          }}
          transition={{
            rotateY: emotion === 'thinking' 
              ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.4, ease: "easeOut" },
            rotateX: { duration: 0.4, ease: "easeOut" },
            scale: { duration: 0.3 }
          }}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div className="relative w-20 h-24">
            {/* Face outline */}
            <motion.div 
              className="absolute inset-x-2 top-0 bottom-4 rounded-full"
              style={{
                background: `linear-gradient(180deg, rgba(${colors.glowRGB}, 0.15) 0%, rgba(${colors.glowRGB}, 0.05) 100%)`,
                border: `1px solid rgba(${colors.glowRGB}, 0.4)`
              }}
              animate={{
                boxShadow: [
                  `0 0 10px rgba(${colors.glowRGB}, 0.3)`,
                  `0 0 20px rgba(${colors.glowRGB}, 0.5)`,
                  `0 0 10px rgba(${colors.glowRGB}, 0.3)`,
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            
            {/* Eyes */}
            <motion.div 
              className={`absolute top-8 left-1/2 -translate-x-1/2 flex gap-3 ${getEyeShape()}`}
              animate={{
                scaleY: eyeBlink ? 0.1 : emotion === 'happy' ? 0.75 : emotion === 'sleepy' ? 0.5 : 1,
                y: emotion === 'thinking' ? [-1, 1, -1] : 0,
              }}
              transition={{ 
                scaleY: { duration: eyeBlink ? 0.1 : 0.3 },
                y: emotion === 'thinking' ? { duration: 1.5, repeat: Infinity } : {}
              }}
            >
              {/* Left & Right eyes */}
              {[0, 1].map((eyeIndex) => (
                <div key={eyeIndex} className="relative w-3 h-3">
                  <motion.div 
                    className="w-full h-full rounded-full absolute inset-0"
                    style={{
                      background: `radial-gradient(circle at 40% 40%, ${colors.secondary}, ${colors.primary})`,
                      boxShadow: `0 0 12px ${colors.glow}`,
                    }}
                    animate={{
                      boxShadow: state === 'talking' || emotion === 'excited'
                        ? [
                            `0 0 12px ${colors.glow}`,
                            `0 0 20px ${colors.glow}`,
                            `0 0 12px ${colors.glow}`,
                          ]
                        : `0 0 12px ${colors.glow}`,
                    }}
                    transition={{ duration: 0.6, repeat: state === 'talking' ? Infinity : 0 }}
                  />
                  {/* Pupil */}
                  {!eyeBlink && (
                    <motion.div
                      className="absolute w-1.5 h-1.5 rounded-full bg-slate-900"
                      style={{
                        top: '50%',
                        left: '50%',
                        marginTop: '-3px',
                        marginLeft: '-3px',
                      }}
                      animate={{
                        scale: state === 'listening' || emotion === 'concerned' ? [1, 1.3, 1] : 1,
                        x: emotion === 'thinking' && eyeIndex === 0 ? -2 : pupilPosition.x,
                        y: emotion === 'thinking' ? -2 : pupilPosition.y,
                      }}
                      transition={{
                        scale: { duration: 1, repeat: state === 'listening' ? Infinity : 0 },
                        x: { duration: 0.3, ease: "easeOut" },
                        y: { duration: 0.3, ease: "easeOut" },
                      }}
                    />
                  )}
                </div>
              ))}
            </motion.div>

            {/* Mouth */}
            <motion.div
              className="absolute bottom-6 left-1/2 -translate-x-1/2"
              animate={
                state === 'talking' 
                  ? {
                      scaleX: [1, 1.4, 1.1, 1.4, 1],
                      scaleY: [1, 0.7, 0.9, 0.7, 1],
                      width: [24, 28, 24, 28, 24],
                    }
                  : {}
              }
              transition={{
                duration: state === 'talking' ? 0.5 : 0.3,
                repeat: state === 'talking' ? Infinity : 0,
                ease: "easeInOut"
              }}
              style={getMouthStyle()}
            >
              <div 
                className="h-1 rounded-full"
                style={{
                  background: state === 'talking' || emotion === 'excited'
                    ? `linear-gradient(90deg, transparent, rgba(${colors.glowRGB}, 0.8), transparent)` 
                    : `rgba(${colors.glowRGB}, ${emotion === 'sleepy' ? '0.3' : '0.5'})`,
                  boxShadow: state === 'talking' ? `0 0 8px ${colors.glow}` : 'none'
                }}
              />
            </motion.div>

            {/* Thinking indicator (? mark) */}
            {emotion === 'thinking' && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1, 1, 0],
                  y: [0, -10, -10, -20]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-1 text-xs"
                style={{ color: colors.secondary }}
              >
                ?
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Talking waveform */}
        {state === 'talking' && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5 items-end h-6">
            {[...Array(7)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full"
                style={{
                  background: `linear-gradient(180deg, ${colors.secondary}, ${colors.primary})`,
                  boxShadow: `0 0 4px ${colors.glow}`,
                }}
                animate={{
                  height: ['6px', `${12 + Math.sin(i) * 8}px`, '6px'],
                }}
                transition={{
                  duration: 0.5 + (i % 3) * 0.1,
                  repeat: Infinity,
                  delay: i * 0.08,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* State label */}
      {!isClickable && (
        <motion.div 
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded-full whitespace-nowrap"
          style={{
            background: `rgba(${colors.glowRGB}, 0.15)`,
            border: `1px solid rgba(${colors.glowRGB}, 0.3)`,
            color: colors.primary
          }}
          animate={{ opacity: isHovered ? 1 : 0.7 }}
        >
          {emotion !== 'neutral' ? emotion.charAt(0).toUpperCase() + emotion.slice(1) : state.charAt(0).toUpperCase() + state.slice(1)}
        </motion.div>
      )}
    </motion.div>
  );
}