import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Bot, 
  AlertTriangle, 
  TrendingUp, 
  Shield, 
  Info, 
  X,
  Lightbulb,
  Phone
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Stats, Control, Project, AdvisorMessage } from "../../../shared/iso";

interface AdvisorBotProps {
  stats: Stats;
  controls: Control[];
  project: Project | null;
  userName: string;
}

export default function AdvisorBot({ stats, controls, project, userName }: AdvisorBotProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [currentAdvice, setCurrentAdvice] = useState<AdvisorMessage | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const hasSignificantChange = stats.readyControls > 0 || stats.partialControls > 0;
    
    if (hasSignificantChange) {
      showAdvisor();
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [stats.readyControls, stats.partialControls]);

  const showAdvisor = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    generateAdvice();
    setIsVisible(true);

    // Use requestIdleCallback for better performance
    if (window.requestIdleCallback) {
      timeoutRef.current = window.setTimeout(() => {
        window.requestIdleCallback(() => {
          setIsVisible(false);
        }, { timeout: 100 });
      }, 7000);
    } else {
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 7000);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const generateAdvice = () => {
    const advice: AdvisorMessage[] = [];

    // High priority warnings
    if (stats.readinessPercentage === 0) {
      advice.push({
        type: "warning",
        title: "🚨 Zero Controls Ready",
        message: "You haven't started implementing any ISO 27001 controls yet. This leaves your organization vulnerable to cyber attacks.",
        action: "Start with A.5.1 (Policies for information security)",
        priority: 10
      });
    }

    if (stats.missingControls > 50) {
      advice.push({
        type: "warning",
        title: "⚠️ Critical Gap Detected",
        message: `${stats.missingControls} controls are missing. Organizations with incomplete security controls face 3x higher breach risk.`,
        action: "Focus on Organizational Controls (A.5) first",
        priority: 9
      });
    }

    // Cybersecurity statistics
    if (stats.readinessPercentage < 30) {
      advice.push({
        type: "info",
        title: "📊 Recent Cyber Attack Stats",
        message: "In 2024, 68% of organizations with incomplete ISO 27001 controls experienced data breaches. Companies with full implementation reduced incidents by 87%.",
        action: "Complete your controls to reduce risk",
        priority: 8
      });
    }

    // Progress encouragement
    if (stats.readinessPercentage >= 30 && stats.readinessPercentage < 60) {
      advice.push({
        type: "success",
        title: "🎉 Great Progress!",
        message: `You've completed ${stats.readyControls} controls! You're ${stats.readinessPercentage}% ready. Keep going!`,
        action: "Focus on the next domain",
        priority: 7
      });
    }

    // Quick wins
    if (stats.partialControls > 0) {
      advice.push({
        type: "tip",
        title: "💡 Quick Win Available",
        message: `You have ${stats.partialControls} controls in progress. These are often the easiest to complete!`,
        action: "Review partial controls first",
        priority: 6
      });
    }

    // Almost there
    if (stats.readinessPercentage >= 80) {
      advice.push({
        type: "success",
        title: "🏆 Almost Certified!",
        message: `Amazing! You're ${stats.readinessPercentage}% complete. Just ${stats.missingControls} controls left!`,
        action: "Complete the remaining controls",
        priority: 5
      });
    }

    // Sort by priority and get the highest
    advice.sort((a, b) => b.priority - a.priority);
    setCurrentAdvice(advice[0] || null);
  };

  const getIcon = () => {
    if (!currentAdvice) return <Bot className="w-5 h-5" />;
    switch (currentAdvice.type) {
      case "warning": return <AlertTriangle className="w-5 h-5" />;
      case "info": return <Info className="w-5 h-5" />;
      case "success": return <Shield className="w-5 h-5" />;
      case "tip": return <Lightbulb className="w-5 h-5" />;
      default: return <Bot className="w-5 h-5" />;
    }
  };

  const getColor = () => {
    if (!currentAdvice) return "bg-primary/10 text-primary";
    switch (currentAdvice.type) {
      case "warning": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "info": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "success": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "tip": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      default: return "bg-primary/10 text-primary";
    }
  };

  return (
    <AnimatePresence>
      {isVisible && currentAdvice && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-50 max-w-md"
        >
          <Card className={`iso-card border-2 ${getColor()} shadow-lg`}>
            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${getColor()} flex items-center justify-center`}>
                    {getIcon()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold iso-text-primary">
                      Security Advisor
                    </h4>
                    <p className="text-xs iso-text-secondary">
                      {userName}'s personal assistant
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Message */}
              <div className="mb-3">
                <h5 className="text-sm font-semibold iso-text-primary mb-1">
                  {currentAdvice.title}
                </h5>
                <p className="text-xs iso-text-secondary leading-relaxed">
                  {currentAdvice.message}
                </p>
              </div>

              {/* Action */}
              {currentAdvice.action && (
                <div className="flex items-center gap-2 text-xs iso-text-secondary bg-muted/50 rounded-lg p-2 mb-3">
                  <TrendingUp className="w-3 h-3" />
                  <span>{currentAdvice.action}</span>
                </div>
              )}

              {/* Talk to Human Expert Button */}
              <Button
                onClick={() => navigate('/contact')}
                size="sm"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
              >
                <Phone className="w-3 h-3 mr-2" />
                Talk to Human Expert
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

