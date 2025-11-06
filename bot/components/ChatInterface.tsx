import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Sparkles, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { TypingIndicator } from './TypingIndicator';

type AvatarState = 'idle' | 'listening' | 'talking';
type EmotionState = 'neutral' | 'happy' | 'thinking' | 'concerned' | 'excited' | 'sleepy';
type SpecialAnimation = 'none' | 'wave' | 'dance' | 'spin' | 'rainbow';
type ColorTheme = 'teal' | 'purple' | 'blue' | 'pink';

interface Message {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  emotion?: EmotionState;
}

interface ChatInterfaceProps {
  avatarState: AvatarState;
  onStateChange: (state: AvatarState) => void;
  onEmotionChange: (emotion: EmotionState) => void;
  onSpecialAnimation: (animation: SpecialAnimation) => void;
  onThemeChange: (theme: ColorTheme) => void;
  currentTheme: ColorTheme;
  onClose: () => void;
  isMobile: boolean;
}

const SUGGESTED_PROMPTS = [
  "Tell me about your ISO 27001 services",
  "How can SmartStart help my startup?",
  "I need a virtual CISO – what does that mean?"
];

const QUICK_ACTIONS = [
  { label: "Book a Demo", icon: "📅", action: "demo" },
  { label: "Contact Sales", icon: "📞", action: "contact" },
  { label: "View Services", icon: "🔍", action: "services" }
];

// Easter eggs!
const EASTER_EGGS: Record<string, { response: string; animation?: SpecialAnimation; emotion?: EmotionState }> = {
  'wave': { 
    response: "👋 *waves back enthusiastically*", 
    animation: 'wave', 
    emotion: 'happy' 
  },
  'dance': { 
    response: "💃 Let's dance! *grooves*", 
    animation: 'dance', 
    emotion: 'excited' 
  },
  'smile': { 
    response: "😊 *big smile* You made my day!", 
    emotion: 'happy' 
  },
  'spin': { 
    response: "🌀 *spins around*", 
    animation: 'spin' 
  },
  'rainbow': { 
    response: "🌈 Activating rainbow mode! So colorful!", 
    animation: 'rainbow', 
    emotion: 'excited' 
  },
  'hello': { 
    response: "Hello! 👋 Nice to meet you!", 
    animation: 'wave', 
    emotion: 'happy' 
  },
  'hi': { 
    response: "Hey there! 😊", 
    emotion: 'happy' 
  },
  'good morning': { 
    response: "Good morning! ☀️ Hope you have an amazing day!", 
    emotion: 'happy' 
  },
  'good night': { 
    response: "Good night! 😴 Sleep well!", 
    emotion: 'sleepy' 
  },
  'thanks': { 
    response: "You're welcome! Happy to help! 😊", 
    emotion: 'happy' 
  },
  'thank you': { 
    response: "My pleasure! That's what I'm here for! ✨", 
    emotion: 'happy' 
  },
};

// Get time-based greeting
const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

