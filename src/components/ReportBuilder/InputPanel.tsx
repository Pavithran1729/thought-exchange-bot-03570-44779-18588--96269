import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sparkles, ChevronDown, ChevronUp, GraduationCap } from "lucide-react";
import { FileUploader } from "./FileUploader";
import { TemplateSelector } from "./TemplateSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  REPORT_TYPES, 
  CITATION_STYLES, 
  DEFAULT_ACADEMIC_CONFIG,
  type ReportType,
  type CitationStyle,
  type AcademicReportConfig 
} from "@/types/academicReport";

interface InputPanelProps {
  onGenerate: (data: {
    title: string;
    documentContent: string;
    additionalInstructions: string;
    useRegex: boolean;
    useAI: boolean;
    templateId?: string;
    academicConfig?: AcademicReportConfig;
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
  initialTemplateId = "academic"
}: InputPanelProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [documentContent, setDocumentContent] = useState("");
  const [additionalInstructions, setAdditionalInstructions] = useState(initialContent);
  const [useRegex, setUseRegex] = useState(true);
  const [useAI, setUseAI] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(initialTemplateId);
  const [isAcademicOpen, setIsAcademicOpen] = useState(true);
  
  // Academic configuration
  const [academicConfig, setAcademicConfig] = useState<AcademicReportConfig>(DEFAULT_ACADEMIC_CONFIG);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onGenerate({ 
        title, 
        documentContent, 
        additionalInstructions, 
        useRegex, 
        useAI, 
        templateId: selectedTemplate,
        academicConfig
      });
    }
  };

  const updateAcademicDetails = (field: string, value: string) => {
    setAcademicConfig(prev => ({
      ...prev,
      academicDetails: {
        ...prev.academicDetails,
        [field]: value
      }
    }));
  };

  const updateStructure = (field: string, value: boolean | CitationStyle) => {
    setAcademicConfig(prev => ({
      ...prev,
      structure: {
        ...prev.structure,
        [field]: value
      }
    }));
  };

  const characterCount = additionalInstructions.length;
  const maxChars = 2000;

  return (
    <Card className="glass-morphism border-primary/20 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Academic Report Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Report Type */}
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select
              value={academicConfig.reportType}
              onValueChange={(value: ReportType) => 
                setAcademicConfig(prev => ({ ...prev, reportType: value }))
              }
            >
              <SelectTrigger className="bg-input border-border">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex flex-col">
                      <span>{type.label}</span>
                      <span className="text-xs text-muted-foreground">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Report Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Study on Machine Learning Applications in Healthcare"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-input border-border"
              required
            />
          </div>

          {/* Academic Details Collapsible */}
          <Collapsible open={isAcademicOpen} onOpenChange={setIsAcademicOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between" type="button">
                <span className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Academic Details
                </span>
                {isAcademicOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="authorName" className="text-xs">Author Name</Label>
                  <Input
                    id="authorName"
                    placeholder="Your Name"
                    value={academicConfig.academicDetails.authorName}
                    onChange={(e) => updateAcademicDetails('authorName', e.target.value)}
                    className="bg-input border-border h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="studentId" className="text-xs">Student ID</Label>
                  <Input
                    id="studentId"
                    placeholder="e.g., 2024001"
                    value={academicConfig.academicDetails.studentId}
                    onChange={(e) => updateAcademicDetails('studentId', e.target.value)}
                    className="bg-input border-border h-9"
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="institution" className="text-xs">Institution/University</Label>
                <Input
                  id="institution"
                  placeholder="University Name"
                  value={academicConfig.academicDetails.institution}
                  onChange={(e) => updateAcademicDetails('institution', e.target.value)}
                  className="bg-input border-border h-9"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="department" className="text-xs">Department</Label>
                  <Input
                    id="department"
                    placeholder="e.g., Computer Science"
                    value={academicConfig.academicDetails.department}
                    onChange={(e) => updateAcademicDetails('department', e.target.value)}
                    className="bg-input border-border h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="course" className="text-xs">Course/Program</Label>
                  <Input
                    id="course"
                    placeholder="e.g., B.Tech"
                    value={academicConfig.academicDetails.course}
                    onChange={(e) => updateAcademicDetails('course', e.target.value)}
                    className="bg-input border-border h-9"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="supervisorName" className="text-xs">Supervisor Name</Label>
                  <Input
                    id="supervisorName"
                    placeholder="Prof. Name"
                    value={academicConfig.academicDetails.supervisorName}
                    onChange={(e) => updateAcademicDetails('supervisorName', e.target.value)}
                    className="bg-input border-border h-9"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="submissionDate" className="text-xs">Submission Date</Label>
                  <Input
                    id="submissionDate"
                    type="date"
                    value={academicConfig.academicDetails.submissionDate}
                    onChange={(e) => updateAcademicDetails('submissionDate', e.target.value)}
                    className="bg-input border-border h-9"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Document Structure Options */}
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
            <Label className="text-sm font-medium">Document Structure</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="coverPage" 
                  checked={academicConfig.structure.includeCoverPage}
                  onCheckedChange={(checked) => updateStructure('includeCoverPage', checked as boolean)}
                />
                <Label htmlFor="coverPage" className="text-xs cursor-pointer">Cover Page</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="toc" 
                  checked={academicConfig.structure.includeToc}
                  onCheckedChange={(checked) => updateStructure('includeToc', checked as boolean)}
                />
                <Label htmlFor="toc" className="text-xs cursor-pointer">Table of Contents</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="abstract" 
                  checked={academicConfig.structure.includeAbstract}
                  onCheckedChange={(checked) => updateStructure('includeAbstract', checked as boolean)}
                />
                <Label htmlFor="abstract" className="text-xs cursor-pointer">Abstract</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="references" 
                  checked={academicConfig.structure.includeReferences}
                  onCheckedChange={(checked) => updateStructure('includeReferences', checked as boolean)}
                />
                <Label htmlFor="references" className="text-xs cursor-pointer">References</Label>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs">Citation Style</Label>
              <Select
                value={academicConfig.structure.citationStyle}
                onValueChange={(value: CitationStyle) => updateStructure('citationStyle', value)}
              >
                <SelectTrigger className="bg-input border-border h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CITATION_STYLES.map((style) => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Upload - Document Source */}
          <div className="space-y-2">
            <Label>Upload Reference Document (Optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Upload a document for AI to analyze and incorporate
            </p>
            <FileUploader onFileContent={setDocumentContent} />
            {documentContent && (
              <p className="text-xs text-primary">
                ✓ {documentContent.length.toLocaleString()} characters loaded
              </p>
            )}
          </div>

          {/* Additional Instructions */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="instructions">Report Focus / Requirements</Label>
              <span className="text-xs text-muted-foreground">
                {characterCount} / {maxChars}
              </span>
            </div>
            <Textarea
              id="instructions"
              placeholder="Specify what to focus on in your report...

Examples:
• Focus on recent developments (2020-2024)
• Include case studies from India
• Emphasize practical applications
• Compare different methodologies
• Include statistical analysis"
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value.slice(0, maxChars))}
              className="bg-input border-border min-h-[120px] resize-none"
              rows={5}
            />
          </div>

          {/* Template Selector */}
          <div className="space-y-2">
            <Label>Export Template Style</Label>
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onTemplateChange={setSelectedTemplate}
            />
          </div>

          {/* Processing Options */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="regex" className="text-sm">Smart Data Extraction</Label>
                <p className="text-xs text-muted-foreground">
                  Extract emails, dates, URLs, etc.
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
                <Label htmlFor="ai" className="text-sm">AI Content Generation</Label>
                <p className="text-xs text-muted-foreground">
                  Generate comprehensive content
                </p>
              </div>
              <Switch
                id="ai"
                checked={useAI}
                onCheckedChange={setUseAI}
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-3">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11"
              disabled={!title.trim() || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Generating Academic Report...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Academic Report
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
