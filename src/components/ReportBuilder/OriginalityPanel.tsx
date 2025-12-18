import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, AlertTriangle, Loader2, RefreshCw } from "lucide-react";

interface OriginalityResult {
  score: number;
  analysis: string;
  flaggedSections: { text: string; reason: string; severity: 'low' | 'medium' | 'high' }[];
  suggestions: string[];
}

interface OriginalityPanelProps {
  content: string;
}

export const OriginalityPanel = ({ content }: OriginalityPanelProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<OriginalityResult | null>(null);

  const analyzeOriginality = async () => {
    if (!content.trim()) {
      toast({ title: "No content to analyze", variant: "destructive" });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-originality', {
        body: { content }
      });

      if (error) throw error;

      setResult(data);
      toast({ title: "Analysis complete" });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({ 
        title: "Analysis failed", 
        description: "Please try again later",
        variant: "destructive" 
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/40';
      case 'medium': return 'bg-orange-500/20 text-orange-700 border-orange-500/40';
      case 'high': return 'bg-red-500/20 text-red-700 border-red-500/40';
      default: return 'bg-muted';
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Originality Check
          </CardTitle>
          <Button
            size="sm"
            variant={result ? "outline" : "default"}
            onClick={analyzeOriginality}
            disabled={isAnalyzing || !content.trim()}
            className="h-7"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Analyzing...
              </>
            ) : result ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1" />
                Re-analyze
              </>
            ) : (
              'Analyze'
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!result && !isAnalyzing && (
          <div className="text-center text-sm text-muted-foreground py-6">
            <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Click Analyze to check your content for originality</p>
            <p className="text-xs mt-1">Detects potential AI-generated or plagiarized sections</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center py-6">
            <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing content...</p>
          </div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Score Display */}
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <p className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">Originality Score</p>
              <Progress 
                value={result.score} 
                className="mt-3 h-2"
              />
            </div>

            {/* Analysis Summary */}
            <div>
              <p className="text-sm">{result.analysis}</p>
            </div>

            {/* Flagged Sections */}
            {result.flaggedSections.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Flagged Sections ({result.flaggedSections.length})
                </p>
                <ScrollArea className="h-[120px]">
                  <div className="space-y-2">
                    {result.flaggedSections.map((section, i) => (
                      <div 
                        key={i} 
                        className={`p-2 rounded border text-xs ${getSeverityColor(section.severity)}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">
                            {section.severity}
                          </Badge>
                          <span className="text-muted-foreground">{section.reason}</span>
                        </div>
                        <p className="italic">"{section.text.slice(0, 100)}..."</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2">Suggestions</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {result.suggestions.map((suggestion, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-primary">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
