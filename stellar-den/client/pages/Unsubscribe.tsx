/**
 * UNSUBSCRIBE PAGE
 * Allows users to opt-out of marketing emails (GDPR/PIPEDA/CCPA)
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import { Mail, BellOff, CheckCircle2, AlertCircle } from "lucide-react";

export default function Unsubscribe() {
  const { isCollapsed } = useSidebar();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch('/api/privacy/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe');
      }

      const data = await response.json();
      if (!data?.success) {
        throw new Error('Failed to unsubscribe');
      }

      setSubmitStatus('success');
      setEmail('');
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-20 ml-0' : 'md:ml-72 ml-0'} md:pt-0 pt-20`}>
      {/* Hero Section */}
      <section className="pt-8 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <BellOff className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-medium">Unsubscribe</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
              Unsubscribe from Emails
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              You can unsubscribe from marketing emails at any time. We respect your privacy and will remove you from our mailing list.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
              <CardContent className="p-8 md:p-12">
                {submitStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-500 mb-1">
                        Successfully Unsubscribed
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        You've been removed from our marketing email list. You may still receive 
                        important service-related emails (e.g., account updates, security notices).
                      </p>
                    </div>
                  </motion.div>
                )}

                {submitStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-500 mb-1">
                        Error Processing Request
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Please try again or contact us directly at privacy@alicesolutionsgroup.com
                      </p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="email" className="text-foreground">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter the email address you want to unsubscribe from our mailing list
                    </p>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">What happens when you unsubscribe:</strong>
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-disc">
                      <li>You'll be removed from marketing and promotional emails</li>
                      <li>You may still receive important service-related emails</li>
                      <li>You can resubscribe at any time through our contact form</li>
                      <li>Your request will be processed immediately</li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !email}
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? (
                      <>
                        <BellOff className="mr-2 w-5 h-5 animate-pulse" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <BellOff className="mr-2 w-5 h-5" />
                        Unsubscribe
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Need help? Contact us at{' '}
                    <a href="mailto:privacy@alicesolutionsgroup.com" className="text-primary hover:underline">
                      privacy@alicesolutionsgroup.com
                    </a>
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
  );
}

