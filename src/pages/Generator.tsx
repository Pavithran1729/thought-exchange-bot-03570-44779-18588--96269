import { useState } from "react";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { InputPanel } from "@/components/ReportBuilder/InputPanel";
import { PreviewPanel } from "@/components/ReportBuilder/PreviewPanel";
import { ExportDialog } from "@/components/ReportBuilder/ExportDialog";
import { processText, convertLatexToReadable, type ExtractedData } from "@/utils/regexProcessor";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Generator = () => {
  const [reportData, setReportData] = useState({
    title: "",
    content: "",
    extractedData: [] as ExtractedData[],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

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

    // TODO: When Lovable Cloud is enabled, implement AI generation
    if (useAI && !content.trim()) {
      // Simulate AI generation for now
      processedContent = `# ${title}\n\n## Executive Summary\n\nThis is a comprehensive report on ${title}. The following sections provide detailed analysis and insights.\n\n## Main Findings\n\nKey findings will be generated here based on the title.\n\n## Conclusion\n\nConclusion and recommendations will be provided.`;
    } else if (useAI && content.trim()) {
      // Enhance existing content
      processedContent = content;
    }

    if (useRegex) {
      processedContent = convertLatexToReadable(processedContent);
      extracted = processText(processedContent);
    }

    setReportData({
      title,
      content: processedContent,
      extractedData: extracted,
    });
    
    setIsGenerating(false);
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
