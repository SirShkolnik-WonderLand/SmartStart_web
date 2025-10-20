import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import ConstellationBackground from "./ConstellationBackground";
import { useTypewriter } from "@/hooks/useTypewriter";

interface HeroProps {
  onWorkWithUs: () => void;
  onExplore: () => void;
}

const headlinePhrases = [
  "Help people and businesses grow differently",
  "Automate smarter, secure harder, scale faster",
  "Building the future of ethical innovation",
  "Where security meets creativity",
  "Empower founders, protect their vision",
];

const subtitlePhrases = [
  "We are a venture-studio and cybersecurity collective building the future of automation, privacy, and human-centric design.",
  "Turn your ideas into secure, scalable products with our proven frameworks and expert guidance.",
  "From concept to compliance—we handle security so you can focus on growth.",
  "Combining creative technology, ethical security, and venture expertise for lasting impact.",
  "Automation, innovation, and trust. That's the AliceSolutions difference.",
];

export default function Hero({ onWorkWithUs, onExplore }: HeroProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { displayedText: animatedHeadline } = useTypewriter({
    texts: headlinePhrases,
    typingSpeed: 30,
    deletingSpeed: 20,
    delayBetweenTexts: 3500,
    loop: true,
  });

  const { displayedText: animatedSubtitle } = useTypewriter({
    texts: subtitlePhrases,
    typingSpeed: 25,
    deletingSpeed: 15,
    delayBetweenTexts: 3500,
    loop: true,
  });

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="relative min-h-[calc(100vh-4rem)] md:min-h-[calc(100vh-5rem)] overflow-hidden bg-gradient-to-b from-background via-background to-background">
      {/* Constellation Background */}
      <ConstellationBackground />

      {/* Content */}
      <div className="relative z-10 flex h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 text-center">
          {/* Main Headline */}
          <div
            className={`space-y-4 transition-all duration-700 ${
              isLoaded ? "opacity-100" : "opacity-0 translate-y-4"
            }`}
          >
            <h1 className="hero-text animate-fade-in text-foreground">
              Help people and businesses{" "}
              <span className="relative inline-block">
                <span className="relative z-10">grow differently</span>
                <span
                  className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-primary/50 animate-fade-in"
                  style={{ animationDelay: "0.3s" }}
                />
              </span>
            </h1>

            {/* Subheading */}
            <p
              className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              WonderLand is the playground. SmartStart is the lab.
            </p>
            
            {/* Value Proposition */}
            <p
              className="mx-auto max-w-2xl text-base md:text-lg text-muted-foreground/80 animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              Join <strong className="text-primary">WonderLand</strong> for events and networking, or upgrade to <strong className="text-primary">SmartStart</strong> ($98.80/month) for enterprise tools, mentorship, and security.
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className="flex flex-col gap-4 sm:flex-row sm:gap-6 animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            <button
              onClick={onExplore}
              className="btn-primary group relative inline-flex items-center justify-center gap-2 rounded-lg px-8 py-4 font-semibold transition-all duration-300"
            >
              <span>Explore Our Ecosystem</span>
              <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-1" />
            </button>

            <button
              onClick={onWorkWithUs}
              className="btn-secondary group relative inline-flex items-center justify-center gap-2 rounded-lg px-8 py-4 font-semibold transition-all duration-300"
            >
              <span>Work With Us</span>
              <span className="inline-block transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-muted-foreground">Scroll to explore</span>
            <div className="h-8 w-6 rounded-full border-2 border-primary/40 flex items-center justify-center">
              <div className="h-1 w-1 rounded-full bg-primary animate-bounce" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
