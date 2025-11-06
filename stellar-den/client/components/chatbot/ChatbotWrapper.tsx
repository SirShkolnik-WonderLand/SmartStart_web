import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatbotAvatar } from './ChatbotAvatar';
import { ChatInterface } from './ChatInterface';

type AvatarState = 'idle' | 'listening' | 'talking';
type EmotionState = 'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited' | 'sleepy';
type SpecialAnimation = 'none' | 'wave' | 'dance' | 'spin' | 'rainbow';
type ColorTheme = 'teal' | 'purple' | 'blue' | 'pink';

export function ChatbotWrapper() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [emotion, setEmotion] = useState<EmotionState>('neutral');
  const [specialAnimation, setSpecialAnimation] = useState<SpecialAnimation>('none');
  const [theme, setTheme] = useState<ColorTheme>('teal');
  const [isMobile, setIsMobile] = useState(false);
  const [hasWaved, setHasWaved] = useState(false);
  const [showAttentionSeeker, setShowAttentionSeeker] = useState(false);
  const [idleTime, setIdleTime] = useState(0);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Wave hello on page load
  useEffect(() => {
    const waveTimer = setTimeout(() => {
      setSpecialAnimation('wave');
      setEmotion('happy');
      setHasWaved(true);
      
      setTimeout(() => {
        setSpecialAnimation('none');
        setEmotion('neutral');
      }, 2000);
    }, 1000);

    return () => clearTimeout(waveTimer);
  }, []);

  // Attention seeker when idle too long
  useEffect(() => {
    let activityTimer: NodeJS.Timeout;
    let attentionTimer: NodeJS.Timeout;

    const resetActivity = () => {
      setIdleTime(0);
      setShowAttentionSeeker(false);
      
      clearTimeout(activityTimer);
      clearTimeout(attentionTimer);
      
      activityTimer = setTimeout(() => {
        setIdleTime(prev => prev + 1);
      }, 30000); // 30 seconds

      attentionTimer = setTimeout(() => {
        if (!isChatOpen) {
          setShowAttentionSeeker(true);
          // Bounce animation
          setTimeout(() => {
            setShowAttentionSeeker(false);
          }, 3000);
        }
      }, 60000); // 1 minute
    };

    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetActivity);
    });

    resetActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetActivity);
      });
      clearTimeout(activityTimer);
      clearTimeout(attentionTimer);
    };
  }, [isChatOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // 'C' or '/' to open chat
      if ((e.key.toLowerCase() === 'c' || e.key === '/') && !isChatOpen && e.target === document.body) {
        e.preventDefault();
        setIsChatOpen(true);
      }
      
      // Escape to close chat
      if (e.key === 'Escape' && isChatOpen) {
        setIsChatOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  }, [isChatOpen]);

  // Reset animation when complete
  const handleAnimationComplete = () => {
    setSpecialAnimation('none');
  };

  return (
    <>
      {/* Keyboard shortcut hint */}
      <AnimatePresence>
        {!isChatOpen && !hasWaved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 3 }}
            className="fixed bottom-32 right-8 px-4 py-2 rounded-lg text-sm text-white/60 z-40"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            💡 Tip: Press <kbd className="px-2 py-0.5 bg-white/10 rounded mx-1">C</kbd> to chat
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chatbot Container */}
      {isMobile ? (
        // Mobile: Full-screen when chat open
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl"
            >
              <div className="h-full flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-start pt-8">
                  <ChatbotAvatar 
                    state={avatarState} 
                    emotion={emotion}
                    specialAnimation={specialAnimation}
                    theme={theme}
                    size="large" 
                    onAnimationComplete={handleAnimationComplete}
                  />
                  <ChatInterface
                    avatarState={avatarState}
                    onStateChange={setAvatarState}
                    onEmotionChange={setEmotion}
                    onSpecialAnimation={setSpecialAnimation}
                    onThemeChange={setTheme}
                    currentTheme={theme}
                    onClose={() => setIsChatOpen(false)}
                    isMobile={isMobile}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        // Desktop: Floating avatar with expandable chat
        <div className="fixed bottom-8 right-8 z-50 flex items-end gap-4">
          {/* Cloudy aura */}
          <div 
            className="absolute inset-0 -m-16 rounded-full opacity-40 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(0, 197, 214, 0.3), rgba(100, 200, 220, 0.15) 50%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          <div 
            className="absolute inset-0 -m-12 rounded-full opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(0, 229, 255, 0.2), transparent 60%)',
              filter: 'blur(80px)',
            }}
          />
          
          {/* Avatar */}
          <motion.div 
            onClick={() => setIsChatOpen(!isChatOpen)} 
            className="cursor-pointer relative z-10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChatbotAvatar 
              state={avatarState} 
              emotion={emotion}
              specialAnimation={specialAnimation}
              theme={theme}
              size={isMobile ? "small" : "medium"} 
              isClickable={!isChatOpen}
              showAttentionSeeker={showAttentionSeeker}
              onAnimationComplete={handleAnimationComplete}
            />
          </motion.div>
          
          {/* Chat panel */}
          <AnimatePresence>
            {isChatOpen && (
              <ChatInterface
                avatarState={avatarState}
                onStateChange={setAvatarState}
                onEmotionChange={setEmotion}
                onSpecialAnimation={setSpecialAnimation}
                onThemeChange={setTheme}
                currentTheme={theme}
                onClose={() => setIsChatOpen(false)}
                isMobile={isMobile}
              />
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Mobile: Floating avatar when chat closed */}
      <AnimatePresence>
        {isMobile && !isChatOpen && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-8 right-8 z-50 cursor-pointer"
          >
            <ChatbotAvatar 
              state={avatarState} 
              emotion={emotion}
              specialAnimation={specialAnimation}
              theme={theme}
              size="small" 
              isClickable={true}
              showAttentionSeeker={showAttentionSeeker}
              onAnimationComplete={handleAnimationComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

