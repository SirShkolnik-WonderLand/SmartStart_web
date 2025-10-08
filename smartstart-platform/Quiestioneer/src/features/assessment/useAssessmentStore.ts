import { create } from 'zustand';
import { type AssessmentMode, modeQuestions } from './content';

export type ViewType = 'hero' | 'assessment' | 'results' | 'thank-you';

interface AssessmentState {
  // Current state
  currentView: ViewType;
  mode: AssessmentMode;
  currentStep: number;
  answers: number[];
  email: string;
  company: string;
  
  // Actions
  setView: (view: ViewType) => void;
  setMode: (mode: AssessmentMode) => void;
  setCurrentStep: (step: number) => void;
  setAnswer: (step: number, answer: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setEmail: (email: string) => void;
  setCompany: (company: string) => void;
  reset: () => void;
}

export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  // Initial state
  currentView: 'hero',
  mode: 'standard',
  currentStep: 0,
  answers: [],
  email: '',
  company: '',
  
  // Actions
  setView: (view) => set({ currentView: view }),
  
  setMode: (mode) => {
    const questions = modeQuestions[mode];
    set({ 
      mode, 
      currentStep: 0, 
      answers: new Array(questions.length).fill(-1) 
    });
  },
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  setAnswer: (step, answer) => {
    const { answers } = get();
    const newAnswers = [...answers];
    newAnswers[step] = answer;
    set({ answers: newAnswers });
  },
  
  nextStep: () => {
    const { currentStep, mode } = get();
    const questions = modeQuestions[mode];
    if (currentStep < questions.length - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },
  
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },
  
  setEmail: (email) => set({ email }),
  
  setCompany: (company) => set({ company }),
  
  reset: () => set({
    currentView: 'hero',
    mode: 'standard',
    currentStep: 0,
    answers: [],
    email: '',
    company: '',
  }),
}));