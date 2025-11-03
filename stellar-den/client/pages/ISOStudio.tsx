import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import WelcomeScreen from "@/components/iso-studio/WelcomeScreen";
import QuickBotMode from "@/components/iso-studio/QuickBotMode";
import DownloadChecklist from "@/components/iso-studio/DownloadChecklist";
import FullAssessment from "@/components/iso-studio/FullAssessment";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type JourneyType = "welcome" | "full" | "bot" | "checklist";

export default function ISOStudio() {
  const { isCollapsed } = useSidebar();
  const [currentJourney, setCurrentJourney] = useState<JourneyType>("welcome");

  const handleSelectJourney = (journey: "full" | "bot" | "checklist") => {
    setCurrentJourney(journey);
  };

  const handleBackToWelcome = () => {
    setCurrentJourney("welcome");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-20 ml-0' : 'md:ml-72 ml-0'} md:pt-0 pt-20`}>
      
      {/* Back Button */}
      <AnimatePresence>
        {currentJourney !== "welcome" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed top-24 left-4 z-50"
          >
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToWelcome}
              className="glass-effect border-primary/50 hover:border-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        {currentJourney === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <WelcomeScreen onSelectJourney={handleSelectJourney} />
          </motion.div>
        )}

        {currentJourney === "bot" && (
          <motion.div
            key="bot"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <QuickBotMode onComplete={handleBackToWelcome} />
          </motion.div>
        )}

        {currentJourney === "checklist" && (
          <motion.div
            key="checklist"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <DownloadChecklist onComplete={handleBackToWelcome} />
          </motion.div>
        )}

        {currentJourney === "full" && (
          <motion.div
            key="full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <FullAssessment onComplete={handleBackToWelcome} />
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}

