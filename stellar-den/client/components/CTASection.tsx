import { Mic, ArrowRight } from "lucide-react";
import { useInView } from "@/hooks/useInView";

interface CTASectionProps {
  onTalkToAlice: () => void;
  onJoinHub: () => void;
}

export default function CTASection({ onTalkToAlice, onJoinHub }: CTASectionProps) {
  const { ref, isInView } = useInView();

  return (
    <section ref={ref} className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none" />

      <div className="relative mx-auto max-w-4xl">
        {/* Main CTA Card */}
        <div className={`group relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-background backdrop-blur-glass p-12 md:p-16 text-center transition-all duration-700 ${
          isInView ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}>
          {/* Animated background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: "2s" }} />

          {/* Content */}
          <div className="relative z-10 space-y-8">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6">
                Join our ecosystem
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                From startups to enterprises, from dreamers to doers. Whether you're
                looking to build, secure, or scale—we're here to help you grow
                differently.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onTalkToAlice}
                className="group/btn inline-flex items-center justify-center gap-2 rounded-lg px-8 py-4 font-semibold bg-primary text-primary-foreground transition-all duration-300 hover:shadow-glow-teal dark:hover:shadow-glow-cyan hover:scale-105 active:scale-95"
              >
                <Mic className="h-4 w-4" />
                <span>Talk to Alice</span>
                <span className="inline-block transition-transform group-hover/btn:translate-x-1">
                  →
                </span>
              </button>

              <button
                onClick={onJoinHub}
                className="group/btn inline-flex items-center justify-center gap-2 rounded-lg px-8 py-4 font-semibold border border-primary bg-transparent text-primary transition-all duration-300 hover:bg-primary/10"
              >
                <span>Join AliceSolutionsGroup</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Border glow on hover */}
          <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 shadow-2xl shadow-primary/20 dark:shadow-primary/10 pointer-events-none transition-opacity duration-500" />
        </div>

        {/* Decorative elements */}
        <div className="mt-16 text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            Not sure where to start?
          </p>
          <button className="text-primary font-semibold hover:underline inline-flex items-center gap-2 transition-all duration-300 hover:gap-3">
            <span>Explore our ventures →</span>
          </button>
        </div>
      </div>
    </section>
  );
}