export function ChatInterface({ 
  avatarState, 
  onStateChange, 
  onEmotionChange,
  onSpecialAnimation,
  onThemeChange,
  currentTheme,
  onClose, 
  isMobile 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: `${getTimeBasedGreeting()}! I'm Ava, your AliceSolutions Assistant. How can I help you today? 🔍`,
      timestamp: new Date(),
      emotion: 'happy'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const detectKeywords = (text: string): EmotionState => {
    const lowerText = text.toLowerCase();
    
    // Positive keywords
    if (lowerText.match(/\\b(great|awesome|perfect|excellent|amazing|love|wonderful)\\b/)) {
      return 'happy';
    }
    
    // Question/thinking keywords
    if (lowerText.match(/\\b(how|what|why|when|where|could|would|should)\\b/)) {
      return 'thinking';
    }
    
    // Problem/concern keywords
    if (lowerText.match(/\\b(problem|issue|worry|concerned|help|urgent|stuck)\\b/)) {
      return 'concerned';
    }
    
    // Excitement keywords
    if (lowerText.match(/\\b(excited|wow|incredible|awesome)\\b/) || text.includes('!')) {
      return 'excited';
    }
    
    return 'neutral';
  };

  const handleSend = (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    // Check for easter eggs first
    const lowerText = text.toLowerCase();
    const easterEgg = EASTER_EGGS[lowerText] || EASTER_EGGS[lowerText.trim()];
    
    if (easterEgg) {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: text,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');

      // Trigger special animation if any
      if (easterEgg.animation) {
        onSpecialAnimation(easterEgg.animation);
      }
      
      // Set emotion
      if (easterEgg.emotion) {
        onEmotionChange(easterEgg.emotion);
      }

      // Add bot response
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: easterEgg.response,
          timestamp: new Date(),
          emotion: easterEgg.emotion
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Reset after a delay
        setTimeout(() => {
          if (easterEgg.animation) {
            onSpecialAnimation('none');
          }
          onEmotionChange('neutral');
        }, 3000);
      }, 500);
      
      return;
    }

    // Normal message handling
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Detect emotion from user message
    const emotion = detectKeywords(text);
    onEmotionChange(emotion);

    // Change to talking state
    onStateChange('talking');
    setIsTyping(true);

    setTimeout(() => {
      const response = getBotResponse(text);
      const botEmotion = detectKeywords(response);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response,
        timestamp: new Date(),
        emotion: botEmotion
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      
      onEmotionChange(botEmotion);
      
      // Return to idle
      setTimeout(() => {
        onStateChange('idle');
        onEmotionChange('neutral');
      }, 2000);
    }, 1500 + Math.random() * 1000);
  };

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('iso') || lowerMessage.includes('27001')) {
      return "We provide comprehensive ISO 27001 certification services, including gap analysis, implementation support, and ongoing compliance management. Our team helps you build robust security frameworks tailored to your business needs. Interested in learning more?";
    }
    if (lowerMessage.includes('smartstart') || lowerMessage.includes('startup')) {
      return "SmartStart is our venture-building community designed to accelerate startup growth! We offer mentorship, security-by-design consulting, and connections to our network of investors and partners. It's perfect for early-stage companies looking to build secure, compliant products from day one. 🚀";
    }
    if (lowerMessage.includes('ciso') || lowerMessage.includes('virtual')) {
      return "A virtual CISO (Chief Information Security Officer) provides strategic security leadership without the cost of a full-time executive. We assess your risk landscape, develop security strategies, manage compliance programs, and serve as your trusted security advisor on demand.";
    }
    if (lowerMessage.includes('demo') || lowerMessage.includes('book')) {
      return "I'd love to schedule a demo for you! Our team can walk you through our services and show you how we can help your business. What's the best way to reach you?";
    }
    if (lowerMessage.includes('contact') || lowerMessage.includes('sales')) {
      return "Our sales team would be happy to chat with you! You can reach us at contact@alicesolutions.com or I can have someone reach out to you directly. What works best for you?";
    }
    
    return "Great question! I'd love to help you explore that further. Our team at AliceSolutions specializes in security, compliance, and venture-building. Would you like me to connect you with one of our specialists, or can I provide more details on a specific service?";
  };

  const handleQuickAction = (action: string) => {
    setShowQuickActions(false);
    
    const actionMessages: Record<string, string> = {
      demo: "I'd like to book a demo",
      contact: "I want to contact sales",
      services: "Tell me about your services"
    };
    
    handleSend(actionMessages[action]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    if (e.target.value && avatarState !== 'listening') {
      onStateChange('listening');
    } else if (!e.target.value && avatarState === 'listening') {
      onStateChange('idle');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const themes = [
    { name: 'teal', color: '#00C5D6', emoji: '🌊' },
    { name: 'purple', color: '#A855F7', emoji: '💜' },
    { name: 'blue', color: '#3B82F6', emoji: '💙' },
    { name: 'pink', color: '#EC4899', emoji: '💖' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex flex-col ${isMobile ? 'w-full h-full' : 'w-[340px] h-[520px]'} rounded-2xl overflow-hidden`}
      style={{
        background: isMobile 
          ? 'rgba(15, 23, 42, 0.95)' 
          : 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(40px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 100px rgba(0, 197, 214, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15), inset 0 0 20px rgba(0, 197, 214, 0.05)'
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{
          borderColor: 'rgba(0, 197, 214, 0.2)',
          background: 'linear-gradient(90deg, rgba(0, 197, 214, 0.1) 0%, transparent 100%)'
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-2 h-2 rounded-full"
            style={{
              background: '#00C5D6',
              boxShadow: '0 0 8px rgba(0, 197, 214, 0.8)'
            }}
          />
          <div>
            <h3 className="text-white">Ava</h3>
            <p className="text-xs text-white/60">AI Assistant</p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Theme picker */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowThemePicker(!showThemePicker)}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <Palette className="w-4 h-4" />
            </Button>
            
            <AnimatePresence>
              {showThemePicker && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute right-0 top-10 p-2 rounded-lg flex gap-2 z-20"
                  style={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  {themes.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => {
                        onThemeChange(theme.name as ColorTheme);
                        setShowThemePicker(false);
                      }}
                      className="w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                      style={{
                        background: theme.color,
                        opacity: currentTheme === theme.name ? 1 : 0.6,
                        boxShadow: currentTheme === theme.name ? `0 0 12px ${theme.color}` : 'none'
                      }}
                      title={theme.name}
                    >
                      {theme.emoji}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'rounded-tr-sm'
                    : 'rounded-tl-sm'
                }`}
                style={
                  message.type === 'user'
                    ? {
                        background: 'linear-gradient(135deg, rgba(0, 197, 214, 0.3) 0%, rgba(0, 197, 214, 0.2) 100%)',
                        border: '1px solid rgba(0, 197, 214, 0.4)',
                        color: '#fff'
                      }
                    : {
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#fff'
                      }
                }
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div
              className="px-4 py-3 rounded-2xl rounded-tl-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <TypingIndicator />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick actions */}
      {messages.length >= 3 && !showQuickActions && (
        <div className="px-6 pb-2">
          <button
            onClick={() => setShowQuickActions(true)}
            className="w-full text-xs text-white/60 hover:text-white/80 flex items-center justify-center gap-2 py-2"
          >
            <Sparkles className="w-3 h-3" />
            Quick Actions
          </button>
        </div>
      )}

      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-6 pb-3 overflow-hidden"
          >
            <div className="flex gap-2">
              {QUICK_ACTIONS.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleQuickAction(action.action)}
                  className="flex-1 px-3 py-2 rounded-lg text-xs text-white/80 hover:text-white transition-all duration-200"
                  style={{
                    background: 'rgba(0, 197, 214, 0.15)',
                    border: '1px solid rgba(0, 197, 214, 0.3)',
                  }}
                >
                  <div>{action.icon}</div>
                  <div className="mt-1">{action.label}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggested prompts */}
      {messages.length === 1 && (
        <div className="px-6 pb-3 space-y-2">
          <p className="text-xs text-white/50 mb-2">💡 Try asking:</p>
          {SUGGESTED_PROMPTS.map((prompt, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              onClick={() => handleSend(prompt)}
              className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-white/80 hover:text-white transition-all duration-200"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(0, 197, 214, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 197, 214, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(0, 197, 214, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(0, 197, 214, 0.2)';
              }}
            >
              {prompt}
            </motion.button>
          ))}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-white/40 pt-2 text-center"
          >
            🎉 Try typing: wave, dance, smile, rainbow
          </motion.div>
        </div>
      )}

      {/* Input area */}
      <div 
        className="px-6 py-4 border-t"
        style={{
          borderColor: 'rgba(0, 197, 214, 0.2)',
          background: 'rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your question…"
            className="flex-1 px-4 py-2.5 rounded-lg text-sm text-white placeholder:text-white/40 outline-none transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(0, 197, 214, 0.4)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 197, 214, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.boxShadow = 'none';
              if (!inputValue && avatarState === 'listening') {
                onStateChange('idle');
              }
            }}
          />
          <Button
            onClick={() => handleSend()}
            disabled={!inputValue.trim()}
            className="px-4 py-2.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            style={{
              background: inputValue.trim() 
                ? 'linear-gradient(135deg, #00C5D6 0%, #00E5FF 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(0, 197, 214, 0.3)',
              color: '#fff',
              boxShadow: inputValue.trim() 
                ? '0 4px 12px rgba(0, 197, 214, 0.3)'
                : 'none'
            }}
            onMouseEnter={(e) => {
              if (inputValue.trim()) {
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 197, 214, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (inputValue.trim()) {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 197, 214, 0.3)';
              }
            }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}