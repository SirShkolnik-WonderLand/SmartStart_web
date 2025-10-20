import { motion } from "framer-motion";
import { Shield, Award, Lock, CheckCircle2 } from "lucide-react";

export default function TrustBadges() {
  const badges = [
    {
      icon: Shield,
      title: "ISO 27001 Lead Auditor",
      description: "Certified by international standards",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Award,
      title: "CISSP & CISM Certified",
      description: "Enterprise-grade security expertise",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Lock,
      title: "GDPR & PIPEDA Compliant",
      description: "Privacy-first data handling",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: CheckCircle2,
      title: "Trusted by 100+ Businesses",
      description: "Proven track record",
      color: "from-orange-500 to-red-500"
    }
  ];

  const partners = [
    {
      name: "Zoho",
      description: "Enterprise Suite Partner",
      logo: "Z"
    },
    {
      name: "Acronis",
      description: "Security & Backup Partner",
      logo: "A"
    },
    {
      name: "ISO 27001",
      description: "Certified Lead Auditor",
      logo: "ISO"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 md:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
            Trusted & Certified
          </h2>
          <p className="text-lg text-muted-foreground">
            Enterprise-grade security and compliance expertise
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${badge.color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-foreground mb-2">
                  {badge.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {badge.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Partner Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <h3 className="text-xl font-semibold mb-8 text-foreground">
            Powered by Industry Leaders
          </h3>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="text-2xl font-bold text-primary">
                    {partner.logo}
                  </span>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-foreground">
                    {partner.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {partner.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground italic max-w-2xl mx-auto">
            "We don't just talk about security and compliance — we live it. Every tool, framework, and process is designed with security and privacy at its core."
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            — Udi Shkolnik, CISSP, CISM, ISO 27001 Lead Auditor
          </p>
        </motion.div>
      </div>
    </section>
  );
}

