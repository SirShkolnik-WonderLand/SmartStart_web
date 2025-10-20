import { Hammer, Shield, Rocket } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const pillars = [
  {
    icon: Hammer,
    title: "Build",
    description: "We turn ideas into products that matter. From concept validation to market launch, we provide the frameworks, expertise, and resources founders need to succeed.",
    color: "text-primary",
  },
  {
    icon: Shield,
    title: "Secure",
    description: "Security and privacy are baked from day zero, not bolted on later. We follow ISO 27001 principles and CISSP standards to ensure your data and systems are protected.",
    color: "text-accent",
  },
  {
    icon: Rocket,
    title: "Scale",
    description: "Automation, analytics, and human collaboration power growth. We provide the tools and insights to scale sustainably while maintaining quality and security.",
    color: "text-primary",
  },
];

export default function PhilosophySection() {
  const { ref, isInView } = useInView();

  return (
    <section ref={ref} className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/50 to-background pointer-events-none" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Title */}
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
            Build • Secure • Scale
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our philosophy guides every decision, product, and partnership we make.
          </p>
        </div>

        {/* Three Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={index}
                className={`group relative transition-all duration-700 ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: isInView ? `${index * 150}ms` : "0ms" }}
              >
                {/* Card background */}
                <div className="relative p-8 rounded-2xl border border-white/10 dark:border-white/5 bg-white/5 dark:bg-white/5 backdrop-blur-glass transition-all duration-500 hover:border-primary/30 hover:bg-primary/5 h-full">
                  {/* Icon */}
                  <div className={`mb-6 p-4 w-fit rounded-lg bg-white/10 dark:bg-white/5 ${pillar.color} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`}>
                    <Icon className="h-8 w-8" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl md:text-3xl font-semibold mb-4">
                    {pillar.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>

                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-primary to-accent transition-all duration-500 group-hover:w-full rounded-full`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
