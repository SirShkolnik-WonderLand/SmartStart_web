import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssessmentStore } from './features/assessment/useAssessmentStore';
import { HeroView } from './features/assessment/HeroView';
import { AssessmentView } from './features/assessment/AssessmentView';
import { ResultView } from './features/assessment/ResultView';
import { ThankYouView } from './features/assessment/ThankYouView';
import { EmailModal } from './components/EmailModal';
import { calculateScore } from './features/assessment/ScoreEngine';

export default function App() {
  const { currentView, mode, answers, email, company, setEmail, setCompany, setView } = useAssessmentStore();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleEmailSubmit = async (data: { email: string; company?: string }) => {
    setEmail(data.email);
    if (data.company) {
      setCompany(data.company);
    }
    
    // In a real app, this would call the backend API to generate the PDF
    // For now, we'll just simulate the process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsEmailModalOpen(false);
    setView('thank-you');
  };

  const handleDownloadPDF = () => {
    setIsEmailModalOpen(true);
  };

  const renderView = () => {
    switch (currentView) {
      case 'hero':
        return <HeroView />;
      case 'assessment':
        return <AssessmentView />;
      case 'results':
        return (
          <>
            <ResultView />
            <EmailModal
              isOpen={isEmailModalOpen}
              onClose={() => setIsEmailModalOpen(false)}
              onSubmit={handleEmailSubmit}
            />
          </>
        );
      case 'thank-you':
        return <ThankYouView />;
      default:
        return <HeroView />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0b0f14' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}