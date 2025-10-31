import { motion } from "framer-motion";
import { Accessibility, Eye, MousePointer, Volume2, CheckCircle, AlertCircle, Calendar, Heart } from "lucide-react";

export default function AccessibilityStatement() {
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
              <Accessibility className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-medium">Accessibility Statement</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-teal-100 to-cyan-100 bg-clip-text text-transparent">
              Accessibility Statement
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              We are committed to making our website accessible to everyone, including people with disabilities.
            </p>

            <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last Updated: December 2024</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>WCAG 2.1 Level AA Compliant</span>
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
                <Accessibility className="w-6 h-6 text-primary" />
                Our Commitment
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                AliceSolutionsGroup is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards to achieve these goals.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards, which explain how to make web content more accessible for people with disabilities and user-friendly for everyone.
              </p>
            </div>

            {/* Standards We Follow */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Accessibility Standards</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Our website is designed to meet the following accessibility standards:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>WCAG 2.1 Level AA:</strong> Web Content Accessibility Guidelines 2.1 at Level AA</li>
                <li><strong>Section 508:</strong> Rehabilitation Act of 1973, Section 508</li>
                <li><strong>ADA Compliance:</strong> Americans with Disabilities Act compliance</li>
                <li><strong>AODA:</strong> Accessibility for Ontarians with Disabilities Act (AODA)</li>
              </ul>
            </div>

            {/* Accessibility Features */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Accessibility Features</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                We have implemented the following accessibility features on our website:
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Visual Accessibility */}
                <div className="bg-muted/50 rounded-lg p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <Eye className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">Visual Accessibility</h3>
                  </div>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>High contrast color schemes for better visibility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Adjustable text sizes and zoom capabilities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Alternative text for images and graphics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Clear and readable typography</span>
                    </li>
                  </ul>
                </div>

                {/* Keyboard Navigation */}
                <div className="bg-muted/50 rounded-lg p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <MousePointer className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">Keyboard Navigation</h3>
                  </div>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Full keyboard navigation support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Visible focus indicators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Skip navigation links</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Logical tab order</span>
                    </li>
                  </ul>
                </div>

                {/* Screen Reader Support */}
                <div className="bg-muted/50 rounded-lg p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <Volume2 className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">Screen Reader Support</h3>
                  </div>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Semantic HTML structure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>ARIA labels and roles</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Descriptive link text</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Proper heading hierarchy</span>
                    </li>
                  </ul>
                </div>

                {/* Other Features */}
                <div className="bg-muted/50 rounded-lg p-6 border border-border">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold text-foreground">Additional Features</h3>
                  </div>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Responsive design for all devices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Consistent navigation structure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Error identification and suggestions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>Multiple ways to access content</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Known Issues */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-primary" />
                Known Accessibility Issues
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We are aware of the following accessibility issues and are working to address them:
              </p>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-6">
                <p className="text-muted-foreground text-sm">
                  Currently, there are no known accessibility issues with our website. We continuously monitor and test our website to ensure compliance with accessibility standards. If you encounter any accessibility barriers, please contact us using the information provided below.
                </p>
              </div>
            </div>

            {/* Third-Party Content */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Third-Party Content</h2>
              <p className="text-muted-foreground leading-relaxed">
                Some content on our website may be provided by third parties (e.g., embedded videos, social media feeds, external links). We do not have control over the accessibility of this third-party content. If you encounter accessibility issues with third-party content, please contact us, and we will work with the third party to address the issue or provide an alternative.
              </p>
            </div>

            {/* Feedback */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Feedback and Reporting Issues</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We welcome your feedback on the accessibility of our website. If you encounter any accessibility barriers or have suggestions for improvement, please contact us:
              </p>
              <div className="bg-muted/50 rounded-lg p-6 border border-border">
                <p className="text-muted-foreground mb-2"><strong className="text-foreground">AliceSolutionsGroup</strong></p>
                <p className="text-muted-foreground mb-2">Email: <a href="mailto:accessibility@alicesolutionsgroup.com" className="text-primary hover:text-teal-300 underline">accessibility@alicesolutionsgroup.com</a></p>
                <p className="text-muted-foreground mb-2">Phone: <a href="tel:+14165551234" className="text-primary hover:text-teal-300 underline">+1 (416) 555-1234</a></p>
                <p className="text-muted-foreground">Address: Toronto, Ontario, Canada</p>
              </div>
              <p className="text-muted-foreground leading-relaxed mt-4">
                When contacting us about accessibility issues, please include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-2">
                <li>The URL of the page where you encountered the issue</li>
                <li>A description of the accessibility barrier</li>
                <li>Your preferred method of contact</li>
                <li>Any assistive technology you are using</li>
              </ul>
            </div>

            {/* Continuous Improvement */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Continuous Improvement</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We are committed to continuously improving the accessibility of our website. Our ongoing efforts include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Regular accessibility audits and testing</li>
                <li>User testing with people with disabilities</li>
                <li>Staff training on accessibility best practices</li>
                <li>Monitoring and addressing user feedback</li>
                <li>Staying updated with accessibility standards and guidelines</li>
                <li>Implementing new accessibility features and technologies</li>
              </ul>
            </div>

            {/* Alternative Formats */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Alternative Formats</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                If you need information from our website in an alternative format, please contact us, and we will work with you to provide the information in a format that meets your needs. Alternative formats may include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Large print documents</li>
                <li>Audio recordings</li>
                <li>Braille documents</li>
                <li>Plain language versions</li>
                <li>Electronic formats (e.g., Word, PDF)</li>
              </ul>
            </div>

            {/* Testing */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Accessibility Testing</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We use the following methods to test and ensure the accessibility of our website:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li><strong>Automated Testing:</strong> Using accessibility testing tools (e.g., WAVE, axe, Lighthouse)</li>
                <li><strong>Manual Testing:</strong> Regular manual testing of key pages and features</li>
                <li><strong>User Testing:</strong> Testing with users who have disabilities</li>
                <li><strong>Keyboard Testing:</strong> Ensuring all functionality is accessible via keyboard</li>
                <li><strong>Screen Reader Testing:</strong> Testing with screen readers (e.g., NVDA, JAWS, VoiceOver)</li>
              </ul>
            </div>

            {/* Updates */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-foreground mb-4">Updates to This Statement</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Accessibility Statement from time to time to reflect changes in our practices or accessibility standards. We will notify users of any material changes by posting the updated statement on our website and updating the "Last Updated" date. We encourage you to review this statement periodically.
              </p>
            </div>

            {/* Compliance */}
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Compliance Status
              </h3>
              <p className="text-muted-foreground text-sm mb-3">
                Our website is designed to conform to the following accessibility standards:
              </p>
              <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1 ml-4">
                <li>WCAG 2.1 Level AA (Web Content Accessibility Guidelines)</li>
                <li>Section 508 of the Rehabilitation Act</li>
                <li>AODA (Accessibility for Ontarians with Disabilities Act)</li>
                <li>ADA (Americans with Disabilities Act)</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

