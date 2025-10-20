import { useState } from "react";
import { ArrowRight, Lock, Zap, Users, Code, TrendingUp, Globe } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const ventures = [
  {
    id: 1,
    title: "SmartStart",
    tagline: "Founding framework for digital-first companies",
    description: "Turn ideas into validated products in weeks, not months.",
    icon: Zap,
    color: "from-primary/20 to-primary/5",
    accentColor: "text-primary",
  },
  {
    id: 2,
    title: "BizForge",
    tagline: "No-code automation for SMBs",
    description: "Empower your team with intelligent workflow automation.",
    icon: Code,
    color: "from-accent/20 to-accent/5",
    accentColor: "text-accent",
  },
  {
    id: 3,
    title: "Syncary",
    tagline: "Privacy-first data synchronization",
    description: "Seamlessly integrate systems without compromising security.",
    icon: Users,
    color: "from-primary/20 to-primary/5",
    accentColor: "text-primary",
  },
  {
    id: 4,
    title: "CISO-as-a-Service",
    tagline: "Fractional cybersecurity leadership",
    description: "Enterprise-grade security governance, accessible to all.",
    icon: Lock,
    color: "from-accent/20 to-accent/5",
    accentColor: "text-accent",
  },
  {
    id: 5,
    title: "BUZ Token Ledger",
    tagline: "Transparent compliance tracking",
    description: "Real-time auditing and regulatory compliance made simple.",
    icon: TrendingUp,
    color: "from-primary/20 to-primary/5",
    accentColor: "text-primary",
  },
  {
    id: 6,
    title: "Ecosystem Platform",
    tagline: "Connect, scale, and grow together",
    description: "Join our network of innovators, builders, and leaders.",
    icon: Globe,
    color: "from-accent/20 to-accent/5",
    accentColor: "text-accent",
  },
];

interface EcosystemGridProps {
  onDiscoverClick?: (ventureId: number) => void;
}

export default function EcosystemGrid({ onDiscoverClick }: EcosystemGridProps) {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const { ref, isInView } = useInView();

  return (
    <section ref={ref} className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
            The Ecosystem
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A network of complementary products and services designed to help
            founders, builders, and enterprises thrive in the digital age.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
          {ventures.map((venture, index) => {
            const Icon = venture.icon;
            return (
              <div
                key={venture.id}
                className={`group relative overflow-hidden rounded-2xl transition-all duration-700 ${
                  index === 0 || index === 4 ? "lg:col-span-2" : ""
                } ${index === 5 ? "lg:col-span-1" : ""} ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: isInView ? `${index * 100}ms` : "0ms" }}
                onMouseEnter={() => setHoveredId(venture.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Background with gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${venture.color} transition-all duration-500 ${
                    hoveredId === venture.id ? "scale-105" : "scale-100"
                  }`}
                />

                {/* Glass border effect */}
                <div className="absolute inset-0 border border-white/10 dark:border-white/5 rounded-2xl" />

                {/* Content */}
                <div className="relative p-8 h-full flex flex-col justify-between min-h-80">
                  {/* Icon and Title */}
                  <div>
                    <div
                      className={`mb-4 inline-block p-3 rounded-lg bg-white/10 dark:bg-white/5 transition-all duration-300 ${venture.accentColor}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="text-2xl font-semibold mb-2">
                      {venture.title}
                    </h3>
                    <p className="text-sm font-medium text-primary mb-2">
                      {venture.tagline}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {venture.description}
                    </p>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => onDiscoverClick?.(venture.id)}
                    className="group/btn mt-6 inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300"
                  >
                    <span>Discover</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>

                {/* Hover lift effect */}
                {hoveredId === venture.id && (
                  <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-2xl shadow-primary/20 dark:shadow-primary/10" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
