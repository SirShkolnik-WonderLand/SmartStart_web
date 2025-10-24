import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Check system preference on mount
  useEffect(() => {
    const darkMode = localStorage.getItem("theme") === "dark" || 
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, []);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const handleNavigation = (href: string, action?: () => void) => {
    setIsMobileMenuOpen(false);
    if (action) {
      action();
    } else if (href.startsWith('/')) {
      navigate(href);
    } else if (href.startsWith('#')) {
      const sectionId = href.substring(1);
      if (location.pathname === '/') {
        scrollToSection(sectionId);
      } else {
        navigate('/');
        setTimeout(() => scrollToSection(sectionId), 100);
      }
    }
  };

  const navigationItems = [
    {
      label: "About",
      items: [
        { label: "Our Story", href: "/about" },
        { label: "Team", href: "/about" },
        { label: "Certifications", href: "/about" },
        { label: "Careers", href: "/about" }
      ]
    },
    {
      label: "Services",
      items: [
        { label: "All Services", href: "/services" },
        { label: "CISO-as-a-Service", href: "/ciso-as-service" },
        { label: "ISO 27001", href: "/iso-27001" },
        { label: "SOC 2", href: "/soc-2" },
        { label: "BI & Analytics", href: "/bi-analytics" },
        { label: "Automation & AI", href: "/automation-ai" },
        { label: "Privacy & Compliance", href: "/privacy-compliance" },
        { label: "Advisory & Audits", href: "/advisory-audits" }
      ]
    },
    {
      label: "SmartStart",
      items: [
        { label: "SmartStart Hub", href: "/smartstart-hub" },
        { label: "SmartStart Platform", href: "/smartstart-platform" },
        { label: "Membership", href: "/smartstart-membership" },
        { label: "Enterprise Tools", href: "/smartstart-enterprise-tools" },
        { label: "Venture Building", href: "/smartstart-venture-building" }
      ]
    },
    {
      label: "Community",
      items: [
        { label: "Community Hub", href: "/community-hub" },
        { label: "Events", href: "/community-events" },
        { label: "Beer + Security", href: "/beer-security" },
        { label: "Launch & Learn", href: "/launch-learn" },
        { label: "Mentorship", href: "/mentorship" }
      ]
    },
    {
      label: "ISO Studio",
      items: [
        { label: "Full Assessment", href: "/iso-studio" },
        { label: "Quick Bot Mode", href: "/iso-studio" },
        { label: "Download Checklist", href: "/iso-studio" },
        { label: "Documentation", href: "/iso-studio" }
      ]
    },
    {
      label: "Resources",
      items: [
        { label: "Knowledge Hub", href: "/resources" },
        { label: "Professional Resources", href: "/resources" },
        { label: "Community Resources", href: "/resources" },
        { label: "Templates & Guides", href: "/resources" }
      ]
    },
    {
      label: "Contact",
      items: [
        { label: "Get in Touch", href: "/contact" },
        { label: "Book Consultation", href: "/contact" },
        { label: "Support", href: "/contact" },
        { label: "FAQ", href: "/contact" }
      ]
    }
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <motion.img
                src="/logo.png"
                alt="AliceSolutionsGroup"
                className="w-full h-full object-contain"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              />
              {/* Glow effect */}
              <motion.div
                className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                AliceSolutionsGroup
              </div>
              <div className="text-xs text-muted-foreground">
                Cybersecurity & Innovation
              </div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1">
                  {item.label}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-48 rounded-lg border border-border/50 bg-background/95 backdrop-blur-lg shadow-xl overflow-hidden z-50"
                    >
                      <div className="py-2">
                        {item.items.map((subItem, index) => (
                          <a
                            key={index}
                            href={subItem.href}
                            onClick={(e) => {
                              e.preventDefault();
                              handleNavigation(subItem.href);
                            }}
                            className="block px-4 py-2 text-sm text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all duration-200"
                          >
                            {subItem.label}
                          </a>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="relative"
              >
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div
                      key="moon"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Moon className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="sun"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="hidden sm:block"
            >
              <Button
                onClick={() => handleNavigation('/contact')}
                className="bg-primary hover:bg-primary/90"
              >
                Get Started
              </Button>
            </motion.div>

            {/* Mobile Menu Button */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden"
          >
            <div className="px-4 py-6 space-y-2 bg-background/95 backdrop-blur-lg border-t border-border">
              {navigationItems.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </div>
                  {item.items.map((subItem, index) => (
                    <a
                      key={index}
                      href={subItem.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleNavigation(subItem.href);
                      }}
                      className="block px-6 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-foreground/80 hover:text-primary"
                    >
                      {subItem.label}
                    </a>
                  ))}
                </div>
              ))}
              <Button
                onClick={() => handleNavigation('/contact')}
                className="w-full bg-primary hover:bg-primary/90 mt-4"
              >
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
