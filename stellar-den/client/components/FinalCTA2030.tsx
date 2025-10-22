import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { Calendar, Rocket, Mail } from "lucide-react";
import { Button } from "./ui/button";

interface FinalCTA2030Props {
  onBookCall?: () => void;
}

export default function FinalCTA2030({ onBookCall }: FinalCTA2030Props) {
  const { ref, isInView } = useInView();

  return (
    <section ref={ref} className="px-4 py-24">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/5 to-background p-12 md:p-16 text-center"
        >
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
          <div
            className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"
            style={{ animationDelay: "2s" }}
          />

          {/* Content */}
          <div className="relative z-10 space-y-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="font-display text-3xl md:text-4xl lg:text-5xl font-bold"
            >
              Let's de-risk, automate, and grow your business.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Whether you need security, automation, or a venture partner, we're
              here to help you build differently.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                onClick={onBookCall}
                className="text-lg px-8 py-6 shadow-glow-turquoise hover:shadow-glow-plasma transition-all duration-300"
              >
                <Calendar className="mr-2 w-5 h-5" />
                Book a Strategy Call
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-primary/50 hover:bg-primary/10"
                asChild
              >
                <a href="/smartstart-hub">
                  <Rocket className="mr-2 w-5 h-5" />
                  Start SmartStart
                </a>
              </Button>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="pt-8 border-t border-border/50 space-y-2"
            >
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <a
                  href="mailto:udi.shkolnik@alicesolutionsgroup.com"
                  className="hover:text-primary transition-colors"
                >
                  udi.shkolnik@alicesolutionsgroup.com
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                Toronto, Ontario · Response within 24 hours
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

