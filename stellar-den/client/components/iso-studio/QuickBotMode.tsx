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
  AlertCircle
} from "lucide-react";
import { StoryBotQuestion } from "@shared/iso";

interface QuickBotModeProps {
  onComplete: () => void;
}

export default function QuickBotMode({ onComplete }: QuickBotModeProps) {
  const [questions, setQuestions] = useState<StoryBotQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  // Load questions from API
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await fetch("/api/iso/story-bot-questions");
        const data = await response.json();
        setQuestions(data.questions);
      } catch (error) {
        console.error("Failed to load questions:", error);
      } finally {
        setLoading(false);
      }
    };
    loadQuestions();
  }, []);

  const handleScoreChange = (score: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].score = score;
    setQuestions(updatedQuestions);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
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
      <div className="iso-container pt-24 flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="iso-text-secondary">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
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
      <div className="iso-container pt-24 pb-8 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="iso-card p-8 sm:p-12">
              {/* Header */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${getReadinessColor()} text-white text-sm font-medium mb-4`}>
                  <Trophy className="w-4 h-4" />
                  <span>Assessment Complete</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 iso-text-primary">
                  Your Security Readiness
                </h1>
                <p className="text-lg iso-text-secondary">
                  {readinessLevel} Level - {percentage}% Ready
                </p>
              </div>

              {/* Score Display */}
              <div className="mb-8">
                <div className="iso-card p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="iso-text-secondary">Overall Score</span>
                    <span className="text-2xl font-bold iso-accent">
                      {totalScore} / {maxScore}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-3" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="iso-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 iso-accent" />
                      <span className="font-semibold iso-text-primary">Readiness Level</span>
                    </div>
                    <p className="text-2xl font-bold iso-accent">{readinessLevel}</p>
                  </div>
                  <div className="iso-card p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-5 h-5 iso-accent" />
                      <span className="font-semibold iso-text-primary">Completion</span>
                    </div>
                    <p className="text-2xl font-bold iso-accent">{percentage}%</p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="mb-8">
                <h2 className="text-xl font-bold iso-text-primary mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 iso-accent" />
                  Recommendations
                </h2>
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="iso-card p-4 flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-sm font-bold iso-accent">{index + 1}</span>
                      </div>
                      <p className="iso-text-primary">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => {
                    setShowResults(false);
                    setCurrentQuestionIndex(0);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Review Answers
                </Button>
                <Button
                  onClick={onComplete}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
                >
                  Back to Menu
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
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
    <div className="iso-container pt-24 pb-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Journey Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold iso-text-primary">
              Quick Assessment Journey
            </h2>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="iso-text-secondary">
                {currentQuestionIndex} / {questions.length} Completed
              </span>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-4">
            {Array.from({ length: questions.length }).map((_, index) => {
              const isCompleted = index < currentQuestionIndex;
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                    isCompleted
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : isCurrent
                      ? 'bg-gradient-to-r from-primary to-cyan-500'
                      : 'bg-muted'
                  }`}
                />
              );
            })}
          </div>
          
          {/* Question Counter */}
          <div className="flex items-center justify-between text-sm">
            <span className="iso-text-secondary">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="font-semibold iso-accent">
              {Math.round(progress)}% Complete
            </span>
          </div>
        </div>

        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >

          {/* Question Card */}
          <Card className="iso-card p-6 sm:p-8 mb-6">
            {/* Category Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3" />
              {currentQuestion.category}
            </div>

            {/* Question */}
            <h2 className="text-xl sm:text-2xl font-bold iso-text-primary mb-4">
              {currentQuestion.question}
            </h2>

            {/* Guidance */}
            <div className="iso-card p-4 mb-6">
              <p className="text-sm iso-text-secondary italic">
                💡 {currentQuestion.guidance}
              </p>
            </div>

            {/* Score Slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm iso-text-secondary">Score your implementation</span>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold iso-accent">
                    {currentQuestion.score || 0}
                  </span>
                  <span className="text-sm iso-text-secondary">/ 7</span>
                </div>
              </div>
              <Slider
                value={[currentQuestion.score || 0]}
                onValueChange={(value) => handleScoreChange(value[0])}
                max={7}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs iso-text-secondary">
                <span>Not Started</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Score Guide */}
            <div className="iso-card p-4">
              <p className="text-xs iso-text-secondary mb-2 font-semibold">Scoring Guide:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="iso-text-secondary">0-1: Not Started</div>
                <div className="iso-text-secondary">2-3: Partial</div>
                <div className="iso-text-secondary">4-5: Good</div>
                <div className="iso-text-secondary">6-7: Excellent</div>
              </div>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex gap-4">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90"
            >
              {currentQuestionIndex === questions.length - 1 ? "View Results" : "Next"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
