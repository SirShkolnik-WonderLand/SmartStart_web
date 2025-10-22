import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { Shield, Zap, Database, FileCheck, Download, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

export default function ISOStudioShowcase() {
  const { ref, isInView } = useInView();

  const features = [
    {
      icon: Shield,
      title: "Advisor Mode",
      description: "Contextual guidance for every control",
    },
    {
      icon: Zap,
      title: "Quick Bot",
      description: "20 strategic questions for fast assessment",
    },
    {
      icon: Database,
      title: "93-Control Matrix",
      description: "Full ISO 27001:2022 control set",
    },
    {
      icon: FileCheck,
      title: "Evidence Vault",
      description: "Track and organize compliance artifacts",
    },
    {
      icon: Download,
      title: "Import/Export",
      description: "JSON export for portability",
    },
  ];

  return (
    <section ref={ref} className="px-4 py-24">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
              ISO Studio
            </h2>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Advisor mode, Quick Bot, and the full ISO 27001 control
              set—evidence and exports included.
            </p>

            {/* Features List */}
            <div className="space-y-4 pt-4">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-lg border border-transparent hover:border-primary/30 hover:bg-card/50 transition-all duration-300"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground mb-1">
                        {feature.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {feature.description}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                size="lg"
                className="shadow-glow-turquoise hover:shadow-glow-plasma transition-all duration-300"
                asChild
              >
                <a href="/iso-studio">
                  Run a Free Readiness Check
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-secondary/10 to-background p-8 flex items-center justify-center overflow-hidden">
              {/* Placeholder for demo video or screenshot */}
              <div className="text-center space-y-4">
                <Shield className="w-24 h-24 text-primary mx-auto" />
                <p className="text-muted-foreground">
                  Interactive compliance assessment
                </p>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-primary/20 blur-2xl" />
              <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-secondary/20 blur-3xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

