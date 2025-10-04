import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exportToPDF } from "@/utils/exportPDF";
import { exportToDOCX } from "@/utils/exportDOCX";
import { getTemplate } from "@/utils/templates";
import type { ExtractedData } from "@/utils/regexProcessor";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
  extractedData?: ExtractedData[];
  selectedTemplate?: string;
}

export const ExportDialog = ({ 
  open, 
  onOpenChange, 
  title, 
  content,
  extractedData = [],
  selectedTemplate = 'default'
}: ExportDialogProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
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
      description: `Preparing ${format.toUpperCase()} export...`,
    });

    try {
      if (format === 'pdf') {
        await exportToPDF(title, content, template, extractedData);
      } else if (format === 'docx') {
        await exportToDOCX(title, content, template, extractedData);
      } else if (format === 'pptx') {
        // PPTX export - coming soon
        toast({
          title: "Coming Soon",
          description: "PowerPoint export will be available soon",
        });
        setIsExporting(false);
        return;
      }

      toast({
        title: "Export Complete",
        description: `${title}.${format} has been downloaded`,
      });
    } catch (error) {
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
      await exportToPDF(title, content, template, extractedData);
      await exportToDOCX(title, content, template, extractedData);
      
      toast({
        title: "Export Complete",
        description: "PDF and DOCX files have been downloaded",
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

  const exportFormats = [
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
    { 
      format: "pptx", 
      label: "PowerPoint", 
      icon: FileText, 
      color: "text-orange-400",
      description: "Presentation slides"
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] glass-morphism border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Download className="h-6 w-6 text-primary" />
            Export Your Report
          </DialogTitle>
          <DialogDescription>
            Choose your preferred format or download all at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
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
            Download All Formats
          </Button>

          {/* Features Info */}
          <div className="bg-muted/30 border border-border/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">Export Features:</p>
            <ul className="text-xs text-muted-foreground space-y-1.5">
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                Professional formatting & styling
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                Automatic table of contents
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                Headers, footers & page numbers
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary" />
                Embedded images & charts
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};