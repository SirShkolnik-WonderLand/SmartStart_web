import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { captureLeadSource } from "@/lib/leadSource";

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillService?: string;
  prefillMessage?: string;
}

export default function ContactModal({ isOpen, onClose, prefillService = "", prefillMessage = "" }: ContactModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    service: prefillService,
    message: prefillMessage,
    mailingList: false,
    budget: "",
    timeline: "",
    companySize: "",
    industry: "",
    howDidYouHear: "",
    // Consent fields
    privacyConsent: false,
    dataProcessingConsent: false
  });
  
  const [leadSource, setLeadSource] = useState({
    pageUrl: "",
    referrer: "",
    timestamp: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Auto-capture lead source data when modal opens and update prefill data
  useEffect(() => {
    if (isOpen) {
      captureLeadSource().then(data => {
        setLeadSource({
          pageUrl: data.pageUrl,
          referrer: data.referrer,
          timestamp: data.timestamp
        });
      });
      // Update form data when prefill props change
      if (prefillService || prefillMessage) {
        setFormData(prev => ({
          ...prev,
          service: prefillService || prev.service,
          message: prefillMessage || prev.message
        }));
      }
    } else {
      // Reset form when modal closes
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        service: "",
        message: "",
        mailingList: false,
        budget: "",
        timeline: "",
        companySize: "",
        industry: "",
        howDidYouHear: "",
        privacyConsent: false,
        dataProcessingConsent: false
      });
    }
  }, [isOpen, prefillService, prefillMessage]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/zoho/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ...leadSource,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubmitted(true);
        // Reset after 2 seconds
        setTimeout(() => {
          setFormData({ 
            name: "", 
            email: "", 
            company: "", 
            phone: "",
            service: "",
            message: "",
            mailingList: false,
            budget: "",
            timeline: "",
            companySize: "",
            industry: "",
            howDidYouHear: "",
            privacyConsent: false,
            dataProcessingConsent: false
          });
          setIsSubmitted(false);
          onClose();
        }, 2000);
      } else {
        console.error('Contact form submission error:', data.error);
        alert('Failed to send message. Please try again or contact us directly.');
      }
    } catch (error) {
      console.error('Contact form submission failed:', error);
      alert('Failed to send message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Work With Us</DialogTitle>
          <DialogDescription>
            Tell us about your project or idea. We'd love to hear from you.
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="space-y-4 text-center py-8">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-lg font-semibold">Thank you!</h3>
            <p className="text-muted-foreground">
              We've received your message and will get back to you soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="company" className="text-sm font-medium">
                Company
              </label>
              <Input
                id="company"
                name="company"
                placeholder="Your company (optional)"
                value={formData.company}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="phone" className="text-sm font-medium">
                Phone
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="service" className="text-sm font-medium">
                Service Interest
              </label>
              <select
                id="service"
                name="service"
                value={formData.service}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select a service...</option>
                <option value="Cybersecurity & Compliance">Cybersecurity & Compliance</option>
                <option value="Automation & AI">Automation & AI</option>
                <option value="Advisory & Audits">Advisory & Audits</option>
                <option value="SmartStart Ecosystem">SmartStart Ecosystem</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                placeholder="Tell us about your project..."
                value={formData.message}
                onChange={handleChange}
                required
                className="mt-1 min-h-24"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="mailingList"
                name="mailingList"
                checked={formData.mailingList}
                onChange={handleChange}
                className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
              />
              <label htmlFor="mailingList" className="text-sm text-muted-foreground cursor-pointer">
                Subscribe to updates and insights
              </label>
            </div>

            {/* Consent Section */}
            <div className="border-t pt-4 mt-4 space-y-3">
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="privacyConsent"
                  name="privacyConsent"
                  checked={formData.privacyConsent}
                  onChange={handleChange}
                  required
                  className="w-4 h-4 rounded border-input text-primary focus:ring-primary mt-1"
                />
                <label htmlFor="privacyConsent" className="text-sm text-muted-foreground cursor-pointer">
                  <span className="text-red-500">*</span> I agree to the{' '}
                  <a href="/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
              
              <div className="flex items-start space-x-2">
                <input
                  type="checkbox"
                  id="dataProcessingConsent"
                  name="dataProcessingConsent"
                  checked={formData.dataProcessingConsent}
                  onChange={handleChange}
                  required
                  className="w-4 h-4 rounded border-input text-primary focus:ring-primary mt-1"
                />
                <label htmlFor="dataProcessingConsent" className="text-sm text-muted-foreground cursor-pointer">
                  <span className="text-red-500">*</span> I consent to data processing
                </label>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:shadow-glow-teal"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
