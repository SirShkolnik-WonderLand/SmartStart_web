import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { 
  MessageSquare, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Trophy,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Bot,
  Zap,
  Brain,
  Shield,
  ChevronRight,
  Phone
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StoryBotQuestion } from "../../../shared/iso";

interface QuickBotModeProps {
  onComplete: () => void;
}

export default function QuickBotMode({ onComplete }: QuickBotModeProps) {
  console.log('[QuickBotMode] Component rendering');
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<StoryBotQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [emailConsent, setEmailConsent] = useState(false);
  const [showDetailedReport, setShowDetailedReport] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [showQuestion, setShowQuestion] = useState(false);
  const [conversationPhase, setConversationPhase] = useState<'welcome' | 'question' | 'complete'>('welcome');

  // Load questions from API
  useEffect(() => {
    console.log('[QuickBotMode] Component mounted, loading questions...');
    const loadQuestions = async () => {
      try {
        console.log('[QuickBotMode] Fetching questions from /api/iso/story-bot-questions');
        const response = await fetch("/api/iso/story-bot-questions");
        
        console.log('[QuickBotMode] Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          console.error('[QuickBotMode] Failed to fetch story bot questions:', response.status);
          setQuestions([]);
          setLoading(false);
          return;
        }
        const data = await response.json();
        console.log('[QuickBotMode] Received data:', { 
          hasQuestions: Array.isArray(data.questions), 
          questionCount: data.questions?.length || 0,
          success: data.success 
        });
        // Safely handle undefined or null questions
        const questionsArray = Array.isArray(data.questions) ? data.questions : [];
        setQuestions(questionsArray);
        setLoading(false);
        console.log('[QuickBotMode] Questions loaded:', questionsArray.length);
      } catch (error) {
        console.error("[QuickBotMode] Failed to load questions:", error);
        setLoading(false);
        // Fallback to all 20 questions when API fails
        const fallbackQuestions: StoryBotQuestion[] = [
          {
            id: "q1",
            category: "Leadership & Governance",
            question: "Do you have a documented information security policy approved by senior management?",
            guidance: "A formal security policy demonstrates leadership commitment and sets the foundation for your security program.",
            score: 0
          },
          {
            id: "q2",
            category: "Leadership & Governance",
            question: "Have you assigned clear information security roles and responsibilities?",
            guidance: "Everyone needs to know their security responsibilities. Clear roles prevent gaps and ensure accountability.",
            score: 0
          },
          {
            id: "q3",
            category: "Leadership & Governance",
            question: "Do you have a formal process for identifying and managing information security risks?",
            guidance: "Risk management is the cornerstone of security. You need to identify, assess, and treat risks systematically.",
            score: 0
          },
          {
            id: "q4",
            category: "Leadership & Governance",
            question: "Do you conduct regular security awareness training for all employees?",
            guidance: "Your people are your first line of defense. Regular training keeps security top of mind.",
            score: 0
          },
          {
            id: "q5",
            category: "Access Control",
            question: "Do you have a formal process for granting and revoking user access?",
            guidance: "Access control prevents unauthorized access. You need documented procedures for the entire user lifecycle.",
            score: 0
          },
          {
            id: "q6",
            category: "Access Control",
            question: "Do you enforce strong password requirements and multi-factor authentication for sensitive systems?",
            guidance: "Strong authentication is essential. Passwords alone aren't enough for critical systems.",
            score: 0
          },
          {
            id: "q7",
            category: "Access Control",
            question: "Do you regularly review and remove unnecessary user access rights?",
            guidance: "Access creep is a real problem. Regular reviews ensure people only have access to what they need.",
            score: 0
          },
          {
            id: "q8",
            category: "Access Control",
            question: "Do you segregate duties to prevent conflicts of interest?",
            guidance: "The same person shouldn't design, implement, and audit security controls. Separation prevents fraud and errors.",
            score: 0
          },
          {
            id: "q9",
            category: "Asset Management",
            question: "Do you maintain an inventory of all information assets?",
            guidance: "You can't protect what you don't know you have. An asset inventory is the foundation of security.",
            score: 0
          },
          {
            id: "q10",
            category: "Asset Management",
            question: "Have you assigned owners to all information assets?",
            guidance: "Every asset needs an owner who's responsible for its security. This drives accountability.",
            score: 0
          },
          {
            id: "q11",
            category: "Asset Management",
            question: "Do you classify information based on sensitivity and business impact?",
            guidance: "Not all data is created equal. Classification helps you prioritize protection efforts.",
            score: 0
          },
          {
            id: "q12",
            category: "Asset Management",
            question: "Do you have acceptable use policies for information and IT assets?",
            guidance: "Clear policies set boundaries for how company resources can be used.",
            score: 0
          },
          {
            id: "q13",
            category: "Operations & Maintenance",
            question: "Do you have documented operational procedures for information security?",
            guidance: "Consistent procedures reduce errors and ensure security is maintained in daily operations.",
            score: 0
          },
          {
            id: "q14",
            category: "Operations & Maintenance",
            question: "Do you have a formal change management process?",
            guidance: "Uncontrolled changes are a major cause of security incidents. You need a formal process.",
            score: 0
          },
          {
            id: "q15",
            category: "Operations & Maintenance",
            question: "Do you regularly backup critical information and test restoration procedures?",
            guidance: "Backups are your safety net. But they're useless if you can't restore from them.",
            score: 0
          },
          {
            id: "q16",
            category: "Operations & Maintenance",
            question: "Do you monitor and log security events?",
            guidance: "You can't defend against threats you can't see. Logging and monitoring are essential for detection.",
            score: 0
          },
          {
            id: "q17",
            category: "Incident Management",
            question: "Do you have a documented incident response plan?",
            guidance: "When an incident happens, you need a plan. Preparation is key to effective response.",
            score: 0
          },
          {
            id: "q18",
            category: "Incident Management",
            question: "Have you tested your incident response procedures?",
            guidance: "A plan that hasn't been tested is just a wish. Regular testing ensures you're ready.",
            score: 0
          },
          {
            id: "q19",
            category: "Business Continuity",
            question: "Do you have a business continuity plan that includes information security?",
            guidance: "Disasters happen. Your security controls need to continue operating even during disruptions.",
            score: 0
          },
          {
            id: "q20",
            category: "Business Continuity",
            question: "Have you tested your business continuity plan?",
            guidance: "Like incident response, continuity plans need regular testing to ensure they work when needed.",
            score: 0
          }
        ];
        console.log('[QuickBotMode] Using fallback questions:', fallbackQuestions.length);
        setQuestions(fallbackQuestions);
        setLoading(false);
      } finally {
        console.log('[QuickBotMode] Load questions complete, loading set to false');
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  // Typing animation effect
  const typeText = async (text: string, speed: number = 30): Promise<void> => {
    setIsTyping(true);
    setDisplayedText("");
    
    for (let i = 0; i <= text.length; i++) {
      setDisplayedText(text.slice(0, i));
      await new Promise(resolve => setTimeout(resolve, speed));
    }
    
    setIsTyping(false);
  };

  // Start conversation flow
  const startConversation = async () => {
    setConversationPhase('welcome');
    await typeText("🦉 Hello! I'm your Cyber-Owl AI Security Advisor. Thanks for taking a few minutes to assess your security!", 25);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    await typeText("I'll ask you just 20 quick questions - it'll only take about 3-4 minutes of your time.", 20);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await typeText("Ready to get started? Let's begin with the first question!", 25);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    setConversationPhase('question');
    setShowQuestion(true);
  };

  // Initialize conversation when questions load
  useEffect(() => {
    console.log('[QuickBotMode] Questions effect:', { 
      questionCount: questions.length, 
      conversationPhase, 
      loading 
    });
    if (questions.length > 0 && conversationPhase === 'welcome' && !loading) {
      console.log('[QuickBotMode] Starting conversation...');
      startConversation();
    }
  }, [questions.length, conversationPhase, loading]);


  // Generate dynamic response based on user's answer and progress
  const getDynamicResponse = (score: number, questionIndex: number, totalQuestions: number) => {
    const progress = Math.round(((questionIndex + 1) / totalQuestions) * 100);
    const remaining = totalQuestions - questionIndex - 1;
    
    // Score-based responses
    const scoreResponses = {
      0: [
        "No worries! Every security journey starts somewhere. Let's keep going!",
        "That's okay - we're here to help you improve. Next question!",
        "Starting from zero is perfectly fine. Let's see what's next!",
        "No problem! This assessment will help you build from the ground up."
      ],
      1: [
        "You're getting started! That's the first step. Moving on...",
        "Good start! Let's see how you're doing in other areas.",
        "Beginning to implement - that's progress! Next question.",
        "You're on the right track! Let's continue the assessment."
      ],
      2: [
        "Making progress! Let's see what else you've got.",
        "Good foundation! Moving to the next area...",
        "You're building momentum! Next question coming up.",
        "Nice work so far! Let's keep the assessment going."
      ],
      3: [
        "Solid progress! You're doing well. Next question!",
        "Good implementation! Let's see how you handle the next one.",
        "You're on a roll! Moving to question " + (questionIndex + 2) + "...",
        "Nice work! " + remaining + " more questions to go."
      ],
      4: [
        "Excellent work! You're really getting this. Next question!",
        "Great implementation! Let's see what's next.",
        "You're doing fantastic! Moving on to question " + (questionIndex + 2) + "...",
        "Outstanding! " + remaining + " questions left to complete."
      ],
      5: [
        "Outstanding! You're really excelling at this. Next question!",
        "Fantastic work! Let's see if you can keep this up.",
        "You're on fire! Moving to question " + (questionIndex + 2) + "...",
        "Amazing! Only " + remaining + " more questions to go."
      ],
      6: [
        "Incredible! You're doing exceptionally well. Next question!",
        "Outstanding work! Let's see what's next.",
        "You're absolutely crushing this! Question " + (questionIndex + 2) + " coming up...",
        "Exceptional! Just " + remaining + " questions remaining."
      ],
      7: [
        "Perfect! You're absolutely killing it! Next question!",
        "Flawless! Let's see if you can maintain this excellence.",
        "You're unstoppable! Moving to question " + (questionIndex + 2) + "...",
        "Perfect score! Only " + remaining + " more questions to go."
      ]
    };
    
    // Progress-based responses
    const progressResponses = {
      early: [
        "We're just getting started!",
        "Great beginning!",
        "Off to a good start!"
      ],
      middle: [
        "We're halfway there!",
        "Great progress so far!",
        "You're doing amazing!"
      ],
      late: [
        "Almost there!",
        "You're almost done!",
        "Final stretch!"
      ]
    };
    
    // Get score-based response
    const scoreResponse = scoreResponses[score as keyof typeof scoreResponses] || scoreResponses[0];
    const selectedScoreResponse = scoreResponse[Math.floor(Math.random() * scoreResponse.length)];
    
    // Get progress-based response
    let progressResponse = "";
    if (progress < 30) {
      progressResponse = progressResponses.early[Math.floor(Math.random() * progressResponses.early.length)];
    } else if (progress < 70) {
      progressResponse = progressResponses.middle[Math.floor(Math.random() * progressResponses.middle.length)];
    } else {
      progressResponse = progressResponses.late[Math.floor(Math.random() * progressResponses.late.length)];
    }
    
    // Combine responses
    return `${selectedScoreResponse} ${progressResponse}`;
  };

  const handleNext = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      const currentScore = questions[currentQuestionIndex].score || 0;
      const dynamicResponse = getDynamicResponse(currentScore, currentQuestionIndex, questions.length);
      
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setConversationPhase('question');
      setShowQuestion(true);
      
      // Dynamic bot message based on user's answer and progress
      await typeText(dynamicResponse, 20);
    } else {
      setConversationPhase('complete');
      setShowQuestion(false);
      
      // Bot response for completion
      await typeText("Excellent! You've completed all questions. Analyzing your responses...", 20);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      await typeText("Calculating your security readiness score...", 25);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setShowEmailCapture(true);
    }
  };

  // Auto-proceed when user selects a score
  const handleScoreChange = (score: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].score = score;
    setQuestions(updatedQuestions);
    
    // Auto-proceed after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        handleNext();
      } else {
        handleNext(); // Complete assessment
      }
    }, 800);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleEmailSubmit = async () => {
    if (!userEmail || !emailConsent) return;
    
    try {
      const results = calculateResults();
      
      const response = await fetch('/api/iso/send-quickbot-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          assessmentData: {
            percentage: results.percentage,
            readinessLevel: results.readinessLevel,
            recommendations: results.recommendations,
            questions: questions.map(q => ({
              question: q.question,
              score: q.score || 0,
            })),
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowEmailCapture(false);
        setShowDetailedReport(true);
      } else {
        console.error('Failed to send report:', data.error);
        alert('Failed to send report. Please try again.');
      }
    } catch (error) {
      console.error('Failed to send report:', error);
      alert('Failed to send report. Please try again.');
    }
  };

  const calculateResults = () => {
    const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
    const maxScore = questions.length * 7;
    const percentage = Math.round((totalScore / maxScore) * 100);

    let readinessLevel: "Low" | "Medium" | "High" | "Excellent";
    let recommendations: string[] = [];

    if (percentage >= 80) {
      readinessLevel = "Excellent";
      recommendations = [
        "Your security program is well-established and mature",
        "Focus on continuous improvement and staying current with emerging threats",
        "Consider pursuing formal ISO 27001 certification",
        "Share your best practices with other organizations"
      ];
    } else if (percentage >= 60) {
      readinessLevel = "High";
      recommendations = [
        "You have a solid foundation for security",
        "Address the gaps identified in your assessment",
        "Strengthen areas where you scored below 5",
        "Consider formal security training for your team"
      ];
    } else if (percentage >= 40) {
      readinessLevel = "Medium";
      recommendations = [
        "Your security program needs strengthening",
        "Prioritize high-impact controls first",
        "Develop clear security policies and procedures",
        "Invest in security awareness training"
      ];
    } else {
      readinessLevel = "Low";
      recommendations = [
        "Your security program requires immediate attention",
        "Start with basic security controls and policies",
        "Consider engaging a security consultant",
        "Prioritize critical assets and high-risk areas"
      ];
    }

    return { totalScore, maxScore, percentage, readinessLevel, recommendations };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto animate-reverse" />
            <div className="absolute inset-2 w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-foreground font-medium mb-2"
          >
            Preparing your Cyber-Owl Security Advisor...
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm text-muted-foreground"
          >
            Loading your personalized security assessment
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (showEmailCapture) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-8 px-4 sm:px-6 md:px-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Bot Avatar */}
            <div className="flex items-center justify-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="w-20 h-20 flex items-center justify-center shadow-2xl">
                  <img 
                    src="/Cyber-Owl_logo.png" 
                    alt="Cyber Owl AI" 
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            </div>

            {/* Email Capture Card */}
            <Card className="backdrop-blur-xl bg-card/50 border border-border shadow-2xl p-8 sm:p-12">
              <div className="text-center mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-lg font-bold mb-6 shadow-lg"
                >
                  <Trophy className="w-6 h-6" />
                  <span>Assessment Complete!</span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent"
                >
                  Get Your Detailed Security Report
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-lg text-muted-foreground mb-8"
                >
                  Enter your email to receive your personalized security assessment report with detailed recommendations and next steps.
                </motion.p>
              </div>

              {/* Email Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="your.email@company.com"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-card/30 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={emailConsent}
                    onChange={(e) => setEmailConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 text-primary bg-card/30 border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed">
                    I agree to receive security insights, updates, and recommendations via email. 
                    I understand I can unsubscribe at any time.
                  </label>
                </div>

                <Button
                  onClick={handleEmailSubmit}
                  disabled={!userEmail || !emailConsent}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg py-3 text-lg"
                >
                  Get My Security Report
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  if (showDetailedReport) {
    const results = calculateResults();
    const { totalScore, maxScore, percentage, readinessLevel, recommendations } = results;

    const getReadinessColor = () => {
      switch (readinessLevel) {
        case "Excellent": return "from-green-500 to-emerald-500";
        case "High": return "from-blue-500 to-cyan-500";
        case "Medium": return "from-yellow-500 to-orange-500";
        case "Low": return "from-red-500 to-pink-500";
      }
    };

    return (
      <div className="min-h-screen bg-background pt-24 pb-8 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Bot Avatar */}
            <div className="flex items-center justify-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="relative"
              >
                <div className="w-20 h-20 flex items-center justify-center shadow-2xl">
                  <img 
                    src="/Cyber-Owl_logo.png" 
                    alt="Cyber Owl AI" 
                    className="w-16 h-16 object-contain"
                  />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </motion.div>
            </div>

            {/* Results Card */}
            <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl p-8 sm:p-12">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r ${getReadinessColor()} text-white text-lg font-bold mb-6 shadow-lg`}
                >
                  <Trophy className="w-6 h-6" />
                  <span>Assessment Complete!</span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-primary bg-clip-text text-transparent"
                >
                  Your Security Readiness
                </motion.h1>
                
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl text-white/80 font-medium"
                >
                  {readinessLevel} Level - {percentage}% Ready
                </motion.p>
              </div>

              {/* Score Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mb-8"
              >
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/80 text-lg">Overall Score</span>
                    <span className="text-4xl font-bold text-white">
                      {totalScore} / {maxScore}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-4 bg-white/20" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 }}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="w-6 h-6 text-primary" />
                      <span className="font-semibold text-white text-lg">Readiness Level</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{readinessLevel}</p>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <CheckCircle2 className="w-6 h-6 text-green-400" />
                      <span className="font-semibold text-white text-lg">Completion</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{percentage}%</p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <Brain className="w-6 h-6 text-secondary" />
                  AI Recommendations
                </h2>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 flex items-start gap-4"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-sm font-bold text-white">{index + 1}</span>
                      </div>
                      <p className="text-white text-lg leading-relaxed">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => {
                      setShowResults(false);
                      setCurrentQuestionIndex(0);
                      setConversationPhase('welcome');
                      setShowQuestion(false);
                      startConversation();
                    }}
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-xl"
                  >
                    <ArrowLeft className="mr-2 w-4 h-4" />
                    Review Answers
                  </Button>
                  <Button
                    onClick={onComplete}
                    variant="outline"
                    className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-xl"
                  >
                    Back to Menu
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
                <Button
                  onClick={() => navigate('/contact')}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Book Consultation with Expert
                </Button>
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-background pt-24 pb-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Bot Avatar */}
        <div className="flex items-center justify-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative"
          >
            <div className="w-16 h-16 flex items-center justify-center shadow-2xl">
              <img 
                src="/Cyber-Owl_logo.png" 
                alt="Cyber Owl AI" 
                className="w-12 h-12 object-contain"
              />
            </div>
            {isTyping && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center"
              >
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="backdrop-blur-xl bg-card/50 border border-border rounded-3xl p-8 mb-8 shadow-2xl"
        >
          {/* Bot Message */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
              <img 
                src="/Cyber-Owl_logo.png" 
                alt="Cyber Owl AI" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div className="flex-1">
              <div className="backdrop-blur-xl bg-card/30 border border-border rounded-2xl p-4">
                <p className="text-foreground text-lg leading-relaxed">
                  {displayedText}
                  {isTyping && (
                    <motion.span
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="ml-1"
                    >
                      |
                    </motion.span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Question Display */}
          {showQuestion && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-card/30 border border-border rounded-2xl p-6"
            >
              {/* Progress Indicator */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                    <span className="text-sm font-bold text-white">{currentQuestionIndex + 1}</span>
                  </div>
                  <div className="text-muted-foreground text-sm">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                </div>
                <div className="text-muted-foreground text-sm">
                  {Math.round(progress)}% Complete
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {Array.from({ length: questions.length }).map((_, index) => {
                    const isCompleted = index < currentQuestionIndex;
                    const isCurrent = index === currentQuestionIndex;
                    
                    return (
                      <div
                        key={index}
                        className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                          isCompleted
                            ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                            : isCurrent
                            ? 'bg-gradient-to-r from-primary to-secondary'
                            : 'bg-muted'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Category Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-medium mb-4 shadow-lg"
              >
                <Shield className="w-4 h-4" />
                {currentQuestion.category}
              </motion.div>

              {/* Question */}
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-relaxed"
              >
                {currentQuestion.question}
              </motion.h2>

              {/* Guidance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="backdrop-blur-xl bg-card/20 border border-border rounded-2xl p-4 mb-6"
              >
                <p className="text-muted-foreground text-lg italic">
                  💡 {currentQuestion.guidance}
                </p>
              </motion.div>

              {/* Score Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground text-lg">Rate your implementation</span>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-bold text-foreground">
                      {currentQuestion.score || 0}
                    </span>
                    <span className="text-muted-foreground text-lg">/ 7</span>
                  </div>
                </div>
                
                {/* Quick Score Buttons */}
                <div className="grid grid-cols-8 gap-2 mb-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.05 }}
                      onClick={() => handleScoreChange(index)}
                      className={`p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
                        (currentQuestion.score || 0) === index
                          ? 'bg-gradient-to-r from-primary to-secondary border-primary text-white shadow-lg'
                          : 'bg-card/30 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold">{index}</div>
                        <div className="text-xs opacity-70">
                          {index === 0 ? 'Not Started' :
                           index <= 2 ? 'Partial' :
                           index <= 4 ? 'Good' :
                           index <= 6 ? 'Very Good' : 'Excellent'}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
                
                {/* Slider (Optional) */}
                <div className="opacity-60">
                  <Slider
                    value={[currentQuestion.score || 0]}
                    onValueChange={(value) => handleScoreChange(value[0])}
                    max={7}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between mt-3 text-sm text-muted-foreground">
                    <span>Not Started</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </motion.div>

            </motion.div>
          )}
        </motion.div>

        {/* Assessment Journey Overview */}
        {showQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="backdrop-blur-xl bg-card/30 border border-border rounded-3xl p-6 mb-8"
          >
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-primary" />
              Complete Assessment Journey
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { category: "Leadership & Governance", count: 4, icon: Shield },
                { category: "Access Control", count: 4, icon: Shield },
                { category: "Asset Management", count: 4, icon: Shield },
                { category: "Operations & Maintenance", count: 4, icon: Shield },
                { category: "Incident Management", count: 2, icon: Shield },
                { category: "Business Continuity", count: 2, icon: Shield }
              ].map((section, index) => {
                const completed = questions.filter(q => q.category === section.category && q.score > 0).length;
                const total = section.count;
                const isActive = questions[currentQuestionIndex]?.category === section.category;
                
                return (
                  <motion.div
                    key={section.category}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className={`backdrop-blur-xl border rounded-2xl p-4 transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/50' 
                        : 'bg-card/20 border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <section.icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {section.category}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{completed}/{total}</span>
                      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                          style={{ width: `${(completed / total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Navigation - Only Previous Button */}
        {showQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center"
          >
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="bg-card/50 border-border text-foreground hover:bg-card/80 backdrop-blur-xl px-8"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Previous Question
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
