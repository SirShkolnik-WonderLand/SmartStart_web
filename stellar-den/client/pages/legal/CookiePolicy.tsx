import { motion } from "framer-motion";
import { Cookie, Settings, BarChart, Shield, Calendar, Info } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br bg-background">
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Cookie className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-medium">Cookie Policy</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent">
              Cookie Policy
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Learn how we use cookies and similar technologies to improve your experience.
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last Updated: October 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4" />
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
                <Cookie className="w-6 h-6 text-primary" />
                Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                This Cookie Policy explains how AliceSolutionsGroup ("we," "our," or "us") uses cookies and similar tracking technologies when you visit our website or use our services. This policy should be read in conjunction with our Privacy Policy.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                By using our website, you consent to the use of cookies in accordance with this policy. If you do not agree with our use of cookies, you can disable them through your browser settings or use our cookie preference center.
              </p>
            </div>

            {/* What Are Cookies */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">What Are Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Cookies can be "persistent" or "session" cookies:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
                <li><strong>Persistent Cookies:</strong> Remain on your device for a set period or until you delete them. They are activated each time you visit the website that created them.</li>
                <li><strong>Session Cookies:</strong> Temporary cookies that are deleted when you close your browser. They allow the website to recognize you as you navigate between pages.</li>
              </ul>
            </div>

            {/* Types of Cookies We Use */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <Settings className="w-6 h-6 text-primary" />
                Types of Cookies We Use
              </h2>
              
              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Essential Cookies</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt out of these cookies.
              </p>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-muted-foreground text-sm"><strong className="text-foreground">Examples:</strong></p>
                <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1 ml-4">
                  <li>Authentication and login cookies</li>
                  <li>Security and fraud prevention cookies</li>
                  <li>Load balancing cookies</li>
                  <li>Cookie consent preference cookies</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Analytics Cookies</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. We use this information to improve our website and services.
              </p>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-muted-foreground text-sm"><strong className="text-foreground">Examples:</strong></p>
                <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1 ml-4">
                  <li>Google Analytics cookies (track page views, user behavior)</li>
                  <li>Session duration and bounce rate tracking</li>
                  <li>Traffic source analysis</li>
                  <li>User journey mapping</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Functional Cookies</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings. They may be set by us or by third-party providers whose services we use.
              </p>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-muted-foreground text-sm"><strong className="text-foreground">Examples:</strong></p>
                <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1 ml-4">
                  <li>Language and region preferences</li>
                  <li>Theme and display preferences</li>
                  <li>User interface customization</li>
                  <li>Remembering form data</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Targeting/Advertising Cookies</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                These cookies may be set through our website by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant advertisements on other websites.
              </p>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <p className="text-muted-foreground text-sm"><strong className="text-foreground">Examples:</strong></p>
                <ul className="list-disc list-inside text-muted-foreground text-sm mt-2 space-y-1 ml-4">
                  <li>Social media platform cookies (LinkedIn, Twitter)</li>
                  <li>Advertising network cookies</li>
                  <li>Retargeting and remarketing cookies</li>
                </ul>
              </div>
            </div>

            {/* Third-Party Cookies */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Third-Party Cookies</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and provide enhanced functionality. These third parties may include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Google Analytics:</strong> Web analytics service to understand how visitors use our website</li>
                <li><strong>Google Tag Manager:</strong> Tag management system for tracking and marketing</li>
                <li><strong>Social Media Platforms:</strong> LinkedIn, Twitter, Facebook for social sharing and tracking</li>
                <li><strong>Payment Processors:</strong> Stripe, PayPal for secure payment processing</li>
                <li><strong>Cloud Services:</strong> AWS, Google Cloud for hosting and infrastructure</li>
                <li><strong>Email Services:</strong> Zoho Mail for email marketing and communications</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                These third parties may use cookies to collect information about your online activities across different websites. We do not control these cookies. Please refer to the privacy policies of these third parties for more information.
              </p>
            </div>

            {/* How We Use Cookies */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <BarChart className="w-6 h-6 text-primary" />
                How We Use Cookies
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use cookies for the following purposes:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Website Functionality:</strong> To enable core website features and ensure security</li>
                <li><strong>User Experience:</strong> To remember your preferences and personalize your experience</li>
                <li><strong>Analytics:</strong> To understand how visitors use our website and improve our services</li>
                <li><strong>Marketing:</strong> To deliver relevant content and advertisements</li>
                <li><strong>Performance:</strong> To monitor website performance and identify issues</li>
                <li><strong>Security:</strong> To detect and prevent fraud, abuse, and security threats</li>
              </ul>
            </div>

            {/* Managing Cookies */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Managing Your Cookie Preferences</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You have several options for managing cookies:
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Cookie Preference Center</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You can manage your cookie preferences through our cookie preference center, which allows you to:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Accept or reject non-essential cookies</li>
                <li>Customize cookie settings by category</li>
                <li>View detailed information about each cookie type</li>
                <li>Update your preferences at any time</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Browser Settings</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Most web browsers allow you to control cookies through their settings. You can:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Block all cookies</li>
                <li>Block third-party cookies</li>
                <li>Delete cookies when you close your browser</li>
                <li>Delete existing cookies</li>
                <li>Receive notifications when cookies are set</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Please note that blocking or deleting cookies may impact your ability to use certain features of our website.
              </p>

              <h3 className="text-xl font-semibold text-foreground mt-6 mb-3">Opt-Out Tools</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                You can opt out of certain types of cookies:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-teal-300 underline">Google Analytics Opt-out Browser Add-on</a></li>
                <li><strong>Advertising:</strong> <a href="http://www.youronlinechoices.eu/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-teal-300 underline">Your Online Choices</a> or <a href="http://optout.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-teal-300 underline">NAI Opt-Out</a></li>
                <li><strong>Social Media:</strong> Manage preferences through your social media account settings</li>
              </ul>
            </div>

            {/* Cookie Duration */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Cookie Duration</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Cookies can be categorized by their duration:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Remain on your device for a set period (e.g., 30 days, 1 year) or until you delete them</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                The duration of each cookie depends on its purpose. Essential cookies typically last for the duration of your session, while analytics and advertising cookies may persist for longer periods.
              </p>
            </div>

            {/* Do Not Track */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Do Not Track Signals</h2>
              <p className="text-muted-foreground leading-relaxed">
                Some browsers include a "Do Not Track" (DNT) feature that signals to websites you visit that you do not want to have your online activity tracked. Currently, there is no industry standard for responding to DNT signals. Our website does not currently respond to DNT signals. However, you can manage your cookie preferences through our cookie preference center or your browser settings.
              </p>
            </div>

            {/* Updates to Policy */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Updates to This Cookie Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of any material changes by posting the updated policy on our website and updating the "Last Updated" date. We encourage you to review this policy periodically.
              </p>
            </div>

            {/* Contact Information */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you have any questions about this Cookie Policy or our use of cookies, please contact us:
              </p>
              <div className="bg-muted/50 rounded-lg p-6 border border-border">
                <p className="text-muted-foreground mb-2"><strong className="text-foreground">AliceSolutionsGroup</strong></p>
                <p className="text-muted-foreground mb-2">Email: <a href="mailto:privacy@alicesolutionsgroup.com" className="text-primary hover:text-teal-300 underline">privacy@alicesolutionsgroup.com</a></p>
                <p className="text-muted-foreground mb-2">Phone: <a href="tel:+14165551234" className="text-primary hover:text-teal-300 underline">+1 (416) 555-1234</a></p>
                <p className="text-muted-foreground">Address: Toronto, Ontario, Canada</p>
              </div>
            </div>

            {/* Additional Resources */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Additional Resources
              </h3>
              <p className="text-muted-foreground text-sm mb-3">
                For more information about cookies and how to manage them:
              </p>
              <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1 ml-4">
                <li><a href="https://www.allaboutcookies.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-teal-300 underline">All About Cookies</a></li>
                <li><a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-teal-300 underline">Your Online Choices</a></li>
                <li><a href="/legal/privacy-policy" className="text-primary hover:text-teal-300 underline">Our Privacy Policy</a></li>
                <li><a href="/legal/terms-of-service" className="text-primary hover:text-teal-300 underline">Our Terms of Service</a></li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

