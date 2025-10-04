import { useState } from "react";
import { CardStack } from "@/components/CardStack";
import { InputCard } from "@/components/InputCard";
import { PreviewCard } from "@/components/PreviewCard";
import { ExportCard } from "@/components/ExportCard";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import { processText, convertLatexToReadable, type ExtractedData } from "@/utils/regexProcessor";

const Index = () => {
  const [activeCard, setActiveCard] = useState(0); // 0: Input, 1: Preview, 2: Export
  const [reportData, setReportData] = useState({
    title: "",
    content: "",
    extractedData: [] as ExtractedData[],
  });

  const handleGenerate = ({
    title,
    content,
    useRegex,
  }: {
    title: string;
    content: string;
    useRegex: boolean;
    useAI: boolean;
  }) => {
    // Process content with regex if enabled
    let processedContent = content;
    let extracted: ExtractedData[] = [];

    if (useRegex) {
      // Convert LaTeX formulas to readable text
      processedContent = convertLatexToReadable(content);
      
      // Extract data patterns
      extracted = processText(content);
    }

    setReportData({
      title,
      content: processedContent,
      extractedData: extracted,
    });
    
    // Move to preview card
    setActiveCard(1);
  };

  const handleBackToInput = () => {
    setActiveCard(0);
  };

  const handleMoveToExport = () => {
    setActiveCard(2);
  };

  const handleBackToPreview = () => {
    setActiveCard(1);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffects />
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Card Stack Container */}
          <div className="relative" style={{ height: "calc(100vh - 6rem)", minHeight: "800px" }}>
            {activeCard === 0 && (
              <CardStack index={0} totalCards={1}>
                <InputCard onGenerate={handleGenerate} />
              </CardStack>
            )}
            
            {activeCard === 1 && (
              <CardStack index={0} totalCards={1}>
                <PreviewCard
                  title={reportData.title}
                  content={reportData.content}
                  extractedData={reportData.extractedData}
                  onBack={handleBackToInput}
                  onExport={handleMoveToExport}
                />
              </CardStack>
            )}
            
            {activeCard === 2 && (
              <CardStack index={0} totalCards={1}>
                <ExportCard
                  title={reportData.title}
                  content={reportData.content}
                  disabled={!reportData.title || !reportData.content}
                  onBack={handleBackToPreview}
                />
              </CardStack>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
