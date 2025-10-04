import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Clock, 
  Hash, 
  AlignLeft, 
  BarChart3,
  TrendingUp,
  BookOpen,
  X
} from "lucide-react";
import { calculateContentStats, analyzeSentiment, calculateReadability } from "@/utils/analytics";
import { Button } from "@/components/ui/button";

interface StatisticsPanelProps {
  title: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
}

export const StatisticsPanel = ({ title, content, isOpen, onClose }: StatisticsPanelProps) => {
  const stats = calculateContentStats(content);
  const sentiment = analyzeSentiment(content);
  const readability = calculateReadability(content);

  const statItems = [
    {
      icon: Hash,
      label: "Words",
      value: stats.wordCount.toLocaleString(),
      color: "text-blue-500",
    },
    {
      icon: FileText,
      label: "Characters",
      value: stats.characterCount.toLocaleString(),
      color: "text-green-500",
    },
    {
      icon: AlignLeft,
      label: "Paragraphs",
      value: stats.paragraphCount.toLocaleString(),
      color: "text-purple-500",
    },
    {
      icon: Clock,
      label: "Reading Time",
      value: `${stats.readingTimeMinutes} min`,
      color: "text-orange-500",
    },
  ];

  const advancedStats = [
    {
      label: "Sentences",
      value: stats.sentenceCount.toLocaleString(),
    },
    {
      label: "Avg Words/Sentence",
      value: stats.avgWordsPerSentence.toString(),
    },
    {
      label: "Avg Sentences/Paragraph",
      value: stats.avgSentencesPerParagraph.toString(),
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-background border-l border-border z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Statistics</h3>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Basic Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                {statItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                        <span className="text-xs text-muted-foreground">{item.label}</span>
                      </div>
                      <p className="text-2xl font-bold">{item.value}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <Separator />

              {/* Advanced Stats */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Detailed Metrics
                </h4>
                <div className="space-y-2">
                  {advancedStats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.05 }}
                      className="flex justify-between items-center p-3 rounded-lg bg-muted/30"
                    >
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                      <span className="text-sm font-semibold">{stat.value}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Sentiment Analysis */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Sentiment
                </h4>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Overall Tone</span>
                    <Badge 
                      variant="outline" 
                      className="border-2"
                      style={{ borderColor: sentiment.color, color: sentiment.color }}
                    >
                      {sentiment.label}
                    </Badge>
                  </div>
                </Card>
              </motion.div>

              {/* Readability */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-3"
              >
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  Readability
                </h4>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Complexity</span>
                    <Badge 
                      variant="outline" 
                      className="border-2"
                      style={{ borderColor: readability.color, color: readability.color }}
                    >
                      {readability.level}
                    </Badge>
                  </div>
                </Card>
              </motion.div>

              {/* Title Stats */}
              {title && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Title</h4>
                    <Card className="p-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Characters</span>
                        <span className="font-semibold">{title.length}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm mt-2">
                        <span className="text-muted-foreground">Words</span>
                        <span className="font-semibold">
                          {title.split(/\s+/).filter(w => w.length > 0).length}
                        </span>
                      </div>
                    </Card>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
