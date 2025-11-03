import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { Quote, CheckCircle2 } from "lucide-react";

export default function TrustLayer2030() {
  const { ref, isInView } = useInView();

  const clients = [
    { name: "Helen Doron", logo: "HD" },
    { name: "Plasan Sasa", logo: "PS" },
    { name: "Cannabis.co.il", logo: "CN" },
    { name: "LGM", logo: "LG" },
  ];

  const testimonials = [
    {
      quote:
        "ISO readiness in weeks, not months—and we actually understood the why.",
      author: "Ops Director",
      company: "Education",
      industry: "EdTech",
    },
    {
      quote:
        "They cut our spend and increased throughput. Security went up, costs went down.",
      author: "CTO",
      company: "Manufacturing",
      industry: "Industrial",
    },
  ];

  const achievements = [
    { icon: CheckCircle2, text: "12+ ISO Certifications Delivered" },
    { icon: CheckCircle2, text: "$150K/month Average Cost Savings" },
    { icon: CheckCircle2, text: "1000+ Projects Completed" },
  ];

  return (
    <section ref={ref} className="px-4 py-24">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            From healthcare to manufacturing, we help teams ship securely and
            scale intelligently.
          </p>
        </motion.div>

        {/* Logo Row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative overflow-hidden py-8"
        >
          <div className="flex justify-center items-center gap-12 md:gap-16 flex-wrap">
            {clients.map((client, idx) => (
              <motion.div
                key={client.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.3 + idx * 0.1 }}
                className="group relative"
              >
                {/* Placeholder logo - replace with actual logos */}
                <div className="w-24 h-24 rounded-xl border-2 border-border bg-card flex items-center justify-center font-display text-xl font-bold text-muted-foreground group-hover:text-primary group-hover:border-primary/50 transition-all duration-300">
                  {client.logo}
                </div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {client.name}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Testimonials - Equal Height Cards */}
        <div className="grid md:grid-cols-2 gap-6 auto-rows-fr">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + idx * 0.1 }}
              className="relative flex flex-col p-8 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-glow-turquoise"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />

              {/* Content - Flex grow to fill space */}
              <div className="relative z-10 flex flex-col flex-grow">
                <p className="text-lg text-foreground mb-6 leading-relaxed italic flex-grow">
                  "{testimonial.quote}"
                </p>

                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-display font-bold text-background">
                    {testimonial.author.split(" ")[0][0]}
                    {testimonial.author.split(" ")[1]?.[0] || ""}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.company} · {testimonial.industry}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col md:flex-row justify-center items-center gap-8 pt-8 border-t border-border"
        >
          {achievements.map((achievement, idx) => {
            const Icon = achievement.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.8 + idx * 0.1 }}
                className="flex items-center gap-3"
              >
                <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm md:text-base text-muted-foreground">
                  {achievement.text}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

