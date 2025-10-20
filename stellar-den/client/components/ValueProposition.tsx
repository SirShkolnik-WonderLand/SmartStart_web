import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Shield, Zap, TrendingUp, Users, Lock } from "lucide-react";

export default function ValueProposition() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Automation to reduce costs",
      description: "Pre-built automation templates and workflows to reduce manual work",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Shield,
      title: "Enterprise-grade security",
      description: "ISO-certified security and compliance without the enterprise price",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Access to $500+/month tools",
      description: "Zoho suite, Acronis backup, and enterprise tools for $98.80/month",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: TrendingUp,
      title: "Proven frameworks",
      description: "Structured approaches for funding, ISO compliance, and automation",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Users,
      title: "Expert mentorship",
      description: "Direct access to Udi Shkolnik (CISSP, CISM, ISO 27001 Lead Auditor) and peers",
      color: "from-teal-500 to-cyan-500"
    },
    {
      icon: Lock,
      title: "Privacy-first data handling",
      description: "GDPR and PIPEDA compliant security built-in",
      color: "from-indigo-500 to-purple-500"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 md:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <DollarSign className="w-4 h-4" />
            <span>Value Proposition</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            <span className="block text-foreground">What You Get</span>
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              With SmartStart
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            For freelancers, small businesses, and startups — tools, mentorship, and security to help you grow.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-glow-teal dark:hover:shadow-glow-cyan">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${benefit.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center mt-12"
        >
            <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm inline-block hover:shadow-glow-teal dark:hover:shadow-glow-cyan transition-all duration-300">
              <CardContent className="p-6">
                <p className="text-primary font-semibold">
                  Tools that would cost $500+/month individually, plus mentorship and security — all for $98.80/month.
                </p>
              </CardContent>
            </Card>
        </motion.div>
      </div>
    </section>
  );
}

