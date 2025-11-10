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
    content: string;
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
  const [content, setContent] = useState(initialContent);
  const [useRegex, setUseRegex] = useState(true);
  const [useAI, setUseAI] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplateId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onGenerate({ title, content, useRegex, useAI, templateId: selectedTemplate });
    }
  };

  const characterCount = content.length;
  const maxChars = 5000;

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

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Upload Document (Optional)</Label>
            <FileUploader onFileContent={setContent} />
          </div>

          {/* Content Input */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="content">Content (Optional)</Label>
              <span className="text-xs text-muted-foreground">
                {characterCount} / {maxChars}
              </span>
            </div>
            <Textarea
              id="content"
              placeholder="Leave empty to let AI generate content, or paste/upload your existing content here..."
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, maxChars))}
              className="bg-input border-border min-h-[200px] resize-none"
              rows={10}
            />
            <p className="text-xs text-muted-foreground">
              {content.trim() 
                ? "AI will enhance and structure your content" 
                : "AI will generate a complete report from your title"}
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
                  Use GPT to generate/enhance content
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
          {!content.trim() && (
            <div className="text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-lg p-3">
              💡 <strong>Tip:</strong> Leave content empty to let AI generate a comprehensive report based solely on your title!
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
