import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Download, 
  FileText, 
  Mail,
  CheckCircle2,
  Send,
  ArrowLeft
} from "lucide-react";
import { Control } from "@shared/iso";

interface DownloadChecklistProps {
  onComplete: () => void;
}

export default function DownloadChecklist({ onComplete }: DownloadChecklistProps) {
  const [controls, setControls] = useState<Control[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const loadControls = async () => {
      try {
        const response = await fetch("/api/iso/controls");
        const data = await response.json();
        setControls(data.controls);
      } catch (error) {
        console.error("Failed to load controls:", error);
      } finally {
        setLoading(false);
      }
    };
    loadControls();
  }, []);

  const handleDownload = () => {
    const checklist = {
      framework: "ISO 27001:2022",
      controls: controls.map(c => ({
        code: c.code,
        title: c.title,
        description: c.description,
        checked: false
      })),
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(checklist, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `iso-27001-checklist-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    try {
      await fetch("/api/iso/send-checklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, controls })
      });
      
      setSent(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    } catch (error) {
      console.error("Failed to send checklist:", error);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="iso-container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="iso-text-secondary">Loading checklist...</p>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="iso-container flex items-center justify-center min-h-screen p-8">
        <Card className="iso-card p-8 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold iso-text-primary mb-2">
            Checklist Sent!
          </h2>
          <p className="text-sm iso-text-secondary">
            Your ISO 27001 checklist has been sent to {email}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="iso-container pt-24 pb-8 px-4 sm:px-6 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={onComplete}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold iso-text-primary">
                Download Checklist
              </h1>
              <p className="text-sm iso-text-secondary">
                Get a printable checklist of all 93 controls
              </p>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="iso-card bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold iso-text-primary mb-2">
                What You'll Get
              </h3>
              <ul className="space-y-2 text-sm iso-text-secondary">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>All 93 ISO 27001:2022 controls as a checklist</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Printable format for offline work</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>Email delivery option</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span>JSON format for easy integration</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* Download Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Direct Download */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="iso-card h-full">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold iso-text-primary mb-2">
                  Download Now
                </h3>
                <p className="text-sm iso-text-secondary mb-4">
                  Get instant access to the checklist in JSON format
                </p>
                <Button
                  onClick={handleDownload}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download JSON
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Email Delivery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="iso-card h-full">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold iso-text-primary mb-2">
                  Email Delivery
                </h3>
                <p className="text-sm iso-text-secondary mb-4">
                  Have the checklist sent directly to your inbox
                </p>
                <form onSubmit={handleSendEmail} className="space-y-3">
                  <div>
                    <Label className="text-xs font-semibold iso-text-primary mb-1 block">
                      Email Address
                    </Label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="iso-card border-primary/50"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    {sending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send Checklist
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6"
        >
          <Card className="iso-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold iso-text-primary">
                  Checklist Preview
                </h3>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {controls.slice(0, 10).map((control, index) => (
                  <div key={control.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-5 h-5 rounded border-2 border-border flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-xs font-bold iso-accent mb-1">
                        {control.code}
                      </div>
                      <div className="text-sm iso-text-primary">
                        {control.title}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-center text-sm iso-text-secondary py-2">
                  ... and {controls.length - 10} more controls
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
