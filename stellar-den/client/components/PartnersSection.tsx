import { Award, TrendingUp } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const partners = [
  { name: "LGM", logo: "LGM" },
  { name: "Plasan Sasa", logo: "PS" },
  { name: "Helen Doron", logo: "HD" },
  { name: "Cannabis.co.il", logo: "CC" },
  { name: "MovedIn Inc", logo: "MI" },
];

const cases = [
  {
    partner: "LGM",
    metric: "Cut monthly waste by $150K",
    description: "Through intelligent automation and process optimization",
    icon: TrendingUp,
  },
  {
    partner: "Helen Doron",
    metric: "Achieved ISO 27001 readiness",
    description: "In 90 days with our CISO-as-a-Service solution",
    icon: Award,
  },
];

export default function PartnersSection() {
  const { ref, isInView } = useInView();

  return (
    <section ref={ref} className="relative py-24 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
            Proof &amp; Partners
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trusted by innovative leaders and forward-thinking organizations
            across industries.
          </p>
        </div>

        {/* Partners Logos */}
        <div className="mb-20">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mb-12">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="group relative flex items-center justify-center h-16 px-6 rounded-lg border border-white/10 dark:border-white/5 bg-white/5 dark:bg-white/5 backdrop-blur-glass transition-all duration-300 hover:border-primary/30 hover:bg-primary/5"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>

          {/* Animated accent */}
          <div className="text-center text-sm text-muted-foreground opacity-60">
            + 500+ companies building with us
          </div>
        </div>

        {/* Featured Case Studies */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {cases.map((caseStudy, index) => {
            const Icon = caseStudy.icon;
            return (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-2xl border border-white/10 dark:border-white/5 bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/5 dark:to-primary/0 backdrop-blur-glass p-8 transition-all duration-700 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/20 ${
                  isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: isInView ? `${200 + index * 150}ms` : "0ms" }}
              >
                {/* Icon */}
                <div className="mb-6 p-3 w-fit rounded-lg bg-primary/20 text-primary">
                  <Icon className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-semibold mb-2">{caseStudy.partner}</h3>
                <p className="text-lg font-semibold text-primary mb-3">
                  {caseStudy.metric}
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {caseStudy.description}
                </p>

                {/* Hover effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-primary/0 to-primary/5 pointer-events-none transition-opacity duration-500" />
              </div>
            );
          })}
        </div>

        {/* Bottom accent text */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Each partnership reflects our commitment to creating measurable impact
            through intelligent innovation and ethical practices.
          </p>
        </div>
      </div>
    </section>
  );
}
