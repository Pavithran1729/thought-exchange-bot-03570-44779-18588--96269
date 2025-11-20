import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Upload, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseTextFile } from "@/utils/fileParser";

interface FileUploaderProps {
  onFileContent: (content: string) => void;
}

interface UploadedFileInfo {
  file: File;
  content: string;
}

export const FileUploader = ({ onFileContent }: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingFileName, setProcessingFileName] = useState<string>("");
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
    // Validate file size (max 20MB for PDF/DOCX)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: `${file.name} is larger than 20MB`,
        variant: "destructive",
      });
      return null;
    }

    // Validate file type
    const allowedTypes = ['.txt', '.md', '.csv', '.json', '.pdf', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: `${file.name} is not a supported file type`,
        variant: "destructive",
      });
      return null;
    }

    setProcessingFileName(file.name);
    try {
      const content = await parseTextFile(file);
      return { file, content };
    } catch (error) {
      toast({
        title: "Error Processing File",
        description: `${file.name}: ${error instanceof Error ? error.message : "Failed to read file"}`,
        variant: "destructive",
      });
      return null;
    }
  };

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    const newFiles: UploadedFileInfo[] = [];

    for (const file of files) {
      const result = await processFile(file);
      if (result) {
        newFiles.push(result);
      }
    }

    if (newFiles.length > 0) {
      const updatedFiles = [...uploadedFiles, ...newFiles];
      setUploadedFiles(updatedFiles);
      
      // Combine all file contents with separators
      const combinedContent = updatedFiles
        .map(f => `\n=== ${f.file.name} ===\n${f.content}`)
        .join('\n\n');
      
      onFileContent(combinedContent);
      
      toast({
        title: "Files Uploaded Successfully",
        description: `${newFiles.length} file(s) processed. Total: ${updatedFiles.length} file(s)`,
      });
    }

    setIsProcessing(false);
    setProcessingFileName("");
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await processFiles(files);
    }
  }, [uploadedFiles]);

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFiles(Array.from(files));
    }
    // Reset input so same files can be selected again
    e.target.value = '';
  };

  const handleClear = () => {
    setUploadedFiles([]);
    onFileContent("");
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
    
    if (updatedFiles.length === 0) {
      onFileContent("");
    } else {
      const combinedContent = updatedFiles
        .map(f => `\n=== ${f.file.name} ===\n${f.content}`)
        .join('\n\n');
      onFileContent(combinedContent);
    }
    
    toast({
      title: "File Removed",
      description: `${updatedFiles.length} file(s) remaining`,
    });
  };

  return (
    <div className="space-y-3">
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
            accept=".txt,.md,.csv,.json,.pdf,.docx"
            onChange={handleFileInput}
            className="hidden"
            disabled={isProcessing}
            multiple
          />
          <Upload className={`h-8 w-8 mb-3 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
          <p className="text-sm font-medium text-foreground mb-1">
            {isProcessing ? `Processing ${processingFileName}...` : "Drop files here or click to upload"}
          </p>
          <p className="text-xs text-muted-foreground">
            Supports TXT, MD, CSV, JSON, PDF, DOCX (with OCR) - max 20MB each
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Upload multiple files at once
          </p>
        </label>
      </Card>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">
              {uploadedFiles.length} file(s) uploaded
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-8 text-xs"
            >
              Clear All
            </Button>
          </div>
          
          {uploadedFiles.map((fileInfo, index) => (
            <Card key={index} className="border-primary/50 bg-primary/5">
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {fileInfo.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(fileInfo.file.size / 1024).toFixed(1)} KB • {fileInfo.content.length} characters
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveFile(index)}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
