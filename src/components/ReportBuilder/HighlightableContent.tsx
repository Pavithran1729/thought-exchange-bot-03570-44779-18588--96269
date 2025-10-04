import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import type { ExtractedDataWithPosition } from "@/utils/regexProcessor";

interface HighlightableContentProps {
  content: string;
  extractedData: ExtractedDataWithPosition[];
  isHighlightMode: boolean;
}

const dataTypeColors: Record<string, string> = {
  Email: "bg-blue-500/20 border-blue-500/40 text-blue-700 dark:text-blue-300",
  Phone: "bg-green-500/20 border-green-500/40 text-green-700 dark:text-green-300",
  Date: "bg-purple-500/20 border-purple-500/40 text-purple-700 dark:text-purple-300",
  Currency: "bg-yellow-500/20 border-yellow-500/40 text-yellow-700 dark:text-yellow-300",
  URL: "bg-pink-500/20 border-pink-500/40 text-pink-700 dark:text-pink-300",
  Time: "bg-orange-500/20 border-orange-500/40 text-orange-700 dark:text-orange-300",
  Percentage: "bg-cyan-500/20 border-cyan-500/40 text-cyan-700 dark:text-cyan-300",
  SSN: "bg-red-500/20 border-red-500/40 text-red-700 dark:text-red-300",
  "IP Address": "bg-indigo-500/20 border-indigo-500/40 text-indigo-700 dark:text-indigo-300",
  Hashtag: "bg-teal-500/20 border-teal-500/40 text-teal-700 dark:text-teal-300",
};

export const HighlightableContent = ({ 
  content, 
  extractedData, 
  isHighlightMode 
}: HighlightableContentProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!isHighlightMode || extractedData.length === 0) {
    return <>{content}</>;
  }

  // Sort by position to process in order
  const sortedData = [...extractedData].sort((a, b) => a.startIndex - b.startIndex);

  const handleCopy = (value: string, type: string) => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
      duration: 2000,
    });
  };

  // Build segments with highlighted portions
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;

  sortedData.forEach((item, idx) => {
    // Add text before this match
    if (item.startIndex > lastIndex) {
      segments.push(
        <span key={`text-${lastIndex}`}>
          {content.substring(lastIndex, item.startIndex)}
        </span>
      );
    }

    // Add highlighted match
    const colorClass = dataTypeColors[item.type] || "bg-gray-500/20 border-gray-500/40";
    
    segments.push(
      <motion.span
        key={`highlight-${idx}`}
        className={`relative inline-block px-1 rounded border cursor-pointer transition-all ${colorClass}`}
        onMouseEnter={() => setHoveredIndex(idx)}
        onMouseLeave={() => setHoveredIndex(null)}
        onClick={() => handleCopy(item.value, item.type)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {item.value}
        
        {/* Tooltip */}
        {hoveredIndex === idx && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none"
          >
            <div className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2 whitespace-nowrap">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {item.type}
                </Badge>
                <span className="text-xs text-muted-foreground">Click to copy</span>
              </div>
            </div>
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 rotate-45 bg-popover border-r border-b border-border" />
          </motion.div>
        )}
      </motion.span>
    );

    lastIndex = item.endIndex;
  });

  // Add remaining text
  if (lastIndex < content.length) {
    segments.push(
      <span key={`text-${lastIndex}`}>
        {content.substring(lastIndex)}
      </span>
    );
  }

  return <>{segments}</>;
};
