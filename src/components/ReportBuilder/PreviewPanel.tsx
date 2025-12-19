import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { RichTextEditor } from "./RichTextEditor";
import { PageView } from "./PageView";
import { DocumentOutline } from "./DocumentOutline";
import { SectionContextMenu } from "./SectionContextMenu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExtractedDataChips } from "./ExtractedDataChips";
import { StatisticsPanel } from "./StatisticsPanel";
import { HighlightableContent } from "./HighlightableContent";
import { TemplateSelector } from "./TemplateSelector";
import { Eye, Code, Download, BarChart3, Highlighter, Monitor, Smartphone, Tablet, Edit, Save, FileText, ScrollText, PanelLeftClose, PanelLeft } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { processTextWithPositions, processAcademicText } from "@/utils/regexProcessor";
import { getTemplate } from "@/utils/templates";
import type { ExtractedData } from "@/utils/regexProcessor";

interface PreviewPanelProps {
  title: string;
  content: string;
  extractedData: ExtractedData[];
  onExportClick: () => void;
  selectedTemplateId?: string;
  onContentChange?: (content: string) => void;
  onTitleChange?: (title: string) => void;
}

export const PreviewPanel = ({ 
  title, 
  content, 
  extractedData, 
  onExportClick,
  selectedTemplateId = "default",
  onContentChange,
  onTitleChange
}: PreviewPanelProps) => {
  const hasContent = title || content;
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(selectedTemplateId);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewType, setPreviewType] = useState<'scroll' | 'page'>('scroll');
  const [showOutline, setShowOutline] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableContent, setEditableContent] = useState(content);
  const [editableTitle, setEditableTitle] = useState(title);
  
  // Context menu state for text selection enhancement
  const [contextMenu, setContextMenu] = useState<{
    show: boolean;
    position: { x: number; y: number };
    selectedText: string;
  }>({ show: false, position: { x: 0, y: 0 }, selectedText: '' });
  
  useEffect(() => {
    setEditableContent(content);
  }, [content]);
  
  useEffect(() => {
    setEditableTitle(title);
  }, [title]);
  
  // Update selected template when prop changes
  useEffect(() => {
    setSelectedTemplate(selectedTemplateId);
  }, [selectedTemplateId]);

  // Handle text selection for context menu
  const handleTextSelection = useCallback((e: React.MouseEvent) => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';
    
    if (selectedText && selectedText.length > 10) {
      setContextMenu({
        show: true,
        position: { x: e.clientX, y: e.clientY },
        selectedText,
      });
    }
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenu(prev => ({ ...prev, show: false }));
  }, []);

  const handleEnhancedContent = useCallback((enhancedContent: string) => {
    // Replace selected text with enhanced content
    const selection = window.getSelection();
    if (selection && contextMenu.selectedText) {
      const newContent = editableContent.replace(contextMenu.selectedText, enhancedContent);
      setEditableContent(newContent);
      onContentChange?.(newContent);
    }
    handleContextMenuClose();
  }, [contextMenu.selectedText, editableContent, onContentChange, handleContextMenuClose]);
  
  const template = getTemplate(selectedTemplate);
  const extractedDataWithPositions = processAcademicText(content);
  
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
              <Button
                variant={isEditMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (isEditMode) {
                    onContentChange?.(editableContent);
                    onTitleChange?.(editableTitle);
                  }
                  setIsEditMode(!isEditMode);
                }}
                className="gap-2"
              >
                {isEditMode ? (
                  <>
                    <Save className="h-4 w-4" />
                    <span className="hidden sm:inline">Save</span>
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </>
                )}
              </Button>
              
              {!isEditMode && (
                <>
                  <TemplateSelector 
                    selectedTemplate={selectedTemplate}
                    onTemplateChange={setSelectedTemplate}
                  />
                  
                  <Button
                    variant={isHighlightMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsHighlightMode(!isHighlightMode)}
                    className="gap-2"
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
                </>
              )}
              
              <div className="flex items-center gap-1 ml-auto">
                {/* Preview type toggle */}
                <div className="flex items-center gap-1 mr-2 border-r border-border pr-2">
                  <Button
                    variant={previewType === 'scroll' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewType('scroll')}
                    className="px-2 gap-1"
                    title="Scroll View"
                  >
                    <ScrollText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={previewType === 'page' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPreviewType('page')}
                    className="px-2 gap-1"
                    title="Page View (MS Word style)"
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>

                {/* Outline toggle */}
                <Button
                  variant={showOutline ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowOutline(!showOutline)}
                  className="px-2"
                  title="Document Outline"
                >
                  {showOutline ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
                </Button>

                {/* Responsive view modes */}
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
      <CardContent className="flex-1 overflow-auto flex flex-col">
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
        ) : isEditMode ? (
          <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-background rounded-lg">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Title</label>
                <Input
                  value={editableTitle}
                  onChange={(e) => setEditableTitle(e.target.value)}
                  className="text-2xl font-bold h-auto py-3"
                  placeholder="Report title..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Content</label>
                <RichTextEditor
                  content={editableContent}
                  onChange={setEditableContent}
                />
              </div>
            </div>
          </div>
        ) : previewType === 'page' ? (
          <div className="flex h-full">
            {/* Document Outline Sidebar */}
            {showOutline && (
              <DocumentOutline 
                content={content} 
                className="w-64 shrink-0"
              />
            )}
            
            {/* Page View */}
            <div className={`flex-1 transition-all duration-300 ${viewModeWidths[viewMode]}`}>
              <PageView title={title} content={content} className="h-full" />
            </div>
          </div>
        ) : (
          <div className="flex h-full">
            {/* Document Outline Sidebar */}
            {showOutline && (
              <DocumentOutline 
                content={content} 
                className="w-64 shrink-0"
              />
            )}
            
            <div className={`flex-1 transition-all duration-300 ${viewModeWidths[viewMode]}`}>
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

              <TabsContent value="formatted" className="flex-1 overflow-y-auto mt-4 space-y-4" onMouseUp={handleTextSelection}>
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
                        remarkPlugins={[remarkMath, remarkGfm]}
                        rehypePlugins={[rehypeKatex]}
                        components={{
                          h1: ({ ...props }) => (
                            <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground border-b border-border pb-2" {...props} />
                          ),
                          h2: ({ ...props }) => (
                            <h2 className="text-2xl font-bold mt-6 mb-3 text-foreground" {...props} />
                          ),
                          h3: ({ ...props }) => (
                            <h3 className="text-xl font-semibold mt-5 mb-2 text-foreground" {...props} />
                          ),
                          h4: ({ ...props }) => (
                            <h4 className="text-lg font-semibold mt-4 mb-2 text-foreground" {...props} />
                          ),
                          p: ({ ...props }) => (
                            <p className="text-base leading-7 mb-4 text-foreground/90" {...props} />
                          ),
                          strong: ({ ...props }) => (
                            <strong className="font-bold text-foreground" {...props} />
                          ),
                          em: ({ ...props }) => (
                            <em className="italic text-foreground/90" {...props} />
                          ),
                          code: ({ inline, ...props }: any) => 
                            inline ? (
                              <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono text-primary border border-border" {...props} />
                            ) : (
                              <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto border border-border my-4" {...props} />
                            ),
                          pre: ({ ...props }) => (
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto border border-border my-4" {...props} />
                          ),
                          ul: ({ ...props }) => (
                            <ul className="list-disc ml-6 space-y-2 my-4 text-foreground/90" {...props} />
                          ),
                          ol: ({ ...props }) => (
                            <ol className="list-decimal ml-6 space-y-2 my-4 text-foreground/90" {...props} />
                          ),
                          li: ({ ...props }) => (
                            <li className="leading-7" {...props} />
                          ),
                          blockquote: ({ ...props }) => (
                            <blockquote className="border-l-4 border-primary pl-6 py-2 my-4 italic text-muted-foreground bg-muted/30 rounded-r" {...props} />
                          ),
                          hr: ({ ...props }) => (
                            <hr className="my-8 border-border" {...props} />
                          ),
                          table: ({ ...props }) => (
                            <div className="overflow-x-auto my-6">
                              <table className="min-w-full border-collapse border border-border" {...props} />
                            </div>
                          ),
                          thead: ({ ...props }) => (
                            <thead className="bg-muted" {...props} />
                          ),
                          tbody: ({ ...props }) => (
                            <tbody className="divide-y divide-border" {...props} />
                          ),
                          tr: ({ ...props }) => (
                            <tr className="border-b border-border hover:bg-muted/50 transition-colors" {...props} />
                          ),
                          th: ({ ...props }) => (
                            <th className="px-4 py-3 text-left font-semibold text-foreground border border-border" {...props} />
                          ),
                          td: ({ ...props }) => (
                            <td className="px-4 py-3 text-foreground/90 border border-border" {...props} />
                          ),
                          a: ({ ...props }) => (
                            <a className="text-primary underline hover:text-primary/80 transition-colors" {...props} />
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
      
      {/* Context Menu for Section Enhancement */}
      {contextMenu.show && (
        <SectionContextMenu
          selectedText={contextMenu.selectedText}
          position={contextMenu.position}
          onClose={handleContextMenuClose}
          onEnhancedContent={handleEnhancedContent}
        />
      )}
    </Card>
  );
};
