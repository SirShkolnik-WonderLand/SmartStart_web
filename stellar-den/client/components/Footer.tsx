import { useState, useEffect } from "react";
import { Linkedin, Github, Twitter } from "lucide-react";

export default function Footer() {
  const [owlBlink, setOwlBlink] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setOwlBlink(true);
      setTimeout(() => setOwlBlink(false), 300);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="relative border-t border-border bg-background/50 backdrop-blur-glass">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <span className="text-2xl transition-all duration-300" style={{
                  transform: owlBlink ? 'scaleY(0.1)' : 'scaleY(1)',
                }}>
                  🦉
                </span>
              </div>
              <h3 className="font-semibold text-lg">AliceSolutionsGroup</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Help people and businesses grow differently.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4">Ventures</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  SmartStart
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  BizForge
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Syncary
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  CISO-as-a-Service
                </a>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4">Legal & Privacy</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="/legal/privacy-policy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/legal/terms-of-service" className="hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/legal/cookie-policy" className="hover:text-primary transition-colors">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent('openCookiePreferences'));
                  }}
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  Cookie Preferences
                </a>
              </li>
              <li>
                <a href="/legal/accessibility" className="hover:text-primary transition-colors">
                  Accessibility
                </a>
              </li>
              <li>
                <a href="/unsubscribe" className="hover:text-primary transition-colors">
                  Unsubscribe
                </a>
              </li>
              <li>
                <a href="/data-deletion" className="hover:text-primary transition-colors">
                  Request Data Deletion
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Copyright */}
          <div className="text-sm text-muted-foreground">
            <p>© 2024 AliceSolutionsGroup. All rights reserved.</p>
            <p>Building the future of automation, privacy, and human-centric design.</p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg border border-white/10 hover:border-primary hover:bg-primary/10 transition-all duration-300 text-muted-foreground hover:text-primary"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg border border-white/10 hover:border-primary hover:bg-primary/10 transition-all duration-300 text-muted-foreground hover:text-primary"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg border border-white/10 hover:border-primary hover:bg-primary/10 transition-all duration-300 text-muted-foreground hover:text-primary"
              aria-label="Twitter/X"
            >
              <Twitter className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
