import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExtractedDataChips } from "./ExtractedDataChips";
import { StatisticsPanel } from "./StatisticsPanel";
import { HighlightableContent } from "./HighlightableContent";
import { TemplateSelector } from "./TemplateSelector";
import { Eye, Code, Download, BarChart3, Highlighter, Monitor, Smartphone, Tablet } from "lucide-react";
import { processTextWithPositions } from "@/utils/regexProcessor";
import { getTemplate } from "@/utils/templates";
import type { ExtractedData } from "@/utils/regexProcessor";

interface PreviewPanelProps {
  title: string;
  content: string;
  extractedData: ExtractedData[];
  onExportClick: () => void;
}

export const PreviewPanel = ({ title, content, extractedData, onExportClick }: PreviewPanelProps) => {
  const hasContent = title || content;
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('default');
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isTyping, setIsTyping] = useState(false);
  
  const template = getTemplate(selectedTemplate);
  const extractedDataWithPositions = processTextWithPositions(content);
  
  const viewModeWidths = {
    desktop: 'w-full',
    tablet: 'max-w-2xl mx-auto',
    mobile: 'max-w-sm mx-auto',
  };

  return (
    <Card className="glass-morphism border-primary/20 h-full flex flex-col">
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Live Preview
            </CardTitle>
            {hasContent && (
              <Button 
                onClick={onExportClick}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            )}
          </div>
          
          {hasContent && (
            <div className="flex flex-wrap items-center gap-2">
              <TemplateSelector 
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
              />
              
              <Button
                variant={isHighlightMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsHighlightMode(!isHighlightMode)}
                className="gap-2"
                disabled={extractedData.length === 0}
              >
                <Highlighter className="h-4 w-4" />
                <span className="hidden sm:inline">Highlight</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStatsOpen(true)}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Stats</span>
              </Button>
              
              <div className="flex items-center gap-1 ml-auto">
                <Button
                  variant={viewMode === 'desktop' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('desktop')}
                  className="px-2"
                >
                  <Monitor className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'tablet' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('tablet')}
                  className="px-2"
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'mobile' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('mobile')}
                  className="px-2"
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col">
        {!hasContent ? (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div className="space-y-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Eye className="h-10 w-10 text-primary/50" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-muted-foreground">
                  Your Report Preview
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Enter a title and click "Generate Report" to see your content here in real-time
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`transition-all duration-300 ${viewModeWidths[viewMode]}`}>
            <Tabs defaultValue="formatted" className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start bg-muted/50">
                <TabsTrigger value="formatted" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Formatted
                </TabsTrigger>
                <TabsTrigger value="raw" className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  Raw Text
                </TabsTrigger>
                {isHighlightMode && extractedData.length > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    <Highlighter className="h-3 w-3 mr-1" />
                    {extractedData.length} items
                  </Badge>
                )}
              </TabsList>

              <TabsContent value="formatted" className="flex-1 overflow-y-auto mt-4 space-y-4">
                <motion.div
                  key={selectedTemplate}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`${template.styles.colors.background} p-6 rounded-lg transition-all`}
                >
                  {title && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="space-y-2"
                    >
                      <h1 className={`text-${template.styles.fontSize.h1} font-bold ${template.styles.fontFamily.heading} ${template.styles.colors.heading}`}>
                        {title}
                      </h1>
                      {template.styles.decoration.accentBar && (
                        <motion.div 
                          className="h-1 w-20 bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: 80 }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                        />
                      )}
                    </motion.div>
                  )}
                  
                  {content && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className={`prose prose-invert max-w-none ${template.styles.spacing.section}`}
                    >
                      <ReactMarkdown
                        components={{
                          h1: ({ ...props }) => (
                            <h1 className={`text-${template.styles.fontSize.h2} font-bold mt-6 mb-3 ${template.styles.fontFamily.heading} ${template.styles.colors.heading}`} {...props} />
                          ),
                          h2: ({ ...props }) => (
                            <h2 className={`text-${template.styles.fontSize.h3} font-bold mt-5 mb-2 ${template.styles.fontFamily.heading} ${template.styles.colors.heading}`} {...props} />
                          ),
                          h3: ({ ...props }) => (
                            <h3 className={`text-${template.styles.fontSize.h3} font-bold mt-4 mb-2 ${template.styles.fontFamily.heading} ${template.styles.colors.heading}`} {...props} />
                          ),
                          p: ({ ...props }) => (
                            <p className={`text-${template.styles.fontSize.body} ${template.styles.fontFamily.body} ${template.styles.colors.body} leading-relaxed ${template.styles.spacing.paragraph}`} {...props} />
                          ),
                          strong: ({ ...props }) => (
                            <strong className="font-bold text-primary" {...props} />
                          ),
                          em: ({ ...props }) => (
                            <em className="italic" {...props} />
                          ),
                          code: ({ inline, ...props }: any) => 
                            inline ? (
                              <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-accent" {...props} />
                            ) : (
                              <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto" {...props} />
                            ),
                          ul: ({ ...props }) => (
                            <ul className="list-disc list-inside space-y-2 my-4" {...props} />
                          ),
                          ol: ({ ...props }) => (
                            <ol className="list-decimal list-inside space-y-2 my-4" {...props} />
                          ),
                          li: ({ ...props }) => (
                            <li className="ml-4" {...props} />
                          ),
                          blockquote: ({ ...props }) => (
                            <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground" {...props} />
                          ),
                          hr: ({ ...props }) => (
                            <hr className="my-8 border-border" {...props} />
                          ),
                        }}
                      >
                        {content}
                      </ReactMarkdown>
                    </motion.div>
                  )}

                  {extractedData.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="pt-6 border-t border-border mt-6"
                    >
                      <ExtractedDataChips data={extractedData} />
                    </motion.div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="raw" className="flex-1 overflow-y-auto mt-4">
                <pre className="text-sm bg-muted/30 p-4 rounded-lg whitespace-pre-wrap font-mono">
                  {content || "No content generated yet..."}
                </pre>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
      
      {/* Statistics Panel */}
      <StatisticsPanel
        title={title}
        content={content}
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
      />
    </Card>
  );
};
