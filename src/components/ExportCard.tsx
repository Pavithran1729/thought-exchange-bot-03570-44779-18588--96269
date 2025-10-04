import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, Presentation, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportCardProps {
  title: string;
  content: string;
  disabled?: boolean;
  onBack: () => void;
}

export const ExportCard = ({ title, content, disabled, onBack }: ExportCardProps) => {
  const { toast } = useToast();

  const exportFormats = [
    {
      name: "PDF",
      icon: FileText,
      description: "Professional document",
      color: "from-red-500 to-red-600",
    },
    {
      name: "DOCX",
      icon: FileText,
      description: "Microsoft Word",
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "PPTX",
      icon: Presentation,
      description: "PowerPoint slides",
      color: "from-orange-500 to-orange-600",
    },
  ];

  const handleExport = (format: string) => {
    if (!title || !content) {
      toast({
        title: "Nothing to export",
        description: "Please generate a report first",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: `Exporting as ${format}`,
      description: "Your report is being prepared...",
    });

    // Simulate export
    setTimeout(() => {
      toast({
        title: "Export complete!",
        description: `${title}.${format.toLowerCase()} is ready`,
      });
    }, 2000);
  };

  return (
    <div className="p-8 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gradient mb-2">Export Options</h2>
        <p className="text-muted-foreground">
          Download your report in multiple formats
        </p>
      </div>

      <div className="grid gap-4">
        {exportFormats.map((format, index) => (
          <motion.div
            key={format.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.03, rotateY: 5 }}
            whileTap={{ scale: 0.97 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <Button
              onClick={() => handleExport(format.name)}
              disabled={disabled}
              className={`w-full h-20 bg-gradient-to-r ${format.color} hover:opacity-90 text-white border-none shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-between w-full px-4">
                <div className="flex items-center gap-4">
                  <format.icon className="h-8 w-8" />
                  <div className="text-left">
                    <div className="font-bold text-lg">{format.name}</div>
                    <div className="text-sm opacity-90">{format.description}</div>
                  </div>
                </div>
                <Download className="h-6 w-6" />
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="pt-4 border-t border-primary/20 space-y-3">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => {
              exportFormats.forEach((f) => handleExport(f.name));
            }}
            disabled={disabled}
            variant="outline"
            className="w-full h-14 border-primary/50 hover:bg-primary/10 text-lg"
          >
            <Download className="mr-2 h-5 w-5" />
            Export All Formats
          </Button>
        </motion.div>
        
        <Button
          onClick={onBack}
          variant="outline"
          className="w-full h-12 border-primary/30 hover:bg-primary/5"
        >
          Back to Preview
        </Button>
      </div>
    </div>
  );
};
