import { useState, useEffect, useCallback } from "react";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { InputPanel } from "@/components/ReportBuilder/InputPanel";
import { PreviewPanel } from "@/components/ReportBuilder/PreviewPanel";
import { ExportDialog } from "@/components/ReportBuilder/ExportDialog";
import { GenerationProgress, type GenerationStage } from "@/components/ReportBuilder/GenerationProgress";
import { CitationManager } from "@/components/ReportBuilder/CitationManager";
import { FigureManager } from "@/components/ReportBuilder/FigureManager";
import { TableEditor } from "@/components/ReportBuilder/TableEditor";
import { OriginalityPanel } from "@/components/ReportBuilder/OriginalityPanel";
import { TemplateLibrary } from "@/components/ReportBuilder/TemplateLibrary";
import { processText, convertLatexToReadable, type ExtractedData } from "@/utils/regexProcessor";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ArrowLeft, LogOut, Save, FolderOpen, Wrench, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAI } from "@/hooks/useAI";
import { useReports } from "@/hooks/useReports";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_ACADEMIC_CONFIG, type AcademicReportConfig } from "@/types/academicReport";

const Generator = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState({
    title: "",
    content: "",
    extractedData: [] as ExtractedData[],
    templateId: "academic",
  });
  const [academicConfig, setAcademicConfig] = useState<AcademicReportConfig>(DEFAULT_ACADEMIC_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<GenerationStage>('idle');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<'input' | 'preview'>('input');
  
  const { signOut } = useAuth();
  const { generateReport } = useAI();
  const { saveReport } = useReports();
  const { toast } = useToast();

  // Load report from navigation state if available
  useEffect(() => {
    if (location.state?.report) {
      const report = location.state.report;
      setReportData({
        title: report.title,
        content: report.content,
        extractedData: report.extracted_data || [],
        templateId: report.template_id || "academic",
      });
      setCurrentReportId(report.id);
    }
  }, [location.state]);

  const handleCancelGeneration = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsGenerating(false);
    setGenerationStage('idle');
    toast({
      title: "Generation cancelled",
      description: "Report generation was cancelled",
    });
  }, [abortController, toast]);

  const handleGenerate = async ({
    title,
    documentContent,
    additionalInstructions,
    useRegex,
    useAI,
    templateId,
    academicConfig: inputAcademicConfig,
  }: {
    title: string;
    documentContent: string;
    additionalInstructions: string;
    useRegex: boolean;
    useAI: boolean;
    templateId?: string;
    academicConfig?: AcademicReportConfig;
  }) => {
    setIsGenerating(true);
    setGenerationStage('preparing');
    
    // Create new abort controller for this generation
    const controller = new AbortController();
    setAbortController(controller);
    
    // Store the academic config for export
    if (inputAcademicConfig) {
      setAcademicConfig(inputAcademicConfig);
    }
    
    let processedContent = "";
    let extracted: ExtractedData[] = [];

    try {
      if (useAI) {
        // Update stage to generating
        setGenerationStage('generating');
        
        // Generate report with document content, instructions, and academic config sent to AI
        const generated = await generateReport(
          title, 
          templateId || reportData.templateId,
          documentContent,
          additionalInstructions,
          inputAcademicConfig
        );
        
        if (controller.signal.aborted) {
          return;
        }
        
        if (generated) {
          processedContent = generated;
        } else {
          throw new Error("Failed to generate content");
        }
      } else if (documentContent) {
        // No AI - just use document content directly
        processedContent = documentContent;
      }

      // Update stage to processing
      setGenerationStage('processing');

      // Regex processing
      if (useRegex && processedContent) {
        processedContent = convertLatexToReadable(processedContent);
        extracted = processText(processedContent);
      }

      setReportData({
        title,
        content: processedContent,
        extractedData: extracted,
        templateId: templateId || reportData.templateId,
      });
      
      setGenerationStage('complete');
      
      // Switch to preview on mobile after generation
      setActivePanel('preview');
      
      // Auto-hide progress after completion
      setTimeout(() => {
        setGenerationStage('idle');
      }, 1500);
      
      toast({
        title: "Report generated!",
        description: "Your academic report has been generated successfully.",
      });
    } catch (error) {
      if (controller.signal.aborted) {
        return;
      }
      console.error('Error generating report:', error);
      setGenerationStage('idle');
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      if (!controller.signal.aborted) {
        setIsGenerating(false);
      }
      setAbortController(null);
    }
  };

  const handleSaveReport = async () => {
    if (!reportData.title || !reportData.content) {
      toast({
        title: "Cannot save",
        description: "Please generate a report first",
        variant: "destructive",
      });
      return;
    }

    const savedReport = await saveReport(
      reportData.title,
      reportData.content,
      reportData.templateId,
      reportData.extractedData,
      isGenerating
    );

    if (savedReport) {
      setCurrentReportId(savedReport.id);
    }
  };

  const handleInsertAtCursor = useCallback((text: string) => {
    setReportData(prev => ({
      ...prev,
      content: prev.content + '\n\n' + text
    }));
    toast({ title: "Content inserted" });
  }, [toast]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <BackgroundEffects />
      
      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="sm:hidden p-2">
                <Link to="/">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <h1 className="text-base sm:text-lg font-semibold truncate max-w-[150px] sm:max-w-none">
                {reportData.title || "New Report"}
              </h1>
            </div>
            
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              <Sheet open={isToolsOpen} onOpenChange={setIsToolsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Wrench className="h-4 w-4 mr-2" />
                    Tools
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[450px]">
                  <SheetHeader>
                    <SheetTitle>Report Tools</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-80px)] mt-4 pr-4">
                    <div className="space-y-4">
                      <CitationManager 
                        reportId={currentReportId || undefined}
                        citationStyle={academicConfig.structure.citationStyle}
                        onInsertCitation={(citation) => handleInsertAtCursor(citation)}
                      />
                      <FigureManager 
                        reportId={currentReportId || undefined}
                        onInsertReference={(ref) => handleInsertAtCursor(ref)}
                      />
                      <TableEditor 
                        reportId={currentReportId || undefined}
                        onInsertTable={(tableMarkdown) => handleInsertAtCursor(tableMarkdown)}
                      />
                      <OriginalityPanel content={reportData.content} />
                      <TemplateLibrary 
                        selectedTemplate={reportData.templateId}
                        onTemplateSelect={(templateId) => {
                          setReportData(prev => ({ ...prev, templateId }));
                        }}
                      />
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
              <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Reports
              </Button>
              {reportData.content && (
                <Button variant="outline" size="sm" onClick={handleSaveReport}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle />
              <Sheet open={isToolsOpen} onOpenChange={setIsToolsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                    <Wrench className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Report Tools</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-80px)] mt-4 pr-4">
                    <div className="space-y-4">
                      <CitationManager 
                        reportId={currentReportId || undefined}
                        citationStyle={academicConfig.structure.citationStyle}
                        onInsertCitation={(citation) => handleInsertAtCursor(citation)}
                      />
                      <FigureManager 
                        reportId={currentReportId || undefined}
                        onInsertReference={(ref) => handleInsertAtCursor(ref)}
                      />
                      <TableEditor 
                        reportId={currentReportId || undefined}
                        onInsertTable={(tableMarkdown) => handleInsertAtCursor(tableMarkdown)}
                      />
                      <OriginalityPanel content={reportData.content} />
                      <TemplateLibrary 
                        selectedTemplate={reportData.templateId}
                        onTemplateSelect={(templateId) => {
                          setReportData(prev => ({ ...prev, templateId }));
                        }}
                      />
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-border/50 bg-background p-4 space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { navigate("/dashboard"); setIsMobileMenuOpen(false); }}>
                <FolderOpen className="h-4 w-4 mr-2" />
                My Reports
              </Button>
              {reportData.content && (
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => { handleSaveReport(); setIsMobileMenuOpen(false); }}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Report
                </Button>
              )}
              <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
        </header>

        {/* Mobile Panel Switcher */}
        <div className="md:hidden flex border-b border-border/50 bg-muted/30 sticky top-0 z-10">
          <button
            onClick={() => setActivePanel('input')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activePanel === 'input' 
                ? 'text-primary border-b-2 border-primary bg-background' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Input
          </button>
          <button
            onClick={() => setActivePanel('preview')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activePanel === 'preview' 
                ? 'text-primary border-b-2 border-primary bg-background' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Preview
          </button>
        </div>

        {/* Main Content - Responsive Layout */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {/* Desktop: Side by Side */}
          <div className="hidden md:grid h-full grid-cols-[400px_1fr] lg:grid-cols-[450px_1fr] gap-4 p-4">
            <div className="overflow-y-auto scrollbar-thin">
              <InputPanel 
                onGenerate={handleGenerate} 
                isGenerating={isGenerating}
                initialTitle={reportData.title}
                initialContent=""
                initialTemplateId={reportData.templateId}
              />
            </div>
            <div className="overflow-y-auto scrollbar-thin">
              <PreviewPanel
                title={reportData.title}
                content={reportData.content}
                extractedData={reportData.extractedData}
                onExportClick={() => setIsExportDialogOpen(true)}
                selectedTemplateId={reportData.templateId}
                onContentChange={(newContent) => {
                  setReportData((prev) => ({ ...prev, content: newContent }));
                }}
                onTitleChange={(newTitle) => {
                  setReportData((prev) => ({ ...prev, title: newTitle }));
                }}
              />
            </div>
          </div>

          {/* Mobile: Single Panel with proper scrolling */}
          <div className="md:hidden h-full flex flex-col">
            <div className="flex-1 min-h-0 overflow-y-auto p-3 pb-6">
              {activePanel === 'input' ? (
                <InputPanel 
                  onGenerate={handleGenerate} 
                  isGenerating={isGenerating}
                  initialTitle={reportData.title}
                  initialContent=""
                  initialTemplateId={reportData.templateId}
                />
              ) : (
                <PreviewPanel
                  title={reportData.title}
                  content={reportData.content}
                  extractedData={reportData.extractedData}
                  onExportClick={() => setIsExportDialogOpen(true)}
                  selectedTemplateId={reportData.templateId}
                  onContentChange={(newContent) => {
                    setReportData((prev) => ({ ...prev, content: newContent }));
                  }}
                  onTitleChange={(newTitle) => {
                    setReportData((prev) => ({ ...prev, title: newTitle }));
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Generation Progress Overlay */}
        <GenerationProgress 
          stage={generationStage} 
          onCancel={handleCancelGeneration} 
        />

        {/* Export Dialog */}
        <ExportDialog
          open={isExportDialogOpen}
          onOpenChange={setIsExportDialogOpen}
          title={reportData.title}
          content={reportData.content}
          extractedData={reportData.extractedData}
          selectedTemplate={reportData.templateId}
          academicConfig={academicConfig}
        />
      </div>
    </div>
  );
};

export default Generator;
