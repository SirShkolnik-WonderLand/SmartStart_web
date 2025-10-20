import { useInView } from "@/hooks/useInView";

export default function VisionSection() {
  const { ref, isInView } = useInView();

  return (
    <section ref={ref} className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none" />

      <div className="relative mx-auto max-w-4xl">
        <div className="text-center">
          {/* Main Vision Statement */}
          <blockquote className={`mb-12 transition-all duration-700 ${
            isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}>
            <p className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight mb-8 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              We believe technology should serve growth — not greed.
            </p>
          </blockquote>

          {/* Founder Bio */}
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Founded by{" "}
              <span className="font-semibold text-foreground">Udi Shkolnik</span>
              , CISSP / CISM / ISO 27001 Lead Auditor.
            </p>

            <p>
              We fuse creative technology, ethical security, and venture building
              to empower founders and innovators. Our mission is to create tools
              and ecosystems that amplify human potential while maintaining
              uncompromising standards for privacy, security, and compliance.
            </p>

            <p className="text-primary font-semibold">
              Every product we build, every partnership we forge, and every
              solution we deliver is guided by a simple principle: help people and
              businesses grow differently.
            </p>
          </div>

          {/* Identity Keywords */}
          <div className="mt-16 flex flex-wrap justify-center gap-3">
            {["Intelligent", "Ethical", "Futuristic", "Secure", "Human-First"].map(
              (keyword, index) => (
                <span
                  key={index}
                  className="px-4 py-2 rounded-full border border-primary/30 bg-primary/5 text-primary font-medium text-sm transition-all duration-300 hover:border-primary/60 hover:bg-primary/10"
                >
                  {keyword}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
