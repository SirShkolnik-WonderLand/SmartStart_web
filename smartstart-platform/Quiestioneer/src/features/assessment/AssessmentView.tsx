import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAssessmentStore } from './useAssessmentStore';
import { modeQuestions, type AssessmentMode } from './content';
import * as styles from './AssessmentView.css';

const motionConfig = {
  transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
};

export function AssessmentView() {
  const { 
    mode, 
    currentStep, 
    answers, 
    setAnswer, 
    nextStep, 
    prevStep, 
    setView 
  } = useAssessmentStore();

  const questions = modeQuestions[mode];
  const question = questions[currentStep];
  const currentAnswer = answers[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  const handleChoice = (choiceValue: number) => {
    setAnswer(currentStep, choiceValue);
    
    // Auto-advance after a short delay
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        nextStep();
      } else {
        // Last question - go to results
        setView('results');
      }
    }, 500);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      prevStep();
    } else {
      setView('hero');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      prevStep();
    }
  };

  const canGoBack = currentStep > 0;

  return (
    <div className={styles.container}>
      <div className={`${styles.header} ${styles.mobileHeader}`}>
        <button 
          className={`${styles.backButton}`}
          onClick={handleBack}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className={`${styles.progressSection} ${styles.mobileProgressSection}`}>
          <div className={styles.progressText}>
            Question {currentStep + 1} of {questions.length}
          </div>
          <div className={styles.progressBar}>
            <motion.div 
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div style={{ width: '60px' }} /> {/* Spacer for centering */}
      </div>

      <div className={`${styles.content} ${styles.mobileContent}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            className={`${styles.questionCard} ${styles.mobileQuestionCard}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={motionConfig.transition}
          >
            <div className={styles.questionNumber}>
              Question {currentStep + 1}
            </div>
            
            <div className={styles.questionCategory}>
              {question.category}
            </div>
            
            <h2 className={`${styles.questionText} ${styles.mobileQuestionText}`}>
              {question.text}
            </h2>

            <div className={`${styles.choices} ${styles.mobileChoices}`}>
              {question.choices.map((choice, index) => (
                <motion.button
                  key={index}
                  className={`
                    ${styles.choice} 
                    ${styles.mobileChoice}
                    ${currentAnswer === choice.value ? styles.choiceSelected : ''}
                  `}
                  onClick={() => handleChoice(choice.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  disabled={currentAnswer !== -1}
                >
                  {choice.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div 
          className={styles.navigation}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            className={`
              ${styles.navButton} 
              ${!canGoBack ? styles.navButtonDisabled : ''}
            `}
            onClick={handlePrev}
            disabled={!canGoBack}
          >
            Previous
          </button>

          <div className={styles.navInfo}>
            {currentAnswer !== -1 ? 'Selected ✓' : 'Choose an answer'}
          </div>

          <div style={{ width: '80px' }} /> {/* Spacer instead of Next button */}
        </motion.div>
      </div>
    </div>
  );
}