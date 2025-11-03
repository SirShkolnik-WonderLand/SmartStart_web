/**
 * DATA DELETION REQUEST PAGE
 * Allows users to request deletion of their personal data (GDPR/PIPEDA/CCPA)
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import { Shield, Trash2, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

export default function DataDeletionRequest() {
  const { isCollapsed } = useSidebar();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    reason: "",
    confirmation: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch('/api/privacy/data-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          reason: formData.reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit request');
      }

      const data = await response.json();
      if (!data?.success) {
        throw new Error('Failed to submit request');
      }

      setSubmitStatus('success');
      setFormData({ email: '', name: '', reason: '', confirmation: false });
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
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
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-medium">Data Deletion Request</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
              Request Data Deletion
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              You have the right to request deletion of your personal data in accordance with GDPR, PIPEDA, and CCPA.
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
                {/* Info Box */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Your Rights</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Under GDPR, PIPEDA, and CCPA, you have the right to:
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                        <li>Request deletion of your personal data</li>
                        <li>Request access to your data</li>
                        <li>Request correction of inaccurate data</li>
                        <li>Withdraw consent at any time</li>
                      </ul>
                      <p className="text-sm text-muted-foreground mt-3">
                        We will process your request within 30 days as required by law.
                      </p>
                    </div>
                  </div>
                </div>

                {submitStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-green-500 mb-1">
                        Request Submitted Successfully
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        We've received your data deletion request. We'll process it within 30 days 
                        and send a confirmation email to the address you provided.
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
                        Error Submitting Request
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
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="mt-2"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      We'll use this to verify your identity and send confirmation
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="name" className="text-foreground">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="reason" className="text-foreground">
                      Reason for Deletion (Optional)
                    </Label>
                    <Textarea
                      id="reason"
                      name="reason"
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder="Please provide any additional information..."
                      rows={4}
                      className="mt-2 resize-none"
                    />
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="confirmation"
                      name="confirmation"
                      checked={formData.confirmation}
                      onChange={handleChange}
                      required
                      className="w-4 h-4 rounded border-input text-primary focus:ring-primary mt-1"
                    />
                    <Label htmlFor="confirmation" className="text-sm text-muted-foreground cursor-pointer">
                      <span className="text-red-500">*</span> I confirm that I want to delete my personal data. 
                      I understand that this action cannot be undone and may affect my ability to use certain services.
                    </Label>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 border border-border">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">What happens next:</strong>
                    </p>
                    <ol className="text-sm text-muted-foreground mt-2 space-y-1 ml-4 list-decimal">
                      <li>We'll verify your identity using the email address provided</li>
                      <li>We'll process your request within 30 days</li>
                      <li>We'll send a confirmation email once your data is deleted</li>
                      <li>Some data may be retained for legal or regulatory purposes</li>
                    </ol>
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.confirmation}
                    size="lg"
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Trash2 className="mr-2 w-5 h-5 animate-pulse" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 w-5 h-5" />
                        Submit Deletion Request
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    For questions or concerns, contact us at{' '}
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

