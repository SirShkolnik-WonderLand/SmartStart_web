import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star, Users, Shield, Briefcase } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      id: "smartstart-member",
      name: "Sarah Chen",
      role: "Startup Founder",
      company: "Tech Startup",
      image: "👩‍💼",
      quote: "SmartStart gave us the enterprise tools and mentorship we needed to scale securely. The Zoho suite alone saved us thousands in software costs, and the venture building track helped us navigate our Series A funding.",
      rating: 5,
      category: "SmartStart Hub",
      icon: Shield
    },
    {
      id: "community-member",
      name: "Michael Rodriguez",
      role: "Tech Professional",
      company: "Software Engineer",
      image: "👨‍💻",
      quote: "The Beer + Security events are amazing for networking and learning. I've met incredible people and learned about cutting-edge security practices. The community is welcoming and genuinely supportive.",
      rating: 5,
      category: "Community",
      icon: Users
    },
    {
      id: "pro-bono-recipient",
      name: "Lisa Thompson",
      role: "Non-Profit Director",
      company: "Local Charity",
      image: "👩",
      quote: "AliceSolutions helped us secure our systems and protect our data through their pro-bono program. Udi's expertise in healthcare privacy was invaluable, and we now have a robust security posture we couldn't afford otherwise.",
      rating: 5,
      category: "Pro-Bono Support",
      icon: Briefcase
    },
    {
      id: "automation-client",
      name: "David Kim",
      role: "Operations Manager",
      company: "Logistics Company",
      image: "👨‍💼",
      quote: "The automation clinic transformed our operations. We reduced manual work by 40% and cut costs significantly. The team's approach is practical, results-driven, and focused on real business impact.",
      rating: 5,
      category: "Automation",
      icon: Shield
    },
    {
      id: "iso-client",
      name: "Jennifer Martinez",
      role: "Compliance Officer",
      company: "Healthcare Organization",
      image: "👩‍⚕️",
      quote: "Udi guided us through ISO 27001 certification with expertise and patience. His knowledge of healthcare privacy regulations (PHIPA) was exceptional, and we achieved certification in record time.",
      rating: 5,
      category: "Compliance",
      icon: Shield
    },
    {
      id: "mentorship",
      name: "Alex Johnson",
      role: "Junior Developer",
      company: "Startup",
      image: "👨",
      quote: "The mentorship program at SmartStart helped me transition from junior to senior developer. The guidance on security best practices and automation tools accelerated my career growth significantly.",
      rating: 5,
      category: "Mentorship",
      icon: Users
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
            <Quote className="w-4 h-4" />
            <span>What Our Community Says</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            <span className="block text-foreground">Trusted by</span>
            <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Entrepreneurs & Organizations
            </span>
          </h2>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
            Don't just take our word for it. Here's what our community members, clients, and partners have to say about working with AliceSolutionsGroup.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((testimonial, index) => {
            const Icon = testimonial.icon;
            return (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-border/50 bg-card/50 backdrop-blur-xl hover:border-primary/50 transition-all duration-500 group h-full relative overflow-hidden">
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <CardContent className="p-6 relative z-10">
                    {/* Category Badge */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-xs font-medium text-primary">
                        {testimonial.category}
                      </span>
                    </div>

                    {/* Quote */}
                    <div className="mb-4">
                      <Quote className="w-8 h-8 text-primary/20 mb-3" />
                      <p className="text-muted-foreground leading-relaxed italic">
                        "{testimonial.quote}"
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                        {testimonial.image}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">
                          {testimonial.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">100+</div>
            <div className="text-sm text-muted-foreground">Community Members</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">50+</div>
            <div className="text-sm text-muted-foreground">Events Hosted</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">30+</div>
            <div className="text-sm text-muted-foreground">Startups Supported</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground mb-2">15+</div>
            <div className="text-sm text-muted-foreground">Pro-Bono Projects</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

