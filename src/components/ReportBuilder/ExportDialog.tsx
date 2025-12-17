import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, Sparkles, GraduationCap, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToPDF } from "@/utils/exportPDF";
import { exportToDOCX } from "@/utils/exportDOCX";
import { exportToAcademicPDF } from "@/utils/academicExportPDF";
import { exportToAcademicDOCX } from "@/utils/academicExportDOCX";
import { exportToLaTeX } from "@/utils/exportLaTeX";
import { getTemplate } from "@/utils/templates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ExtractedData } from "@/utils/regexProcessor";
import type { AcademicReportConfig } from "@/types/academicReport";
import { DEFAULT_ACADEMIC_CONFIG } from "@/types/academicReport";
interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  extractedData?: ExtractedData[];
  selectedTemplate?: string;
  academicConfig?: AcademicReportConfig;
}

export const ExportDialog = ({ 
  open, 
  onOpenChange, 
  title, 
  content,
  extractedData = [],
  selectedTemplate = 'default',
  academicConfig
}: ExportDialogProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportMode, setExportMode] = useState<'standard' | 'academic'>('academic');
  const template = getTemplate(selectedTemplate);

  const handleExport = async (format: string) => {
    if (!title || !content) {
      toast({
        title: "Nothing to Export",
        description: "Please generate a report first",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    toast({
      title: "Export Started",
      description: `Preparing ${exportMode === 'academic' ? 'Academic ' : ''}${format.toUpperCase()} export...`,
    });

    try {
      if (exportMode === 'academic') {
        const config = academicConfig || DEFAULT_ACADEMIC_CONFIG;
        if (format === 'pdf') {
          await exportToAcademicPDF(title, content, config, extractedData);
        } else if (format === 'docx') {
          await exportToAcademicDOCX(title, content, config, extractedData);
        } else if (format === 'tex') {
          await exportToLaTeX(title, content, config, extractedData);
        }
      } else {
        if (format === 'pdf') {
          await exportToPDF(title, content, template, extractedData);
        } else if (format === 'docx') {
          await exportToDOCX(title, content, template, extractedData);
        }
      }

      toast({
        title: "Export Complete",
        description: `${title}${exportMode === 'academic' ? '_Academic' : ''}.${format} has been downloaded`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export document",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportAll = async () => {
    setIsExporting(true);
    toast({
      title: "Export All Started",
      description: "Preparing all formats for download...",
    });

    try {
      if (exportMode === 'academic') {
        const config = academicConfig || DEFAULT_ACADEMIC_CONFIG;
        await exportToAcademicPDF(title, content, config, extractedData);
        await exportToAcademicDOCX(title, content, config, extractedData);
        await exportToLaTeX(title, content, config, extractedData);
      } else {
        await exportToPDF(title, content, template, extractedData);
        await exportToDOCX(title, content, template, extractedData);
      }
      
      toast({
        title: "Export Complete",
        description: exportMode === 'academic' 
          ? "PDF, DOCX, and LaTeX files have been downloaded"
          : "PDF and DOCX files have been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export documents",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportFormats = exportMode === 'academic' ? [
    { 
      format: "pdf", 
      label: "PDF Document", 
      icon: FileText, 
      color: "text-red-400",
      description: "Academic PDF with cover page & formatting"
    },
    { 
      format: "docx", 
      label: "Word Document", 
      icon: FileText, 
      color: "text-blue-400",
      description: "Academic DOCX with proper sections"
    },
    { 
      format: "tex", 
      label: "LaTeX Document", 
      icon: Code, 
      color: "text-green-400",
      description: "Source .tex file for advanced publishing"
    },
  ] : [
    { 
      format: "pdf", 
      label: "PDF Document", 
      icon: FileText, 
      color: "text-red-400",
      description: "Professional PDF with formatting"
    },
    { 
      format: "docx", 
      label: "Word Document", 
      icon: FileText, 
      color: "text-blue-400",
      description: "Editable Word document"
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] glass-morphism border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Download className="h-6 w-6 text-primary" />
            Export Your Report
          </DialogTitle>
          <DialogDescription>
            Choose export mode and format for your document
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-4">
          {/* Export Mode Tabs */}
          <Tabs value={exportMode} onValueChange={(v) => setExportMode(v as 'standard' | 'academic')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="academic" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Academic Format
              </TabsTrigger>
              <TabsTrigger value="standard" className="gap-2">
                <FileText className="h-4 w-4" />
                Standard Format
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="academic" className="mt-4">
              <div className="text-xs text-muted-foreground bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4">
                <p className="font-medium text-primary mb-1">Academic Export Features:</p>
                <ul className="space-y-1">
                  <li>• Professional cover page with institution details</li>
                  <li>• Table of contents with page numbers</li>
                  <li>• Numbered sections (1., 1.1, 1.2...)</li>
                  <li>• Times New Roman, 1.5 line spacing</li>
                  <li>• Headers, footers & page numbers</li>
                  <li>• LaTeX export with math equation support</li>
                  <li>• References section placeholder</li>
                </ul>
              </div>
            </TabsContent>
            
            <TabsContent value="standard" className="mt-4">
              <div className="text-xs text-muted-foreground bg-muted/50 border border-border rounded-lg p-3 mb-4">
                <p className="font-medium mb-1">Standard Export Features:</p>
                <ul className="space-y-1">
                  <li>• Clean professional formatting</li>
                  <li>• Template-based styling</li>
                  <li>• Tables and lists preserved</li>
                  <li>• Page numbers included</li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          {/* Export Formats */}
          <div className="space-y-3">
            {exportFormats.map(({ format, label, icon: Icon, color, description }) => (
              <Button
                key={format}
                variant="outline"
                className="w-full justify-start h-auto py-4 px-4 group hover:bg-accent/50 hover:border-primary/50 transition-all"
                onClick={() => handleExport(format)}
                disabled={isExporting}
              >
                <div className="flex items-center gap-4 w-full">
                  <Icon className={`h-5 w-5 ${color} group-hover:scale-110 transition-transform`} />
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{label}</div>
                    <div className="text-xs text-muted-foreground">{description}</div>
                  </div>
                  <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Button>
            ))}
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Quick Action</span>
            </div>
          </div>

          {/* Download All Button */}
          <Button
            variant="default"
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-6 group"
            onClick={handleExportAll}
            disabled={isExporting}
          >
            <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
            {isExporting ? 'Exporting...' : 'Download All Formats'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
