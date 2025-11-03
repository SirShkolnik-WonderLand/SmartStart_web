import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Shield,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

type AuthStep = "email" | "setup" | "verify" | "backup" | "verified";

interface AuthGateProps {
  onAuthenticated: (session: any, userId: string) => void;
}

export default function AuthGate({ onAuthenticated }: AuthGateProps) {
  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [session, setSession] = useState<any>(null);

  // Check if user exists on mount
  useEffect(() => {
    const storedSession = localStorage.getItem("iso_auth_session");
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        if (parsed.expiresAt > Date.now()) {
          // Session still valid
          setSession(parsed);
          setStep("verified");
          onAuthenticated(parsed, parsed.userId);
          return;
        }
      } catch (error) {
        // Invalid session, continue with auth
      }
    }
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // Check if user exists
      const checkRes = await fetch(`/api/auth/check-user?email=${encodeURIComponent(email)}`);
      const checkData = await checkRes.json();

      if (checkData.exists && checkData.hasSecret && checkData.secretBackedUp) {
        // Existing user with secret - go to verify
        setUserId(checkData.userId);
        setStep("verify");
      } else {
        // New user OR existing user without secret - initialize TOTP
        const initRes = await fetch("/api/auth/init-totp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });

        if (!initRes.ok) {
          const error = await initRes.json();
          // If user exists but needs re-setup, allow it
          if (error.error && error.error.includes("already registered")) {
            // User exists with secret, try verify instead
            if (checkData.exists) {
              setUserId(checkData.userId);
              setStep("verify");
              return;
            }
          }
          throw new Error(error.error || "Failed to initialize authentication");
        }

        const data = await initRes.json();
        setUserId(data.userId);
        setQrCodeUrl(data.qrCodeUrl);
        setSecret(data.secret);
        setStep("setup");
        
        if (checkData.exists) {
          toast.info("Re-setting up 2FA for your account");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to start authentication");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    // Clean token (remove spaces, ensure it's numeric)
    const cleanToken = token.replace(/\s/g, '').slice(0, 6);
    
    if (!cleanToken || cleanToken.length !== 6 || !/^\d+$/.test(cleanToken)) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      console.log(`[AUTH] Verifying code for userId: ${userId}, token: ${cleanToken}`);
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token: cleanToken }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        console.error(`[AUTH] Verification failed:`, responseData);
        throw new Error(responseData.error || responseData.hint || "Invalid verification code");
      }

      console.log(`[AUTH] Verification successful:`, responseData);
      setSession(responseData.session);
      localStorage.setItem("iso_auth_session", JSON.stringify(responseData.session));
      
      // If user hasn't backed up secret, show backup step
      if (step === "setup") {
        setStep("backup");
      } else {
        setStep("verified");
        onAuthenticated(responseData.session, userId!);
      }
    } catch (error: any) {
      console.error(`[AUTH] Verification error:`, error);
      toast.error(error.message || "Verification failed. Please check your code and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBackup = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/confirm-backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!res.ok) {
        throw new Error("Failed to confirm backup");
      }

      setStep("verified");
      onAuthenticated(session, userId!);
    } catch (error: any) {
      toast.error(error.message || "Failed to confirm backup");
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      toast.success("Secret copied to clipboard");
    }
  };

  return (
    <div className="iso-container min-h-screen pt-24 pb-8 px-4 sm:px-6 md:px-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <AnimatePresence mode="wait">
          {step === "email" && (
            <motion.div
              key="email"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="iso-card">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Secure Authentication Required</h2>
                    <p className="text-muted-foreground">
                      Full Assessment requires two-factor authentication for security
                    </p>
                  </div>

                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        disabled={loading}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "setup" && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="iso-card">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Setup Authenticator App</h2>
                    <p className="text-muted-foreground">
                      Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </p>
                  </div>

                  {qrCodeUrl && (
                    <div className="mb-6 flex justify-center">
                      <img src={qrCodeUrl} alt="QR Code" className="border-2 border-border rounded-lg p-4 bg-white" />
                    </div>
                  )}

                  <div className="mb-6">
                    <Label>Manual Entry Code (if QR doesn't work)</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type={showSecret ? "text" : "password"}
                        value={secret || ""}
                        readOnly
                        className="font-mono"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowSecret(!showSecret)}
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={copySecret}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <form onSubmit={handleVerifyCode}>
                      <div>
                        <Label htmlFor="token">Enter 6-digit code</Label>
                        <Input
                          id="token"
                          type="text"
                          value={token}
                          onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="text-center text-2xl tracking-widest"
                          required
                          disabled={loading}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full mt-4"
                        disabled={loading || token.length !== 6}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            Verify Code
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "verify" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="iso-card">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Smartphone className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Enter Verification Code</h2>
                    <p className="text-muted-foreground">
                      Open your authenticator app and enter the 6-digit code
                    </p>
                  </div>

                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div>
                      <Label htmlFor="token">6-digit code</Label>
                      <Input
                        id="token"
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-2xl tracking-widest"
                        required
                        disabled={loading}
                        autoFocus
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loading || token.length !== 6}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify & Continue
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "backup" && (
            <motion.div
              key="backup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="iso-card">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Backup Your Secret</h2>
                    <p className="text-muted-foreground">
                      Make sure you've saved your authenticator secret in a safe place
                    </p>
                  </div>

                  <div className="bg-muted p-4 rounded-lg mb-6">
                    <p className="text-sm text-muted-foreground">
                      <strong>Important:</strong> If you lose access to your authenticator app, you'll need this secret to recover access.
                      Store it securely (password manager, safe, etc.).
                    </p>
                  </div>

                  <Button
                    onClick={handleConfirmBackup}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Confirming...
                      </>
                    ) : (
                      <>
                        I've Backed Up My Secret
                        <CheckCircle2 className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "verified" && (
            <motion.div
              key="verified"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="iso-card border-primary">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Authentication Successful</h2>
                  <p className="text-muted-foreground">Redirecting to Full Assessment...</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

