import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseTextFile } from "@/utils/fileParser";

interface FileUploaderProps {
  onFileContent: (content: string) => void;
}

export const FileUploader = ({ onFileContent }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please upload a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['.txt', '.md', '.csv', '.json'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: `Please upload a ${allowedTypes.join(', ')} file`,
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const content = await parseTextFile(file);
      setUploadedFile(file);
      onFileContent(content);
      toast({
        title: "File Uploaded Successfully",
        description: `${file.name} has been processed`,
      });
    } catch (error) {
      toast({
        title: "Error Processing File",
        description: error instanceof Error ? error.message : "Failed to read file",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFile(files[0]);
    }
  }, []);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleClear = () => {
    setUploadedFile(null);
    onFileContent("");
  };

  return (
    <div className="space-y-3">
      {!uploadedFile ? (
        <Card
          className={`border-2 border-dashed transition-all cursor-pointer ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label className="flex flex-col items-center justify-center p-6 cursor-pointer">
            <input
              type="file"
              accept=".txt,.md,.csv,.json"
              onChange={handleFileInput}
              className="hidden"
              disabled={isProcessing}
            />
            <Upload className={`h-8 w-8 mb-3 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
            <p className="text-sm font-medium text-foreground mb-1">
              {isProcessing ? "Processing file..." : "Drop file here or click to upload"}
            </p>
            <p className="text-xs text-muted-foreground">
              Supports .txt, .md, .csv, .json (max 10MB)
            </p>
          </label>
        </Card>
      ) : (
        <Card className="border-primary/50 bg-primary/5">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
