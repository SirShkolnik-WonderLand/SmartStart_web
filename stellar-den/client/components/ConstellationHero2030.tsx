import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "./ui/button";

interface ConstellationHero2030Props {
  onBookCall: () => void;
  onExploreSmartStart: () => void;
}

export default function ConstellationHero2030({
  onBookCall,
  onExploreSmartStart,
}: ConstellationHero2030Props) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background pointer-events-none" />

      {/* Animated background stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center space-y-12">
        {/* Main Headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-6"
        >
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Build differently.
              <br />
              Grow intelligently.
            </span>
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            AliceSolutions is a cybersecurity & venture studio. We design secure
            systems, automate work, and incubate startups that compound growth.
          </p>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            size="lg"
            onClick={onBookCall}
            className="text-lg px-8 py-6 shadow-glow-turquoise hover:shadow-glow-plasma transition-all duration-300"
          >
            Book a Strategy Call
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onExploreSmartStart}
            className="text-lg px-8 py-6 border-2 border-primary/50 hover:bg-primary/10"
          >
            Explore SmartStart
          </Button>
        </motion.div>

        {/* Constellation Visual (simplified for now) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="relative h-64 md:h-80"
        >
          {/* Central node - AliceSolutions */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-display font-bold text-background shadow-glow-turquoise"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(29, 224, 193, 0.5)",
                  "0 0 40px rgba(29, 224, 193, 0.8)",
                  "0 0 20px rgba(29, 224, 193, 0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              AS
            </motion.div>
          </div>

          {/* Orbiting nodes */}
          {[
            { name: "SmartStart", angle: 0, color: "#10B981" },
            { name: "ISO", angle: 60, color: "#8B5CF6" },
            { name: "Syncary", angle: 120, color: "#EC4899" },
            { name: "DriftLock", angle: 180, color: "#EF4444" },
            { name: "Delta", angle: 240, color: "#F59E0B" },
            { name: "BUZ", angle: 300, color: "#6A5CFF" },
          ].map((node, idx) => {
            const radius = 140;
            const x = Math.cos((node.angle * Math.PI) / 180) * radius;
            const y = Math.sin((node.angle * Math.PI) / 180) * radius;

            return (
              <motion.div
                key={node.name}
                className="absolute left-1/2 top-1/2"
                style={{
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 + idx * 0.1 }}
              >
                <motion.div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold text-background cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: node.color }}
                  whileHover={{ scale: 1.2 }}
                  animate={{
                    boxShadow: [
                      `0 0 10px ${node.color}40`,
                      `0 0 20px ${node.color}80`,
                      `0 0 10px ${node.color}40`,
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                >
                  {node.name.slice(0, 2).toUpperCase()}
                </motion.div>

                {/* Connection line to center */}
                <svg
                  className="absolute left-1/2 top-1/2 pointer-events-none"
                  style={{
                    width: `${Math.abs(x) * 2}px`,
                    height: `${Math.abs(y) * 2}px`,
                    transform: `translate(-50%, -50%)`,
                  }}
                >
                  <motion.line
                    x1="50%"
                    y1="50%"
                    x2={x < 0 ? "100%" : "0%"}
                    y2={y < 0 ? "100%" : "0%"}
                    stroke={node.color}
                    strokeWidth="1"
                    strokeOpacity="0.3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1, delay: 0.8 + idx * 0.1 }}
                  />
                </svg>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-sm">Discover Our Ecosystem</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown className="w-6 h-6" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

