import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import ConstellationBackground from "./ConstellationBackground";
import { useTypewriter } from "@/hooks/useTypewriter";

interface HeroProps {
  onWorkWithUs: () => void;
  onExplore: () => void;
}

const headlinePhrases = [
  "Building together, growing differently",
  "Where ideas become reality",
  "Community that empowers builders",
  "Helping you build what matters",
  "Together we grow stronger",
];

const subtitlePhrases = [
  "WonderLand is where ideas are born. SmartStart is where those ideas become real.",
  "Join a community of builders, creators, and innovators who support each other.",
  "From concept to execution — we provide the tools, mentorship, and security you need.",
  "A place where entrepreneurs help entrepreneurs. Where builders support builders.",
  "Real growth happens when people come together to build something meaningful.",
];

export default function Hero({ onWorkWithUs, onExplore }: HeroProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { displayedText: animatedHeadline } = useTypewriter({
    texts: headlinePhrases,
    typingSpeed: 50,
    deletingSpeed: 30,
    delayBetweenTexts: 4000,
    loop: true,
  });

  const { displayedText: animatedSubtitle } = useTypewriter({
    texts: subtitlePhrases,
    typingSpeed: 40,
    deletingSpeed: 25,
    delayBetweenTexts: 4000,
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
          {/* Main Headline with Typewriter */}
          <div
            className={`space-y-6 transition-all duration-700 ${
              isLoaded ? "opacity-100" : "opacity-0 translate-y-4"
            }`}
          >
            <h1 className="hero-text animate-fade-in text-foreground min-h-[120px] md:min-h-[140px] flex items-center justify-center">
              <span className="relative inline-block">
                <span className="relative z-10">{animatedHeadline}</span>
                <span
                  className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-primary/50 animate-fade-in"
                  style={{ animationDelay: "0.3s" }}
                />
                <span className="inline-block w-[3px] h-[1.2em] bg-primary ml-1 animate-pulse" />
              </span>
            </h1>

            {/* Subheading with Typewriter */}
            <p
              className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground animate-fade-in min-h-[80px] flex items-center justify-center"
              style={{ animationDelay: "0.2s" }}
            >
              {animatedSubtitle}
              <span className="inline-block w-[3px] h-[1.2em] bg-primary ml-1 animate-pulse" />
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
