import { motion } from "framer-motion";
import { FileText, Scale, AlertTriangle, Shield, Users, CreditCard, Calendar } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Scale className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-medium">Terms of Service</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Please read these terms carefully before using our services.
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last Updated: December 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Effective Date: December 2024</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 p-8 md:p-12"
          >
            {/* Introduction */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <FileText className="w-6 h-6 text-primary" />
                Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to AliceSolutionsGroup. These Terms of Service ("Terms") govern your access to and use of our website, services, and platforms, including but not limited to ISO Studio, SmartStart Hub, and consulting services (collectively, the "Services").
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Services.
              </p>
            </div>

            {/* Acceptance of Terms */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing, browsing, or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, you may not access or use our Services.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms. If you are accessing our Services on behalf of a company or organization, you represent that you have the authority to bind that entity to these Terms.
              </p>
            </div>

            {/* Description of Services */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Shield className="w-6 h-6 text-primary" />
                Description of Services
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                AliceSolutionsGroup provides cybersecurity, compliance, automation, and advisory services, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong className="text-foreground">Cybersecurity & Compliance:</strong> ISO 27001 readiness, SOC 2 compliance, PHIPA/PIPEDA programs, CISO-as-a-Service</li>
                <li><strong className="text-foreground">Automation & AI:</strong> Business process automation, intelligent workflows, AI integration, BI dashboards</li>
                <li><strong className="text-foreground">Advisory & Audits:</strong> Strategic advisory, technology due diligence, security assessments, training programs</li>
                <li><strong className="text-foreground">Platform Services:</strong> ISO Studio (compliance assessment tool), SmartStart Hub (community platform)</li>
                <li><strong className="text-foreground">Community Programs:</strong> Events, mentorship, training, and networking opportunities</li>
              </ul>
            </div>

            {/* User Accounts */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                User Accounts
              </h2>
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Account Registration</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                To access certain Services, you may be required to create an account. When creating an account, you agree to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security and confidentiality of your account credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized access or security breach</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Account Termination</h3>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate your account at any time, with or without notice, if you violate these Terms or engage in any fraudulent, illegal, or harmful activities.
              </p>
            </div>

            {/* Payment Terms */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-primary" />
                Payment Terms
              </h2>
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Fees and Billing</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Certain Services may require payment of fees. By purchasing our Services, you agree to pay all applicable fees as described on our website or in your service agreement. Fees are:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Quoted in Canadian dollars (CAD) unless otherwise specified</li>
                <li>Non-refundable except as required by law or as explicitly stated in your service agreement</li>
                <li>Subject to applicable taxes</li>
                <li>Processed through secure third-party payment processors</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Subscription Services</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For subscription-based Services (e.g., SmartStart Hub membership):
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Subscriptions automatically renew unless cancelled</li>
                <li>You can cancel your subscription at any time through your account settings</li>
                <li>Cancellation takes effect at the end of your current billing period</li>
                <li>No refunds for partial billing periods</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Refund Policy</h3>
              <p className="text-muted-foreground leading-relaxed">
                Refunds are provided only in accordance with applicable laws and as explicitly stated in your service agreement. For consulting services, refunds may be available for unused portions of pre-paid engagements, subject to our discretion and applicable terms.
              </p>
            </div>

            {/* Acceptable Use */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-primary" />
                Acceptable Use Policy
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You agree to use our Services only for lawful purposes and in accordance with these Terms. You agree NOT to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Violate any applicable laws, regulations, or third-party rights</li>
                <li>Transmit any malicious code, viruses, or harmful materials</li>
                <li>Attempt to gain unauthorized access to our systems or networks</li>
                <li>Interfere with or disrupt the integrity or performance of our Services</li>
                <li>Use our Services to compete with us or develop competing services</li>
                <li>Scrape, copy, or extract data from our Services without authorization</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
                <li>Harass, abuse, or harm other users or our employees</li>
                <li>Use automated systems to access our Services without permission</li>
                <li>Reverse engineer, decompile, or disassemble our Services</li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-muted/50 rounded-lg p-6 border border-border">
                <p className="text-muted-foreground mb-2"><strong className="text-foreground">AliceSolutionsGroup</strong></p>
                <p className="text-muted-foreground mb-2">Email: <a href="mailto:legal@alicesolutionsgroup.com" className="text-primary hover:text-primary/80 underline">legal@alicesolutionsgroup.com</a></p>
                <p className="text-muted-foreground mb-2">Phone: <a href="tel:+14165551234" className="text-primary hover:text-primary/80 underline">+1 (416) 555-1234</a></p>
                <p className="text-muted-foreground">Address: Toronto, Ontario, Canada</p>
              </div>
            </div>

            {/* Privacy and Data Protection */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Privacy and Data Protection</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Your privacy is important to us. By using our Services, you agree to our data practices as described in our <a href="/legal/privacy-policy" className="text-primary hover:text-primary/80 underline">Privacy Policy</a>. We are committed to compliance with applicable privacy laws, including GDPR, PIPEDA, and CCPA.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you use our Services, you may be asked to provide consent for:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Cookie usage (via our cookie consent banner)</li>
                <li>Data processing (via explicit checkboxes in forms)</li>
                <li>Marketing communications (via mailing list checkboxes)</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                You can manage your privacy preferences at any time through our <a href="#" onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('openCookiePreferences')); }} className="text-primary hover:text-primary/80 underline cursor-pointer">cookie preference center</a>, <a href="/unsubscribe" className="text-primary hover:text-primary/80 underline">unsubscribe page</a>, or <a href="/data-deletion" className="text-primary hover:text-primary/80 underline">data deletion request page</a>.
              </p>
            </div>

            {/* Acknowledgment */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Acknowledgment</h3>
              <p className="text-muted-foreground text-sm">
                By using our Services, you acknowledge that you have read these Terms, understand them, and agree to be bound by them. If you do not agree to these Terms, you may not use our Services.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
