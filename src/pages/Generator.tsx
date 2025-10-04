import { useState } from "react";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { InputPanel } from "@/components/ReportBuilder/InputPanel";
import { PreviewPanel } from "@/components/ReportBuilder/PreviewPanel";
import { ExportDialog } from "@/components/ReportBuilder/ExportDialog";
import { processText, convertLatexToReadable, type ExtractedData } from "@/utils/regexProcessor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAI } from "@/hooks/useAI";
import { useReports } from "@/hooks/useReports";
import { useToast } from "@/hooks/use-toast";

const Generator = () => {
  const [reportData, setReportData] = useState({
    title: "",
    content: "",
    extractedData: [] as ExtractedData[],
    templateId: "default",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  
  const { signOut } = useAuth();
  const { generateReport, enhanceContent } = useAI();
  const { saveReport } = useReports();
  const { toast } = useToast();

  const handleGenerate = async ({
    title,
    content,
    useRegex,
    useAI,
  }: {
    title: string;
    content: string;
    useRegex: boolean;
    useAI: boolean;
  }) => {
    setIsGenerating(true);
    
    let processedContent = content;
    let extracted: ExtractedData[] = [];
    let isAIGenerated = false;

    try {
      // AI Generation or Enhancement
      if (useAI && !content.trim()) {
        // Generate new content from title
        const generated = await generateReport(title, reportData.templateId);
        if (generated) {
          processedContent = generated;
          isAIGenerated = true;
        } else {
          throw new Error("Failed to generate content");
        }
      } else if (useAI && content.trim()) {
        // Enhance existing content
        const enhanced = await enhanceContent(content, 'improve');
        if (enhanced) {
          processedContent = enhanced;
          isAIGenerated = true;
        } else {
          throw new Error("Failed to enhance content");
        }
      }

      // Regex processing
      if (useRegex) {
        processedContent = convertLatexToReadable(processedContent);
        extracted = processText(processedContent);
      }

      setReportData({
        title,
        content: processedContent,
        extractedData: extracted,
        templateId: reportData.templateId,
      });
      
      toast({
        title: "Report generated!",
        description: "Your report has been generated successfully.",
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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
                {reportData.title || "AI Report Generator"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
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
          <div className="h-full grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-4 p-4">
            {/* Left Panel - Input */}
            <div className="overflow-y-auto">
              <InputPanel 
                onGenerate={handleGenerate} 
                isGenerating={isGenerating}
              />
            </div>

            {/* Right Panel - Preview */}
            <div className="overflow-y-auto">
              <PreviewPanel
                title={reportData.title}
                content={reportData.content}
                extractedData={reportData.extractedData}
                onExportClick={() => setIsExportDialogOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* Export Dialog */}
        <ExportDialog
          open={isExportDialogOpen}
          onOpenChange={setIsExportDialogOpen}
          title={reportData.title}
          content={reportData.content}
          extractedData={reportData.extractedData}
        />
      </div>
    </div>
  );
};

export default Generator;
