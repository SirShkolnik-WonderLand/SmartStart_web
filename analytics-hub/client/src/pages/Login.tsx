/**
 * LOGIN PAGE
 * Beautiful animated login with neumorphic design
 */

import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, BarChart3, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDashboardStore } from '@/store/dashboardStore';
import { authApi } from '@/services/api';
import toast, { Toaster } from 'react-hot-toast';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.xl};
  position: relative;
  overflow: hidden;
  
  /* Animated background gradient */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: ${({ theme }) => theme.gradients.cosmic};
    opacity: 0.03;
    animation: rotate 30s linear infinite;
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoginCard = styled(motion.div)`
  width: 100%;
  max-width: 440px;
  padding: ${({ theme }) => theme.spacing.xxxl};
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  box-shadow: ${({ theme }) => theme.shadows.neumorphic};
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.xl};
  }
`;

const LogoSection = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xxxl};
`;

const LogoIcon = styled(motion.div)`
  width: 80px;
  height: 80px;
  margin: 0 auto ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  background: ${({ theme }) => theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.glow};
  
  svg {
    width: 40px;
    height: 40px;
    color: white;
  }
`;

const Title = styled(motion.h1)`
  font-size: ${({ theme }) => theme.typography.h2};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.gradients.cosmic};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled(motion.p)`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.body};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xxl};
`;

const InputGroup = styled(motion.div)`
  position: relative;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.typography.small};
  font-weight: 600;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textMuted};
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md}
    ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xxxl};
  background: ${({ theme }) => theme.colors.card};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.typography.body};
  box-shadow: ${({ theme }) => theme.shadows.neumorphicInset};
  transition: all ${({ theme }) => theme.transitions.normal};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: ${({ theme }) => theme.shadows.glow};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const ErrorMessage = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.errorLight}15;
  border: 1px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.small};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }
`;

const LoginButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.typography.body};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
`;

const Footer = styled(motion.div)`
  margin-top: ${({ theme }) => theme.spacing.xl};
  text-align: center;
  font-size: ${({ theme }) => theme.typography.small};
  color: ${({ theme }) => theme.colors.textMuted};
`;

export function Login() {
  const navigate = useNavigate();
  const setUser = useDashboardStore((state) => state.setUser);
  const setToken = useDashboardStore((state) => state.setToken);
  const setAuth = useDashboardStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Debug logging
    console.log('Form submitted with:', { email, password });

    try {
      const response = await authApi.login(email, password);

      if (response.success && response.token && response.user) {
        console.log('Login successful, setting token and user:', { token: response.token, user: response.user });
        setAuth(response.user, response.token);
        toast.success('Welcome back! 🎉');
        console.log('Navigating to dashboard...');
        navigate('/');
      } else {
        console.log('Login failed:', response);
        setError(response.message || 'Login failed');
      }
    } catch (err: any) {
      console.log('Login API error:', err);
      const errorMsg = err.response?.data?.error || 'An error occurred. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <Toaster position="top-right" />
      
      <LoginCard
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
      >
        <LogoSection>
          <LogoIcon
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
          >
            <BarChart3 />
          </LogoIcon>
          
          <Title
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Analytics Hub
          </Title>
          
          <Subtitle
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Sign in to access your dashboard
          </Subtitle>
        </LogoSection>

        <Form onSubmit={handleSubmit}>
          {error && (
            <ErrorMessage
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle />
              {error}
            </ErrorMessage>
          )}

          <InputGroup
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <InputLabel htmlFor="email">Email Address</InputLabel>
            <InputWrapper>
              <InputIcon>
                <Mail />
              </InputIcon>
              <Input
                id="email"
                type="email"
                placeholder="udi@alicesolutions.com"
                value={email}
                onChange={(e) => {
                  console.log('Email changed:', e.target.value);
                  setEmail(e.target.value);
                }}
                required
                autoFocus
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <InputLabel htmlFor="password">Password</InputLabel>
            <InputWrapper>
              <InputIcon>
                <Lock />
              </InputIcon>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  console.log('Password changed:', e.target.value);
                  setPassword(e.target.value);
                }}
                required
              />
            </InputWrapper>
          </InputGroup>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <LoginButton
              type="submit"
              $variant="primary"
              $size="lg"
              $fullWidth
              $loading={loading}
              disabled={loading}
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <RefreshCw size={18} />
                  </motion.div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </LoginButton>
          </motion.div>
        </Form>

        <Footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          Secured with enterprise-grade encryption
        </Footer>
      </LoginCard>
    </LoginContainer>
  );
}
