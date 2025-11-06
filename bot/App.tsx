import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatbotAvatar } from './components/ChatbotAvatar';
import { ChatInterface } from './components/ChatInterface';

type AvatarState = 'idle' | 'listening' | 'talking';
type EmotionState = 'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited' | 'sleepy';
type SpecialAnimation = 'none' | 'wave' | 'dance' | 'spin' | 'rainbow';
type ColorTheme = 'teal' | 'purple' | 'blue' | 'pink';

export default function App() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 relative overflow-hidden">
      {/* Background ambient effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent" />
      
      {/* Demo content */}
      <div className="relative z-0 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-white/90 mb-4">AliceSolutions Group</h1>
          <p className="text-white/70">
            Security, Compliance & Venture Building Services
          </p>
          <div className="mt-8 space-y-2 text-white/60 text-sm">
            <p>✨ <strong>Interactive Features:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>🖱️ Move your mouse - Ava follows you with her eyes and head</li>
              <li>👆 Click anywhere - She reacts with excitement</li>
              <li>💬 Click on Ava to start chatting</li>
              <li>⌨️ Press <kbd className="px-2 py-0.5 bg-white/10 rounded">C</kbd> to open chat quickly</li>
            </ul>
            <p className="mt-4">🎉 <strong>Easter Eggs - Try typing:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code className="text-teal-400">wave</code> - She waves back!</li>
              <li><code className="text-purple-400">dance</code> - Watch her groove</li>
              <li><code className="text-blue-400">smile</code> - Makes her happy</li>
              <li><code className="text-pink-400">rainbow</code> - Colorful mode!</li>
              <li><code className="text-yellow-400">spin</code> - Spins around</li>
            </ul>
            <p className="mt-4">🎨 <strong>Themes:</strong> Click the palette icon in chat to change colors!</p>
          </div>
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <AnimatePresence>
        {!isChatOpen && !hasWaved && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 3 }}
            className="fixed bottom-32 right-8 px-4 py-2 rounded-lg text-sm text-white/60"
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
              size="medium" 
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
              size="medium" 
              isClickable={true}
              showAttentionSeeker={showAttentionSeeker}
              onAnimationComplete={handleAnimationComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
