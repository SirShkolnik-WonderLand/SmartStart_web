import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, Mail, Calendar } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
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
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-medium">Privacy Policy</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last Updated: October 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Effective Date: October 2024</span>
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
                AliceSolutionsGroup ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services, including our ISO Studio, SmartStart Hub, and other digital platforms.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                By using our website and services, you consent to the data practices described in this policy. If you do not agree with the practices described in this policy, please do not use our website or services.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Eye className="w-6 h-6 text-primary" />
                Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Personal Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may collect personal information that you voluntarily provide to us when you:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Register for our services or create an account</li>
                <li>Use our ISO Studio or SmartStart Hub platforms</li>
                <li>Subscribe to our newsletter or marketing communications</li>
                <li>Contact us through our contact forms or email</li>
                <li>Book consultations or request information about our services</li>
                <li>Participate in surveys, events, or community programs</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Types of Personal Information</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong className="text-foreground">Contact Information:</strong> Name, email address, phone number, company name, job title</li>
                <li><strong className="text-foreground">Account Information:</strong> Username, password, profile information</li>
                <li><strong className="text-foreground">Business Information:</strong> Company size, industry, business needs, project requirements</li>
                <li><strong className="text-foreground">Payment Information:</strong> Billing address, payment card details (processed securely by third-party providers)</li>
                <li><strong className="text-foreground">Communication Data:</strong> Messages, inquiries, feedback, and correspondence</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Automatically Collected Information</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                When you visit our website, we may automatically collect certain information about your device and browsing behavior:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong className="text-foreground">Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong className="text-foreground">Usage Data:</strong> Pages visited, time spent on pages, click patterns, referring URLs</li>
                <li><strong className="text-foreground">Cookies and Tracking Technologies:</strong> See our Cookie Policy for details</li>
                <li><strong className="text-foreground">Analytics Data:</strong> Aggregated data about website usage and performance</li>
              </ul>
            </div>

            {/* How We Use Your Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Lock className="w-6 h-6 text-primary" />
                How We Use Your Information
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the information we collect for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong className="text-foreground">Service Delivery:</strong> To provide, maintain, and improve our services, including ISO Studio, SmartStart Hub, and consulting services</li>
                <li><strong className="text-foreground">Communication:</strong> To respond to your inquiries, provide customer support, and send you important updates about our services</li>
                <li><strong className="text-foreground">Account Management:</strong> To create and manage your account, process transactions, and maintain your preferences</li>
                <li><strong className="text-foreground">Marketing:</strong> To send you promotional materials, newsletters, and information about our services (with your consent)</li>
                <li><strong className="text-foreground">Analytics:</strong> To analyze website usage, improve user experience, and optimize our services</li>
                <li><strong className="text-foreground">Security:</strong> To detect, prevent, and address technical issues, fraud, and security threats</li>
                <li><strong className="text-foreground">Legal Compliance:</strong> To comply with applicable laws, regulations, and legal processes</li>
                <li><strong className="text-foreground">Business Operations:</strong> To manage our business operations, conduct research, and develop new services</li>
              </ul>
            </div>

            {/* Information Sharing */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Information Sharing and Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
              </p>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Service Providers</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may share your information with third-party service providers who perform services on our behalf, such as:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Payment processors (e.g., Stripe, PayPal)</li>
                <li>Cloud hosting providers (e.g., AWS, Google Cloud)</li>
                <li>Analytics providers (e.g., Google Analytics)</li>
                <li>Email service providers (e.g., Zoho Mail)</li>
                <li>Customer support platforms</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Legal Requirements</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We may disclose your information if required by law or in response to valid legal requests, such as:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Court orders, subpoenas, or legal processes</li>
                <li>Government agencies or regulatory bodies</li>
                <li>To protect our rights, property, or safety</li>
                <li>To prevent fraud or security threats</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Business Transfers</h3>
              <p className="text-muted-foreground leading-relaxed">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity. We will notify you of any such transfer and provide you with choices about your information.
              </p>
            </div>

            {/* Data Security */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Data Security</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and vulnerability testing</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure data storage and backup procedures</li>
                <li>Employee training on data protection and privacy</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </div>

            {/* Your Rights */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Your Privacy Rights</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Depending on your location, you may have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong className="text-foreground">Access:</strong> Request access to your personal information</li>
                <li><strong className="text-foreground">Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong className="text-foreground">Deletion:</strong> Request deletion of your personal information</li>
                <li><strong className="text-foreground">Portability:</strong> Request transfer of your information to another service</li>
                <li><strong className="text-foreground">Opt-Out:</strong> Unsubscribe from marketing communications</li>
                <li><strong className="text-foreground">Objection:</strong> Object to certain processing activities</li>
                <li><strong className="text-foreground">Restriction:</strong> Request restriction of processing</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                To exercise these rights, please contact us at <a href="mailto:privacy@alicesolutionsgroup.com" className="text-primary hover:text-primary/80 underline">privacy@alicesolutionsgroup.com</a>.
              </p>
            </div>

            {/* Data Retention */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need your information, we will securely delete or anonymize it.
              </p>
            </div>

            {/* International Data Transfers */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws than your country. We take appropriate measures to ensure that your information receives an adequate level of protection in accordance with applicable data protection laws.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately, and we will take steps to delete that information.
              </p>
            </div>

            {/* Updates to Privacy Policy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Updates to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated policy on our website and updating the "Last Updated" date. We encourage you to review this policy periodically.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-muted/50 rounded-lg p-6 border border-border">
                <p className="text-muted-foreground mb-2"><strong className="text-foreground">AliceSolutionsGroup</strong></p>
                <p className="text-muted-foreground mb-2">Email: <a href="mailto:privacy@alicesolutionsgroup.com" className="text-primary hover:text-primary/80 underline">privacy@alicesolutionsgroup.com</a></p>
                <p className="text-muted-foreground mb-2">Phone: <a href="tel:+14165551234" className="text-primary hover:text-primary/80 underline">+1 (416) 555-1234</a></p>
                <p className="text-muted-foreground">Address: Toronto, Ontario, Canada</p>
              </div>
            </div>

            {/* Compliance */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3">Compliance</h3>
              <p className="text-muted-foreground text-sm">
                This Privacy Policy is designed to comply with applicable data protection laws, including:
              </p>
              <ul className="list-disc list-inside text-muted-foreground text-sm mt-3 space-y-1 ml-4">
                <li>Canada's Personal Information Protection and Electronic Documents Act (PIPEDA)</li>
                <li>Ontario's Personal Health Information Protection Act (PHIPA)</li>
                <li>European Union's General Data Protection Regulation (GDPR)</li>
                <li>California Consumer Privacy Act (CCPA)</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
