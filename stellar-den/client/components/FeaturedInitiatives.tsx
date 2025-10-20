import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rocket, Users, ArrowRight, Zap, Shield, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FeaturedInitiatives() {
  const navigate = useNavigate();

  const initiatives = [
    {
      id: "smartstart",
      title: "SmartStart Hub",
      tagline: "Enterprise Tools & Venture Building",
      description: "Join a community of entrepreneurs with access to enterprise tools, mentorship, and venture building support. Scale your startup with Zoho, Acronis, and expert guidance.",
      icon: Rocket,
      price: "$98.80/month",
      features: ["Enterprise Tools (Zoho Suite)", "Security & Backup (Acronis)", "Venture Building Track", "Mentorship & Networking"],
      cta: "Join SmartStart Hub",
      href: "/smartstart-hub",
      gradient: "from-blue-500/20 to-cyan-500/20",
      borderGradient: "from-blue-500/50 to-cyan-500/50"
    },
    {
      id: "community",
      title: "Community Programs",
      tagline: "Events, Mentorship & Networking",
      description: "Connect with like-minded entrepreneurs, attend exclusive events, and access mentorship programs. Free to join, open to all Ontario startups and businesses.",
      icon: Users,
      price: "Free to Join",
      features: ["Beer + Security Meetups", "Launch & Learn Workshops", "Automation Clinics", "Founder Roundtables"],
      cta: "Join Community",
      href: "/community",
      gradient: "from-teal-500/20 to-green-500/20",
      borderGradient: "from-teal-500/50 to-green-500/50"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 md:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            <span>Featured Initiatives</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            <span className="block text-foreground">Join Our Growing</span>
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Community & Ecosystem
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Two powerful ways to accelerate your business growth: SmartStart Hub for enterprise tools and venture building, and Community Programs for networking and mentorship.
          </p>
        </motion.div>

        {/* Initiatives Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {initiatives.map((initiative, index) => {
            const Icon = initiative.icon;
            return (
              <motion.div
                key={initiative.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl hover:border-primary/50 transition-all duration-500 group h-full relative overflow-hidden">
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${initiative.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Border Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${initiative.borderGradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-lg`} />
                  
                  <CardContent className="p-8 relative z-10">
                    {/* Icon */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-1">
                          {initiative.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {initiative.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {initiative.description}
                    </p>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-6">
                      <div className="text-3xl font-bold text-foreground">
                        {initiative.price}
                      </div>
                      {initiative.id === "community" && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          Free Forever
                        </span>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-8">
                      {initiative.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="p-1 rounded bg-primary/10 mt-0.5">
                            <Shield className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => navigate(initiative.href)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300"
                      size="lg"
                    >
                      <span>{initiative.cta}</span>
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            Not sure which is right for you?
          </p>
          <Button
            onClick={() => navigate('/contact')}
            variant="outline"
            size="lg"
            className="border-primary text-primary hover:bg-primary/10"
          >
            <Briefcase className="mr-2 w-5 h-5" />
            Talk to Us
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

