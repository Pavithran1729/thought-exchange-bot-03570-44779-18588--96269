import { motion } from "framer-motion";
import { ReactNode } from "react";

interface CardStackProps {
  children: ReactNode;
  index: number;
  totalCards: number;
}

export const CardStack = ({ children, index, totalCards }: CardStackProps) => {
  const offset = (totalCards - index - 1) * 8;
  const scale = 1 - (totalCards - index - 1) * 0.03;
  const opacity = 1 - (totalCards - index - 1) * 0.15;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ 
        opacity, 
        y: offset,
        scale,
        rotateX: (totalCards - index - 1) * 2
      }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={index === 0 ? { 
        scale: 1.02,
        rotateX: -2,
        transition: { duration: 0.3 }
      } : {}}
      className="absolute w-full"
      style={{
        zIndex: totalCards - index,
        transformStyle: "preserve-3d",
        perspective: "1000px"
      }}
    >
      <div className="glass-morphism rounded-2xl shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300">
        {children}
      </div>
    </motion.div>
  );
};
