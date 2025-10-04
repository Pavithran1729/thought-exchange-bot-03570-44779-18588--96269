import { motion } from "framer-motion";

export const BackgroundEffects = () => {
  return (
    <>
      {/* Gradient glow at top */}
      <div className="fixed top-0 left-0 w-full h-96 bg-[var(--gradient-glow)] pointer-events-none" />
      
      {/* Organic flowing shapes */}
      <motion.div
        className="fixed top-20 left-10 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="fixed bottom-20 right-10 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -30, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/3 blur-3xl"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(188 94% 43% / 0.5) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(188 94% 43% / 0.5) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </>
  );
};
