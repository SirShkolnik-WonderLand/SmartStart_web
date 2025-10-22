import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { ArrowRight, Shield, Rocket, Users, Zap, Lock, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";

export default function EcosystemBento() {
  const { ref, isInView } = useInView();

  const products = [
    {
      name: "SmartStart Hub",
      tagline: "From idea to MVP in 30 days.",
      description:
        "Venture building sprints, templates, mentorship, and real-world pressure testing for founders.",
      icon: Rocket,
      color: "#10B981",
      link: "/smartstart-hub",
      size: "normal",
    },
    {
      name: "ISO Studio",
      tagline: "Advisor, Quick Bot, and full 27001 controls.",
      description:
        "Interactive compliance assessment with 93 controls, evidence tracking, and export capabilities.",
      icon: Shield,
      color: "#8B5CF6",
      link: "/iso-studio",
      size: "normal",
    },
    {
      name: "CISO-as-a-Service",
      tagline: "Zero-Trust, SOC2/ISO readiness, PHIPA/PIPEDA.",
      description:
        "Strategic security leadership, compliance readiness, and Toronto-focused privacy expertise.",
      icon: Shield,
      color: "#1DE0C1",
      link: "/services",
      size: "normal",
    },
    {
      name: "Automation & AI",
      tagline: "BI, copilots, RPA, governance.",
      description:
        "Privacy-preserving machine learning, intelligent workflows, and decision support tools.",
      icon: Zap,
      color: "#F59E0B",
      link: "/services",
      size: "normal",
    },
    {
      name: "Syncary",
      tagline: "Teams, tasks, and smart workflows.",
      description:
        "Collaboration platform with integrated project management and automation.",
      icon: Users,
      color: "#EC4899",
      link: "#",
      size: "normal",
      badge: "Preview",
    },
    {
      name: "DriftLock & Delta",
      tagline: "Post-quantum crypto & marketing SOAR.",
      description:
        "Next-generation security research and marketing automation platform.",
      icon: Lock,
      color: "#EF4444",
      link: "#",
      size: "normal",
      badge: "R&D",
    },
  ];

  const metrics = [
    { value: "50+", label: "Clients" },
    { value: "100+", label: "Projects" },
    { value: "$150K/mo", label: "Cost Savings Unlocked" },
  ];

  return (
    <section ref={ref} className="px-4 py-24 bg-card/30">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
            Our Ecosystem: What We Operate
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            We operate a constellation of products and programs—each designed to
            de-risk decisions, compress time-to-value, and scale securely.
          </p>
        </motion.div>

        {/* Bento Grid - Equal Height Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 auto-rows-fr">
          {products.map((product, idx) => {
            const Icon = product.icon;

            return (
              <motion.div
                key={product.name}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative flex flex-col p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-glow-turquoise hover:-translate-y-1"
              >
                {/* Badge */}
                {product.badge && (
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-semibold">
                    {product.badge}
                  </div>
                )}

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: `${product.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: product.color }} />
                </div>

                {/* Content - Flex grow to push CTA to bottom */}
                <div className="flex flex-col flex-grow">
                  <h3 className="font-display text-xl font-bold mb-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-primary mb-3">{product.tagline}</p>
                  <p className="text-sm text-muted-foreground mb-6 flex-grow">
                    {product.description}
                  </p>

                  {/* CTA - Always at bottom */}
                  <div className="mt-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group/btn p-0 h-auto text-primary hover:text-primary/80"
                      asChild={!!product.link && product.link !== "#"}
                    >
                      {product.link && product.link !== "#" ? (
                        <a href={product.link} className="flex items-center gap-2">
                          Learn more
                          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                        </a>
                      ) : (
                        <span className="flex items-center gap-2 text-muted-foreground cursor-not-allowed">
                          Coming soon
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Metrics Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 pt-8 border-t border-border"
        >
          {metrics.map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: 0.7 + idx * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-3xl md:text-4xl font-bold text-primary mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-muted-foreground">{metric.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

