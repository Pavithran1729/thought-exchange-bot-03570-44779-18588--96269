import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sparkles } from "lucide-react";
import { FileUploader } from "./FileUploader";
import { TemplateSelector } from "./TemplateSelector";

interface InputPanelProps {
  onGenerate: (data: {
    title: string;
    documentContent: string;
    additionalInstructions: string;
    useRegex: boolean;
    useAI: boolean;
    templateId?: string;
  }) => void;
  isGenerating?: boolean;
  initialTitle?: string;
  initialContent?: string;
  initialTemplateId?: string;
}

export const InputPanel = ({ 
  onGenerate, 
  isGenerating,
  initialTitle = "",
  initialContent = "",
  initialTemplateId = "default"
}: InputPanelProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [documentContent, setDocumentContent] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState(initialContent);
  const [useRegex, setUseRegex] = useState(true);
  const [useAI, setUseAI] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplateId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onGenerate({ 
        title, 
        documentContent, 
        additionalInstructions, 
        useRegex, 
        useAI, 
        templateId: selectedTemplate 
      });
    }
  };

  const characterCount = additionalInstructions.length;
  const maxChars = 2000;

  return (
    <Card className="glass-morphism border-primary/20 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Report Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Selector */}
          <div className="space-y-2">
            <Label>Report Template</Label>
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onTemplateChange={setSelectedTemplate}
            />
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Report Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Q4 Sales Report"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-input border-border"
              required
            />
          </div>

          {/* File Upload - Document Source */}
          <div className="space-y-2">
            <Label>Upload Document (Source Material)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Documents will be sent directly to AI for analysis
            </p>
            <FileUploader onFileContent={setDocumentContent} />
            {documentContent && (
              <p className="text-xs text-primary">
                ✓ {documentContent.length.toLocaleString()} characters loaded from document(s)
              </p>
            )}
          </div>

          {/* Additional Instructions */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="instructions">Additional Instructions (Optional)</Label>
              <span className="text-xs text-muted-foreground">
                {characterCount} / {maxChars}
              </span>
            </div>
            <Textarea
              id="instructions"
              placeholder="Specify what to focus on, extract, or analyze from the document...

Examples:
• Focus on financial data and projections
• Extract all action items and deadlines
• Summarize the key findings
• Create an executive summary
• Analyze the methodology section"
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value.slice(0, maxChars))}
              className="bg-input border-border min-h-[150px] resize-none"
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              {documentContent 
                ? "Tell AI what to focus on or extract from your document" 
                : "Without a document, AI will generate a report based on your title"}
            </p>
          </div>

          {/* Processing Options */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="regex">Smart Data Extraction</Label>
                <p className="text-xs text-muted-foreground">
                  Extract emails, phones, dates, URLs
                </p>
              </div>
              <Switch
                id="regex"
                checked={useRegex}
                onCheckedChange={setUseRegex}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="ai">AI Content Generation</Label>
                <p className="text-xs text-muted-foreground">
                  Use AI to analyze and generate content
                </p>
              </div>
              <Switch
                id="ai"
                checked={useAI}
                onCheckedChange={setUseAI}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!title.trim() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
          </div>

          {/* Info Note */}
          {!documentContent && !additionalInstructions.trim() && (
            <div className="text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg p-3">
              💡 <strong>Tip:</strong> Upload a document for AI to analyze, or leave empty to generate a report based solely on your title!
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
