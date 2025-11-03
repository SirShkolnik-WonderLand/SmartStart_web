import { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  Users,
  Coffee,
  GraduationCap,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Beer,
  Rocket,
  Heart,
  Target,
  Award,
  TrendingUp,
  Globe,
  Shield,
  CheckCircle2,
  Star,
  Zap,
  BookOpen,
  Network,
  Clock,
  MapPin,
  UserPlus,
  ExternalLink,
  ChevronRight,
  PlayCircle,
  Mic,
  Code,
  Briefcase,
  Handshake,
  Lightbulb,
  Megaphone,
  UsersRound,
  Building2
} from "lucide-react";

export default function Community() {
  const { isCollapsed } = useSidebar();
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  const events = [
    {
      title: "Beer + Security",
      description: "Casual networking meetups for cybersecurity professionals and entrepreneurs in the GTA",
      icon: Beer,
      frequency: "Monthly",
      location: "Toronto & GTA",
      attendees: "45+",
      color: "from-blue-500 to-cyan-500",
      features: [
        "Networking with industry professionals",
        "Security discussions and knowledge sharing",
        "Founder stories and experiences",
        "Relaxed, friendly atmosphere"
      ],
      nextEvent: "Oct 26, 2024 • 6:00 PM EST"
    },
    {
      title: "Launch & Learn",
      description: "Educational sessions covering AI, cybersecurity, automation, and startup best practices",
      icon: GraduationCap,
      frequency: "Bi-weekly",
      location: "Virtual & In-person",
      attendees: "78+",
      color: "from-purple-500 to-pink-500",
      features: [
        "Expert-led workshops and presentations",
        "Hands-on learning opportunities",
        "Q&A sessions with industry leaders",
        "Practical takeaways and resources"
      ],
      nextEvent: "Nov 10, 2024 • 1:00 PM EST"
    },
    {
      title: "Automation & Innovation Clinics",
      description: "Focused sessions for Ontario SMEs to learn automation and innovation strategies",
      icon: Zap,
      frequency: "Monthly",
      location: "Ontario-wide",
      attendees: "30+",
      color: "from-orange-500 to-red-500",
      features: [
        "Tailored for small and medium businesses",
        "Practical automation solutions",
        "Innovation strategies",
        "One-on-one consultation opportunities"
      ],
      nextEvent: "Nov 22, 2024 • 10:00 AM EST"
    },
    {
      title: "Founder Roundtables",
      description: "Intimate discussions with Udi and industry peers on startup challenges and growth",
      icon: MessageSquare,
      frequency: "Monthly",
      location: "Toronto",
      attendees: "12",
      color: "from-green-500 to-emerald-500",
      features: [
        "Small group discussions",
        "Direct access to mentorship",
        "Peer learning and support",
        "Actionable insights and advice"
      ],
      nextEvent: "Dec 5, 2024 • 7:00 PM EST"
    }
  ];

  const communityValues = [
    {
      title: "Collaboration Over Competition",
      description: "We believe in lifting each other up, not competing for limited resources",
      icon: Heart,
      color: "from-pink-500 to-rose-500"
    },
    {
      title: "Knowledge Sharing",
      description: "Everyone has something to teach and something to learn",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Real Growth",
      description: "Measurable results, not just networking and handshakes",
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Inclusive & Diverse",
      description: "We welcome non-linear careers and unconventional paths",
      icon: Globe,
      color: "from-purple-500 to-indigo-500"
    }
  ];

  const impactMetrics = [
    {
      value: 100,
      suffix: "+",
      label: "Community Members",
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      value: 50,
      suffix: "+",
      label: "Events Hosted",
      icon: Calendar,
      color: "from-purple-500 to-pink-500"
    },
    {
      value: 30,
      suffix: "+",
      label: "Startups Supported",
      icon: Rocket,
      color: "from-orange-500 to-red-500"
    },
    {
      value: 15,
      suffix: "+",
      label: "Pro-Bono Projects",
      icon: Heart,
      color: "from-pink-500 to-rose-500"
    }
  ];

  const successStories = [
    {
      title: "Dispatch & Ops Automation",
      description: "AI scheduling, real-time tracking, reporting",
      result: "~40% cost reduction and higher CSAT",
      icon: Zap,
      color: "from-orange-500 to-red-500",
      metrics: ["40% Cost Reduction", "Higher CSAT", "Real-time Tracking"]
    },
    {
      title: "Education Ops Platform",
      description: "Consistent ops across 40+ countries / 1,200+ locations",
      result: "Automation for scheduling/reporting/QA",
      icon: GraduationCap,
      color: "from-blue-500 to-cyan-500",
      metrics: ["40+ Countries", "1,200+ Locations", "Full Automation"]
    },
    {
      title: "Healthcare Compliance Platform",
      description: "Privacy-by-design patient data flows",
      result: "~50% admin reduction and improved protection",
      icon: Shield,
      color: "from-green-500 to-emerald-500",
      metrics: ["50% Admin Reduction", "Privacy-by-Design", "Improved Protection"]
    }
  ];

  const membershipBenefits = [
    {
      category: "Community Access",
      icon: UsersRound,
      color: "from-blue-500 to-cyan-500",
      features: [
        "Access to all community events",
        "Networking with entrepreneurs and experts",
        "Direct mentorship opportunities",
        "Peer support and collaboration"
      ]
    },
    {
      category: "Learning & Growth",
      icon: BookOpen,
      color: "from-purple-500 to-pink-500",
      features: [
        "Educational workshops and sessions",
        "Exclusive resources and guides",
        "Industry insights and updates",
        "Skill development opportunities"
      ]
    },
    {
      category: "Tools & Resources",
      icon: Briefcase,
      color: "from-orange-500 to-red-500",
      features: [
        "Enterprise collaboration tools",
        "Security and backup solutions",
        "Second Brain Platform access",
        "Automation and workflow tools"
      ]
    },
    {
      category: "Support & Mentorship",
      icon: Handshake,
      color: "from-green-500 to-emerald-500",
      features: [
        "Direct access to Udi's expertise",
        "Pro-bono cybersecurity reviews",
        "Startup guidance and advice",
        "Ongoing support and feedback"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? 'md:ml-20 ml-0' : 'md:ml-72 ml-0'} md:pt-0 pt-20`}>
      {/* Hero Section with Parallax */}
      <motion.section 
        style={{ opacity, scale }}
        className="relative pt-8 pb-16 px-4 sm:px-6 md:px-8 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6 cursor-default"
            >
              <Users className="w-4 h-4" />
              <span>SmartStart Community</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6"
            >
              <span className="block text-foreground">Where Entrepreneurs</span>
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Connect, Learn, and Grow
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8"
            >
              A collaborative ecosystem for Ontario entrepreneurs, students, and small businesses
            </motion.p>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8"
            >
              Join a community that values <strong className="text-primary">collaboration over competition</strong>, <strong className="text-primary">real growth over networking</strong>, and <strong className="text-primary">shared success over individual achievement</strong>.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-teal dark:shadow-glow-cyan w-full sm:w-auto"
                >
                  <Users className="mr-2 w-5 h-5" />
                  Join the Community
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary/10 w-full sm:w-auto"
                >
                  <Calendar className="mr-2 w-5 h-5" />
                  View Upcoming Events
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Animated Impact Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12"
          >
            {impactMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  onHoverStart={() => setHoveredValue(index)}
                  onHoverEnd={() => setHoveredValue(null)}
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        animate={{ 
                          scale: hoveredValue === index ? 1.2 : 1,
                          rotate: hoveredValue === index ? 360 : 0
                        }}
                        transition={{ duration: 0.6 }}
                        className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${metric.color} flex items-center justify-center`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {metric.value}{metric.suffix}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {metric.label}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      {/* Community Values */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Our Community Values
            </h2>
            <p className="text-lg text-muted-foreground">
              What makes us different
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityValues.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                  className="cursor-pointer"
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full text-center transition-all duration-300 hover:shadow-glow-teal dark:hover:shadow-glow-cyan">
                    <CardContent className="p-6">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${value.color} flex items-center justify-center`}
                      >
                        <Icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <h3 className="text-lg font-bold text-foreground mb-3">
                        {value.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Events Section */}
      <section className="py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Community Events
            </h2>
            <p className="text-lg text-muted-foreground">
              Regular meetups, workshops, and learning opportunities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {events.map((event, index) => {
              const Icon = event.icon;
              const isSelected = selectedEvent === index;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  onClick={() => setSelectedEvent(isSelected ? null : index)}
                  className="cursor-pointer"
                >
                  <Card className={`border-border/50 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-glow-teal dark:hover:shadow-glow-cyan ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}>
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4 mb-4">
                        <motion.div 
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className={`w-16 h-16 rounded-lg bg-gradient-to-r ${event.color} flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-foreground mb-2">
                            {event.title}
                          </h3>
                          <div className="flex flex-wrap gap-2 text-sm mb-2">
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                              {event.frequency}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground font-semibold">
                              {event.location}
                            </span>
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                              {event.attendees} attendees
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{event.nextEvent}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-6">
                        {event.description}
                      </p>
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: isSelected ? 'auto' : 0, opacity: isSelected ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <ul className="space-y-2 pb-4">
                          {event.features.map((feature, idx) => (
                            <motion.li 
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: isSelected ? 1 : 0, x: isSelected ? 0 : -20 }}
                              transition={{ delay: idx * 0.05 }}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="ghost"
                          className="w-full justify-between text-primary hover:bg-primary/10"
                        >
                          {isSelected ? 'Hide Details' : 'Learn More'}
                          <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Success Stories
            </h2>
            <p className="text-lg text-muted-foreground">
              Real-world results from collaborative projects
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {successStories.map((story, index) => {
              const Icon = story.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="cursor-pointer"
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-glow-teal dark:hover:shadow-glow-cyan">
                    <CardContent className="p-6">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className={`w-12 h-12 rounded-lg bg-gradient-to-r ${story.color} flex items-center justify-center mb-4`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </motion.div>
                      <h3 className="text-lg font-bold text-foreground mb-2">
                        {story.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {story.description}
                      </p>
                      <div className="space-y-2">
                        {story.metrics.map((metric, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="px-3 py-2 rounded-lg bg-primary/10 text-primary font-semibold text-sm"
                          >
                            {metric}
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-muted-foreground italic">
              Client names available on request under NDA
            </p>
          </motion.div>
        </div>
      </section>

      {/* Membership Benefits */}
      <section className="py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              What You Get as a Member
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive benefits for entrepreneurs and innovators
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {membershipBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.02 }}
                  className="cursor-pointer"
                >
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-glow-teal dark:hover:shadow-glow-cyan">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className={`w-12 h-12 rounded-lg bg-gradient-to-r ${benefit.color} flex items-center justify-center`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-foreground">
                          {benefit.category}
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {benefit.features.map((feature, idx) => (
                          <motion.li 
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pro-Bono Section */}
      <section className="py-16 px-4 sm:px-6 md:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all duration-300">
              <CardContent className="p-8 sm:p-12">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <Heart className="w-8 h-8 text-primary" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-4 text-foreground">
                  Pro-Bono Support
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  We believe in giving back to the community. SmartStart offers pro-bono cybersecurity reviews and support for nonprofits and deserving startups on a capacity-based basis.
                </p>
                <p className="text-muted-foreground mb-8">
                  If you're a nonprofit organization or early-stage startup with limited resources, reach out to discuss how we can help.
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-teal dark:shadow-glow-cyan"
                  >
                    <Heart className="mr-2 w-5 h-5" />
                    Request Pro-Bono Support
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 md:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 backdrop-blur-sm hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all duration-300">
              <CardContent className="p-8 sm:p-12">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
                  Ready to Join Our Community?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Connect with like-minded entrepreneurs, learn from industry experts, and grow your business with the support of the SmartStart community.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow-teal dark:shadow-glow-cyan"
                      onClick={() => {
                        const checkoutUrl = import.meta.env.VITE_STRIPE_CHECKOUT_URL;
                        if (checkoutUrl) {
                          window.open(checkoutUrl, '_blank');
                        } else {
                          console.error('Stripe checkout URL not configured. Please set VITE_STRIPE_CHECKOUT_URL environment variable.');
                        }
                      }}
                    >
                      <Users className="mr-2 w-5 h-5" />
                      Join SmartStart Community
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/10"
                    >
                      <Calendar className="mr-2 w-5 h-5" />
                      View Events Calendar
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
  );
}
