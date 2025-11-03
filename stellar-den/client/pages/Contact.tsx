import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import StructuredData from "@/components/StructuredData";
import {
  Mail,
  MapPin,
  Phone,
  Send,
  CheckCircle2,
  Clock,
  MessageSquare,
  Briefcase,
  Linkedin,
  Github,
  Twitter,
  Loader2,
  AlertCircle
} from "lucide-react";
import { captureLeadSource } from "@/lib/leadSource";

export default function Contact() {
  const { isCollapsed } = useSidebar();
  const pageUrl = 'https://alicesolutionsgroup.com/contact';
  const pageTitle = 'Contact Us - Toronto Cybersecurity & Automation Experts | AliceSolutionsGroup';
  const pageDescription = 'Contact AliceSolutionsGroup Toronto for cybersecurity, ISO 27001 compliance, automation, and AI services. Serving GTA and Ontario businesses. Get a free consultation today.';
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    service: "",
    message: "",
    // Enhanced fields
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
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  // Auto-capture lead source data on mount
  useEffect(() => {
    captureLeadSource().then(data => {
      setLeadSource({
        pageUrl: data.pageUrl,
        referrer: data.referrer,
        timestamp: data.timestamp
      });
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch('/api/zoho/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...leadSource,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send');
      }

      const data = await response.json();
      if (!data?.success) {
        throw new Error('Failed to send');
      }

      setSubmitStatus('success');
      setFormData({ 
        name: '', 
        email: '', 
        company: '', 
        phone: '', 
        service: '', 
        message: '',
        mailingList: false,
        budget: '',
        timeline: '',
        companySize: '',
        industry: '',
        howDidYouHear: '',
        privacyConsent: false,
        dataProcessingConsent: false
      });
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (err) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      content: "udi.shkolnik@alicesolutionsgroup.com",
      link: "mailto:udi.shkolnik@alicesolutionsgroup.com",
      description: "Send us an email anytime"
    },
    {
      icon: MapPin,
      title: "Location",
      content: "Toronto, Ontario, Canada",
      link: null,
      description: "Serving GTA and beyond"
    },
    {
      icon: Phone,
      title: "Phone",
      content: "Available upon request",
      link: null,
      description: "Contact via email first"
    },
    {
      icon: Clock,
      title: "Response Time",
      content: "24-48 hours",
      link: null,
      description: "We'll get back to you quickly"
    }
  ];

  const services = [
    "Cybersecurity & Compliance",
    "Automation & AI",
    "Advisory & Audits",
    "SmartStart Ecosystem",
    "Other"
  ];

  // ContactPage Schema
  const contactPageSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact AliceSolutionsGroup",
    "description": "Contact page for AliceSolutionsGroup Toronto cybersecurity and automation services",
    "mainEntity": {
      "@type": "Organization",
      "name": "AliceSolutionsGroup",
      "alternateName": "AliceSolutionsGroup Toronto",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Toronto",
        "addressRegion": "ON",
        "addressCountry": "CA"
      },
      "email": "udi.shkolnik@alicesolutionsgroup.com",
      "areaServed": {
        "@type": "City",
        "name": "Toronto"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="contact cybersecurity Toronto, ISO 27001 consultation GTA, CISO services Ontario, automation consulting Toronto, contact AliceSolutionsGroup, cybersecurity expert Toronto" />
        <meta name="author" content="AliceSolutionsGroup" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={pageUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content="https://alicesolutionsgroup.com/logos/AliceSolutionsGroup-logo-compact.svg" />
        <meta property="og:site_name" content="AliceSolutionsGroup" />
        <meta property="og:locale" content="en_CA" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={pageUrl} />
        <meta property="twitter:title" content={pageTitle} />
        <meta property="twitter:description" content={pageDescription} />
        <meta property="twitter:image" content="https://alicesolutionsgroup.com/logos/AliceSolutionsGroup-logo-compact.svg" />
        
        {/* Geographic */}
        <meta name="geo.region" content="CA-ON" />
        <meta name="geo.placename" content="Toronto" />
        <meta name="geo.position" content="43.6532;-79.3832" />
        <meta name="ICBM" content="43.6532, -79.3832" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(contactPageSchema)}
        </script>
      </Helmet>
      <StructuredData 
        type="page"
        title={pageTitle}
        description={pageDescription}
        url={pageUrl}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" }
        ]}
      />
      <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-20 ml-0 md:ml-72 ml-0'} md:pt-0 pt-20`}>
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 px-4 sm:px-6 md:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <MessageSquare className="w-4 h-4" />
              <span>Get in Touch</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              <span className="block text-foreground">Ready to</span>
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Secure Your Future?
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Expert Cybersecurity. Proven Results. Ontario-Focused.
            </p>

            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
              From <strong className="text-primary">CISO-level security leadership</strong> to <strong className="text-primary">ISO audit readiness</strong>, <strong className="text-primary">automation projects</strong>, and <strong className="text-primary">training programs</strong> — let's discuss how we can help your organization grow securely and efficiently.
            </p>
          </motion.div>

          {/* Certifications Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-6xl mx-auto mb-12"
          >
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-center mb-6 text-foreground">
                  Trusted by Organizations Across Ontario
                </h3>
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="px-4 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm">
                    CISSP Certified
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-cyan-500/10 text-cyan-500 font-semibold text-sm">
                    CISM Certified
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-500 font-semibold text-sm">
                    ISO 27001 Lead Auditor
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500 font-semibold text-sm">
                    15+ Years Experience
                  </div>
                  <div className="px-4 py-2 rounded-lg bg-orange-500/10 text-orange-500 font-semibold text-sm">
                    1000+ Projects Completed
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Info Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12"
          >
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {info.title}
                    </h3>
                    {info.link ? (
                      <a
                        href={info.link}
                        className="text-sm text-primary hover:underline mb-2 block"
                      >
                        {info.content}
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-2">
                        {info.content}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {info.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-8 sm:p-12">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    Send us a Message
                  </h2>
                  <p className="text-muted-foreground">
                    Fill out the form below and we'll get back to you within 24-48 hours.
                  </p>
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
                        Message Sent Successfully!
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        We've received your message and will get back to you soon.
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
                        Error Sending Message
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Please try again or contact us directly via email.
                      </p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
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

                    {/* Email */}
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
                        placeholder="john@company.com"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company */}
                    <div>
                      <Label htmlFor="company" className="text-foreground">
                        Company
                      </Label>
                      <Input
                        id="company"
                        name="company"
                        type="text"
                        value={formData.company}
                        onChange={handleChange}
                        placeholder="Company Name"
                        className="mt-2"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone" className="text-foreground">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Service Interest */}
                  <div>
                    <Label htmlFor="service" className="text-foreground">
                      Service of Interest
                    </Label>
                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="mt-2 w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      <option value="">Select a service...</option>
                      {services.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message" className="text-foreground">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your project or question..."
                      rows={6}
                      className="mt-2 resize-none"
                    />
                  </div>

                  {/* Enhanced Fields Section */}
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">
                      Help Us Better Understand Your Needs
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Budget */}
                      <div>
                        <Label htmlFor="budget" className="text-foreground">
                          Budget Range
                        </Label>
                        <select
                          id="budget"
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          className="mt-2 w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          <option value="">Select budget range...</option>
                          <option value="Under $10K">Under $10K</option>
                          <option value="$10K - $25K">$10K - $25K</option>
                          <option value="$25K - $50K">$25K - $50K</option>
                          <option value="$50K - $100K">$50K - $100K</option>
                          <option value="$100K+">$100K+</option>
                          <option value="Not sure yet">Not sure yet</option>
                        </select>
                      </div>

                      {/* Timeline */}
                      <div>
                        <Label htmlFor="timeline" className="text-foreground">
                          Timeline
                        </Label>
                        <select
                          id="timeline"
                          name="timeline"
                          value={formData.timeline}
                          onChange={handleChange}
                          className="mt-2 w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          <option value="">Select timeline...</option>
                          <option value="Immediate (within 1 month)">Immediate (within 1 month)</option>
                          <option value="Short-term (1-3 months)">Short-term (1-3 months)</option>
                          <option value="Medium-term (3-6 months)">Medium-term (3-6 months)</option>
                          <option value="Long-term (6-12 months)">Long-term (6-12 months)</option>
                          <option value="Exploring options">Exploring options</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      {/* Company Size */}
                      <div>
                        <Label htmlFor="companySize" className="text-foreground">
                          Company Size
                        </Label>
                        <select
                          id="companySize"
                          name="companySize"
                          value={formData.companySize}
                          onChange={handleChange}
                          className="mt-2 w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          <option value="">Select company size...</option>
                          <option value="Solo/Founder">Solo/Founder</option>
                          <option value="2-10 employees">2-10 employees</option>
                          <option value="11-50 employees">11-50 employees</option>
                          <option value="51-200 employees">51-200 employees</option>
                          <option value="201-1000 employees">201-1000 employees</option>
                          <option value="1000+ employees">1000+ employees</option>
                        </select>
                      </div>

                      {/* Industry */}
                      <div>
                        <Label htmlFor="industry" className="text-foreground">
                          Industry
                        </Label>
                        <select
                          id="industry"
                          name="industry"
                          value={formData.industry}
                          onChange={handleChange}
                          className="mt-2 w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          <option value="">Select industry...</option>
                          <option value="Technology/SaaS">Technology/SaaS</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Financial Services">Financial Services</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Retail/E-commerce">Retail/E-commerce</option>
                          <option value="Professional Services">Professional Services</option>
                          <option value="Education">Education</option>
                          <option value="Government">Government</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* How Did You Hear */}
                    <div className="mt-6">
                      <Label htmlFor="howDidYouHear" className="text-foreground">
                        How did you hear about us?
                      </Label>
                      <select
                        id="howDidYouHear"
                        name="howDidYouHear"
                        value={formData.howDidYouHear}
                        onChange={handleChange}
                        className="mt-2 w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      >
                        <option value="">Select option...</option>
                        <option value="Google Search">Google Search</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Referral">Referral</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Event/Conference">Event/Conference</option>
                        <option value="Direct">Direct</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {/* Mailing List */}
                    <div className="mt-6 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="mailingList"
                        name="mailingList"
                        checked={formData.mailingList}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                      />
                      <Label htmlFor="mailingList" className="text-foreground cursor-pointer">
                        Yes, I'd like to receive updates, insights, and security tips via email
                      </Label>
                    </div>
                  </div>

                  {/* Consent Section */}
                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-foreground">
                      Privacy & Consent
                    </h3>
                    
                    <div className="space-y-4">
                      {/* Required Consent */}
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="privacyConsent"
                          name="privacyConsent"
                          required
                          className="w-4 h-4 rounded border-input text-primary focus:ring-primary mt-1"
                        />
                        <Label htmlFor="privacyConsent" className="text-foreground cursor-pointer">
                          <span className="text-red-500">*</span> I agree to the{' '}
                          <a 
                            href="/legal/privacy-policy" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline font-medium"
                          >
                            Privacy Policy
                          </a>
                          {' '}and consent to my data being processed in accordance with it.
                        </Label>
                      </div>

                      {/* Data Processing Consent */}
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id="dataProcessingConsent"
                          name="dataProcessingConsent"
                          required
                          className="w-4 h-4 rounded border-input text-primary focus:ring-primary mt-1"
                        />
                        <Label htmlFor="dataProcessingConsent" className="text-foreground cursor-pointer">
                          <span className="text-red-500">*</span> I consent to the processing of my personal data 
                          for the purpose of responding to my inquiry and improving your services. 
                          I understand I can withdraw my consent at any time.
                        </Label>
                      </div>

                      {/* Data Retention Notice */}
                      <div className="bg-muted/50 rounded-lg p-4 border border-border">
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Data Processing Notice:</strong> Your information will be 
                          used to respond to your inquiry and improve our services. We may contact you about relevant 
                          services. You can opt-out at any time. We retain your data for as long as necessary to 
                          fulfill the purposes outlined in our{' '}
                          <a 
                            href="/legal/privacy-policy" 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Privacy Policy
                          </a>
                          .
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-teal dark:shadow-glow-cyan"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    * Required fields. We respect your privacy and will never share your information.
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Connect with Us
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Follow us on social media for updates, insights, and industry news
            </p>

            <div className="flex justify-center gap-4">
              <a
                href="https://linkedin.com/in/udishkolnik"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg border border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-300 text-muted-foreground hover:text-primary group"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg border border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-300 text-muted-foreground hover:text-primary group"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-lg border border-border/50 hover:border-primary hover:bg-primary/10 transition-all duration-300 text-muted-foreground hover:text-primary group"
                aria-label="Twitter/X"
              >
                <Twitter className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Quick answers to common questions
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                question: "How quickly can you respond to my inquiry?",
                answer: "We typically respond within 24-48 hours. For urgent matters, please indicate this in your message and we'll prioritize your request."
              },
              {
                question: "Do you offer consultations?",
                answer: "Yes! We offer free initial consultations to discuss your needs and how we can help. Schedule a call through the contact form."
              },
              {
                question: "What services do you offer?",
                answer: "We offer four main services: Cybersecurity & Compliance, Automation & AI, Advisory & Audits, and the SmartStart Ecosystem. Visit our Services page for details."
              },
              {
                question: "Do you work with startups?",
                answer: "Absolutely! We specialize in helping startups and growing businesses. Our SmartStart Ecosystem is designed specifically for startups and innovators."
              },
              {
                question: "What is your pricing model?",
                answer: "Our pricing varies by service and project scope. We offer custom pricing for compliance projects, project-based pricing for automation, and membership pricing for SmartStart. Contact us for a quote."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-muted-foreground">
                      {faq.answer}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
    </>
  );
}

