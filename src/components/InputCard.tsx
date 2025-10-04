import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InputCardProps {
  onGenerate: (data: {
    title: string;
    content: string;
    useRegex: boolean;
    useAI: boolean;
  }) => void;
}

export const InputCard = ({ onGenerate }: InputCardProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [useRegex, setUseRegex] = useState(true);
  const [useAI, setUseAI] = useState(false);
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both title and content",
        variant: "destructive",
      });
      return;
    }

    onGenerate({ title, content, useRegex, useAI });
  };

  return (
    <div className="p-8 space-y-6">
      <div className="text-center mb-8">
        <motion.h1 
          className="text-5xl font-bold mb-3 text-gradient"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          AI Report Generator
        </motion.h1>
        <p className="text-muted-foreground text-lg">
          Transform your ideas into professional reports
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-lg">Report Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your report title..."
            className="bg-background/50 border-primary/30 focus:border-primary transition-colors h-12 text-lg"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="content" className="text-lg">Content / Prompt</Label>
            <span className="text-sm text-muted-foreground">
              {content.length} characters
            </span>
          </div>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your content or describe what you want to generate..."
            className="bg-background/50 border-primary/30 focus:border-primary transition-colors min-h-[200px] resize-y text-base"
          />
        </div>

        <div className="border border-dashed border-primary/30 rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer group">
          <Upload className="mx-auto h-12 w-12 text-primary/50 group-hover:text-primary transition-colors mb-2" />
          <p className="text-sm text-muted-foreground">
            Drop files here or click to upload
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            PNG, JPG, WEBP, CSV, XLSX
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/20">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🔧</span>
              <Label htmlFor="regex" className="cursor-pointer">
                Regex Processing
              </Label>
            </div>
            <Switch
              id="regex"
              checked={useRegex}
              onCheckedChange={setUseRegex}
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-primary/20">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🎨</span>
              <Label htmlFor="ai" className="cursor-pointer">
                AI Images
              </Label>
            </div>
            <Switch
              id="ai"
              checked={useAI}
              onCheckedChange={setUseAI}
            />
          </div>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={handleGenerate}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 animate-pulse-glow"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Report
          </Button>
        </motion.div>
      </div>
    </div>
  );
};
