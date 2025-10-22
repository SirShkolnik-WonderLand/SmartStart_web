import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { Calendar, Users, Rocket, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";

export default function SmartStart30Days() {
  const { ref, isInView } = useInView();

  const steps = [
    {
      day: "Day 0-10",
      title: "Define",
      description: "Intake, scope definition, technical architecture planning",
      icon: Calendar,
      color: "#1DE0C1",
    },
    {
      day: "Day 10-20",
      title: "Build",
      description: "Rapid prototyping, core features, user testing loops",
      icon: Users,
      color: "#6A5CFF",
    },
    {
      day: "Day 20-30",
      title: "Launch & Measure",
      description: "Production deployment, monitoring, initial metrics collection",
      icon: Rocket,
      color: "#10B981",
    },
  ];

  const included = [
    "Zoho suite access",
    "Community events",
    "Mentor support",
    "Technical templates",
    "Security baselines",
    "Real-world testing",
  ];

  return (
    <section ref={ref} className="px-4 py-24 bg-card/30">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
            SmartStart in 30 Days
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            From idea to MVP in 30 days. Templates, technical leadership, and
            real-world pressure testing.
          </p>
        </motion.div>

        {/* Timeline - Equal Height Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 auto-rows-fr">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative flex flex-col"
              >
                {/* Connecting line */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary to-transparent" />
                )}

                <div className="flex flex-col flex-grow p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-glow-turquoise">
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${step.color}20` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: step.color }} />
                  </div>

                  {/* Day Badge */}
                  <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
                    {step.day}
                  </div>

                  {/* Content - Flex grow to fill space */}
                  <div className="flex flex-col flex-grow">
                    <h3 className="font-display text-2xl font-bold mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground flex-grow">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* What's Included */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="p-8 rounded-xl border border-border bg-card">
            <h3 className="font-display text-xl font-bold mb-6 text-center">
              What's Included
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              {included.map((item, idx) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.6 + idx * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <Button
                size="lg"
                className="shadow-glow-turquoise hover:shadow-glow-plasma transition-all duration-300"
                asChild
              >
                <a href="/smartstart-hub">
                  Join SmartStart ($98.80/mo)
                </a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

