import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Moon, Sun, ChevronLeft, ChevronRight, ChevronDown, Home, UserCircle, Shield, Rocket, Globe2, ClipboardCheck, BookOpen, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "@/contexts/SidebarContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const { isCollapsed, toggleCollapse } = useSidebar();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Check system preference on mount
  useEffect(() => {
    const darkMode = localStorage.getItem("theme") === "dark" || 
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDark(darkMode);
    document.documentElement.classList.toggle("dark", darkMode);
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  const handleToggleCollapse = () => {
    toggleCollapse();
    setActiveDropdown(null); // Close dropdowns when collapsing
  };

  const handleNavigation = (href: string) => {
    if (href.startsWith('/')) {
      navigate(href);
    } else if (href.startsWith('#')) {
      const sectionId = href.substring(1);
      if (location.pathname === '/') {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        navigate('/');
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
    setActiveDropdown(null);
  };

  const navigationItems = [
    {
      label: "About",
      icon: UserCircle,
      items: [
        { label: "Our Story", href: "/about" },
        { label: "Team", href: "/about" },
        { label: "Certifications", href: "/about" },
        { label: "Careers", href: "/about" }
      ]
    },
    {
      label: "Services",
      icon: Shield,
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
      icon: Rocket,
      items: [
        { label: "SmartStart", href: "/smartstart" },
        { label: "Venture Building", href: "/smartstart-venture-building" },
        { label: "Archetypes", href: "/smartstart/archetypes" }
      ]
    },
    {
      label: "Community",
      icon: Globe2,
      items: [
        { label: "Community Hub", href: "/community-hub" },
        { label: "Events", href: "/community-events" }
      ]
    },
    {
      label: "ISO Studio",
      icon: ClipboardCheck,
      href: "/iso-studio"
    },
    {
      label: "Resources",
      icon: BookOpen,
      href: "/resources"
    },
    {
      label: "Contact",
      icon: Mail,
      items: [
        { label: "Get in Touch", href: "/contact" },
        { label: "Book Consultation", href: "/contact" },
        { label: "Support", href: "/contact" },
        { label: "FAQ", href: "/contact" }
      ]
    }
  ];

  return (
    <>
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`fixed left-0 top-0 h-full z-50 bg-background/95 backdrop-blur-lg border-r border-border transition-all duration-300 ${
          isCollapsed 
            ? "md:w-20 w-0 -translate-x-full md:translate-x-0" 
            : "w-72 md:w-72"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <motion.div
              className="flex items-center gap-3 cursor-pointer flex-1"
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative w-10 h-10 flex-shrink-0">
                <motion.img
                  src="/logo.png"
                  alt="AliceSolutionsGroup"
                  className="w-full h-full object-contain"
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                />
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
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="text-lg font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent whitespace-nowrap">
                      AliceSolutionsGroup
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      Cybersecurity & Innovation
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleCollapse}
              className="flex-shrink-0 hidden md:flex"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            {/* Home Button */}
            <motion.div
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={location.pathname === '/' ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 mb-2 ${
                  location.pathname === '/' ? "bg-primary/10 text-primary" : ""
                }`}
                onClick={() => handleNavigation('/')}
              >
                <Home className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      Home
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>

            {/* Navigation Items */}
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <div key={item.label} className="relative">
                  {/* Main Item */}
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 ${
                        activeDropdown === item.label || (item.href && location.pathname === item.href) 
                          ? "bg-primary/10 text-primary" 
                          : ""
                      }`}
                      onClick={() => {
                        // If item has direct href, navigate to it
                        if (item.href) {
                          handleNavigation(item.href);
                        } else if (item.items) {
                          // If item has dropdown items
                          if (isCollapsed) {
                            // If collapsed, navigate to first menu item
                            if (item.items.length > 0) {
                              handleNavigation(item.items[0].href);
                            }
                          } else {
                            // If expanded, toggle dropdown
                            setActiveDropdown(activeDropdown === item.label ? null : item.label);
                          }
                        }
                      }}
                    >
                      {item.icon ? (
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                      ) : (
                        <span className="text-xl flex-shrink-0">★</span>
                      )}
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between flex-1 overflow-hidden"
                          >
                            <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                            {item.items && (
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  activeDropdown === item.label ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>

                  {/* Dropdown Items - only show if item has items array */}
                  {item.items && (
                    <AnimatePresence>
                      {!isCollapsed && activeDropdown === item.label && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden ml-4 mt-1 space-y-1"
                        >
                          {item.items.map((subItem, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              whileHover={{ scale: 1.02, x: 4 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-xs text-muted-foreground hover:text-primary hover:bg-primary/5"
                                onClick={() => handleNavigation(subItem.href)}
                              >
                                {subItem.label}
                              </Button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Bottom Actions */}
          <div className="p-4 border-t border-border space-y-2">
            {/* CTA Button */}
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    onClick={() => handleNavigation('/contact')}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Get Started
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Theme Toggle */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={toggleTheme}
              >
                <AnimatePresence mode="wait">
                  {isDark ? (
                    <motion.div
                      key="moon"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
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
                      className="flex-shrink-0"
                    >
                      <Sun className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {isDark ? "Light Mode" : "Dark Mode"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Floating Toggle Button - Only show when collapsed on mobile */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={handleToggleCollapse}
            className="fixed left-4 top-4 z-50 md:hidden bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-3 shadow-lg shadow-primary/20"
            aria-label="Open menu"
          >
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => toggleCollapse()}
          />
        )}
      </AnimatePresence>

    </>
  );
}

