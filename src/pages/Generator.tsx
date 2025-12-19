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
import { ArrowLeft, LogOut, Save, FolderOpen, Wrench } from "lucide-react";
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffects />
      
      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-border/50 glass-morphism">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-bold">
                {reportData.title || "Academic Report Generator"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Sheet open={isToolsOpen} onOpenChange={setIsToolsOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Wrench className="h-4 w-4 mr-2" />
                    Tools
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[400px] sm:w-[500px]">
                  <SheetHeader>
                    <SheetTitle>Report Tools</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-80px)] mt-4 pr-4">
                    <div className="space-y-4">
                      <CitationManager 
                        reportId={currentReportId || undefined}
                        citationStyle={academicConfig.structure.citationStyle}
                        onInsertCitation={(citation) => {
                          setReportData(prev => ({
                            ...prev,
                            content: prev.content + ' ' + citation
                          }));
                        }}
                      />
                      <FigureManager 
                        reportId={currentReportId || undefined}
                        onInsertReference={(ref) => {
                          setReportData(prev => ({
                            ...prev,
                            content: prev.content + ' ' + ref
                          }));
                        }}
                      />
                      <TableEditor 
                        reportId={currentReportId || undefined}
                        onInsertTable={(tableMarkdown) => {
                          setReportData(prev => ({
                            ...prev,
                            content: prev.content + '\n\n' + tableMarkdown
                          }));
                        }}
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
                My Reports
              </Button>
              {reportData.content && (
                <Button variant="outline" size="sm" onClick={handleSaveReport}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Report
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content - 2 Panel Layout */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full grid grid-cols-1 lg:grid-cols-[450px_1fr] gap-4 p-4">
            {/* Left Panel - Input */}
            <div className="overflow-y-auto">
              <InputPanel 
                onGenerate={handleGenerate} 
                isGenerating={isGenerating}
                initialTitle={reportData.title}
                initialContent=""
                initialTemplateId={reportData.templateId}
              />
            </div>

            {/* Right Panel - Preview */}
            <div className="overflow-y-auto">
              <PreviewPanel
                title={reportData.title}
                content={reportData.content}
                extractedData={reportData.extractedData}
                onExportClick={() => setIsExportDialogOpen(true)}
                selectedTemplateId={reportData.templateId}
                onContentChange={(newContent) => {
                  setReportData((prev) => ({ ...prev, content: newContent }));
                  toast({
                    title: "Content updated",
                    description: "Your changes have been saved to the preview",
                  });
                }}
                onTitleChange={(newTitle) => {
                  setReportData((prev) => ({ ...prev, title: newTitle }));
                }}
              />
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
