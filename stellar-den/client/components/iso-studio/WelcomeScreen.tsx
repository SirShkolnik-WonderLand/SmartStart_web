import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  MessageSquare, 
  Download,
  ArrowRight,
  Shield,
  Sparkles
} from "lucide-react";

interface WelcomeScreenProps {
  onSelectJourney: (journey: "full" | "bot" | "checklist") => void;
}

export default function WelcomeScreen({ onSelectJourney }: WelcomeScreenProps) {
  const journeys = [
    {
      id: "full" as const,
      title: "Full Assessment",
      subtitle: "93 Controls",
      description: "Complete control-by-control assessment with detailed guidance and evidence tracking",
      icon: FileText,
      features: ["All 93 ISO 27001 controls", "Detailed implementation guidance", "Evidence tracking", "Progress dashboard"],
      duration: "60-90 minutes",
      recommended: false
    },
    {
      id: "bot" as const,
      title: "Quick Bot Mode",
      subtitle: "20 Strategic Questions",
      description: "Interactive AI-style questionnaire to assess your security readiness quickly",
      icon: MessageSquare,
      features: ["20 strategic questions", "Real-time scoring", "Instant recommendations", "Smart insights"],
      duration: "15-20 minutes",
      recommended: true
    },
    {
      id: "checklist" as const,
      title: "Download Checklist",
      subtitle: "Simple Todo List",
      description: "Get a printable checklist of all controls to work through at your own pace",
      icon: Download,
      features: ["All 93 controls as checklist", "Email delivery", "Offline-friendly", "Printable format"],
      duration: "5 minutes",
      recommended: false
    }
  ];

  return (
    <div className="iso-container pt-24 pb-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-3">
            <Shield className="w-3 h-3" />
            <span>ISO 27001 Compliance Assessment</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            <span className="block iso-text-primary">Choose Your</span>
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent dark:from-cyan-400 dark:via-cyan-300 dark:to-cyan-500">
              Assessment Journey
            </span>
          </h1>
          
          <p className="text-sm sm:text-base iso-text-secondary max-w-xl mx-auto">
            Select the assessment method that best fits your needs and timeline
          </p>
        </motion.div>

        {/* Journey Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {journeys.map((journey, index) => {
            const Icon = journey.icon;
            return (
              <motion.div
                key={journey.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="iso-card hover:border-primary/50 hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all duration-300 h-full flex flex-col group relative overflow-hidden">
                  {/* Recommended Badge */}
                  {journey.recommended && (
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 border border-primary/50 text-primary text-xs font-semibold">
                        <Sparkles className="w-3 h-3" />
                        <span>Recommended</span>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-5 sm:p-6 flex flex-col flex-1 relative z-10">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg sm:text-xl font-bold mb-1 iso-text-primary">
                      {journey.title}
                    </h3>

                    {/* Subtitle */}
                    <p className="text-xs iso-text-secondary mb-3">
                      {journey.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-xs sm:text-sm iso-text-secondary mb-4 flex-1 leading-relaxed">
                      {journey.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-1.5 mb-4">
                      {journey.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs iso-text-secondary">
                          <div className="w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Duration */}
                    <div className="text-xs iso-text-secondary mb-3 flex items-center gap-1">
                      <span>⏱️</span>
                      <span>Est. {journey.duration}</span>
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => onSelectJourney(journey.id)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-glow-teal dark:shadow-glow-cyan"
                      size="default"
                    >
                      Start Assessment
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center"
        >
          <Card className="iso-card border-primary/20 bg-primary/5 dark:bg-primary/10">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-3 iso-text-primary">
                Why Assess Your Security?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-xl mb-1">🎯</div>
                  <p className="font-semibold mb-1 text-xs iso-text-primary">Identify Gaps</p>
                  <p className="text-xs iso-text-secondary">Find vulnerabilities before attackers do</p>
                </div>
                <div>
                  <div className="text-xl mb-1">📈</div>
                  <p className="font-semibold mb-1 text-xs iso-text-primary">Measure Progress</p>
                  <p className="text-xs iso-text-secondary">Track your security maturity over time</p>
                </div>
                <div>
                  <div className="text-xl mb-1">✅</div>
                  <p className="font-semibold mb-1 text-xs iso-text-primary">Achieve Compliance</p>
                  <p className="text-xs iso-text-secondary">Meet ISO 27001 requirements systematically</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

