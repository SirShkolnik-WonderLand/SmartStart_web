import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Building } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AliceSolutionGroup } from './AliceSolutionGroup';
import * as styles from './EmailModal.css';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  company: z.string().optional(),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmailFormData) => void;
}

export function EmailModal({ isOpen, onClose, onSubmit }: EmailModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const handleFormSubmit = async (data: EmailFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className={`${styles.modal} ${styles.mobileModal}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className={`${styles.closeButton}`}
              onClick={handleClose}
            >
              <X size={20} />
            </button>

            <div className={styles.header}>
              <div style={{ marginBottom: '16px' }}>
                <AliceSolutionGroup variant="full" size="md" />
              </div>
              <h2 className={styles.title}>Get Your Full Report</h2>
              <p className={styles.description}>
                Enter your details to receive a comprehensive PDF report with detailed 
                implementation guidance for your top security fixes.
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">
                  <Mail size={16} style={{ marginRight: '8px', display: 'inline' }} />
                  Email Address *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  placeholder="your@company.com"
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <div className={styles.errorMessage}>{errors.email.message}</div>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="company">
                  <Building size={16} style={{ marginRight: '8px', display: 'inline' }} />
                  Company Name (Optional)
                </label>
                <input
                  {...register('company')}
                  type="text"
                  id="company"
                  placeholder="Your Company Inc."
                  className={`${styles.input}`}
                  disabled={isSubmitting}
                />
              </div>

              <div className={`${styles.buttonGroup} ${styles.mobileButtonGroup}`}>
                <button
                  type="button"
                  className={`${styles.button} ${styles.secondaryButton}`}
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.button} ${styles.primaryButton} ${isSubmitting ? styles.buttonDisabled : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Generating...' : 'Get My Report'}
                </button>
              </div>
            </form>

            <div className={styles.privacy}>
              <strong>Privacy Promise:</strong> We store your email and answers for 90 days to generate your PDF and follow up once. We do not sell data. Unsubscribe anytime.
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}