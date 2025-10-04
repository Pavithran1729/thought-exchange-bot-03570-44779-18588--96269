import { motion } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ExtractedData {
  type: string;
  value: string;
  pattern: string;
}

interface PreviewCardProps {
  title: string;
  content: string;
  extractedData: ExtractedData[];
  onBack: () => void;
  onExport: () => void;
}

export const PreviewCard = ({ title, content, extractedData, onBack, onExport }: PreviewCardProps) => {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gradient">Live Preview</h2>
        <Badge variant="secondary" className="text-sm">
          Auto-updating
        </Badge>
      </div>

      <ScrollArea className="h-[400px] rounded-xl border border-primary/20 bg-background/30 p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {title && (
            <div>
              <h3 className="text-2xl font-bold mb-2">{title}</h3>
              <div className="h-1 w-20 bg-gradient-to-r from-primary to-transparent rounded-full" />
            </div>
          )}

          {content && (
            <div className="prose prose-invert max-w-none">
              <p className="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {content}
              </p>
            </div>
          )}

          {extractedData.length > 0 && (
            <div className="mt-8 space-y-4">
              <h4 className="text-xl font-semibold flex items-center gap-2">
                <span className="text-2xl">🔍</span>
                Extracted Data
              </h4>
              <div className="grid gap-3">
                {extractedData.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-secondary/40 border border-primary/30"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="bg-primary/20">
                        {item.type}
                      </Badge>
                      <code className="text-xs text-muted-foreground">
                        {item.pattern}
                      </code>
                    </div>
                    <p className="font-mono text-sm text-primary">
                      {item.value}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </ScrollArea>

      <div className="pt-4 border-t border-primary/20 flex gap-4">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 h-12 border-primary/50 hover:bg-primary/10"
        >
          Back to Edit
        </Button>
        <Button
          onClick={onExport}
          className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        >
          Continue to Export
        </Button>
      </div>
    </div>
  );
};
