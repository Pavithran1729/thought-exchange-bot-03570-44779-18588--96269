import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Expand, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Sparkles,
  Loader2,
  X
} from "lucide-react";

interface SectionContextMenuProps {
  selectedText: string;
  position: { x: number; y: number };
  onClose: () => void;
  onEnhancedContent: (content: string) => void;
}

type EnhancementType = 'expand' | 'add-citations' | 'academic-tone' | 'add-examples' | 'simplify';

const enhancementOptions: { type: EnhancementType; label: string; icon: React.ElementType; description: string }[] = [
  { type: 'expand', label: 'Expand with Detail', icon: Expand, description: 'Add more comprehensive explanations' },
  { type: 'add-citations', label: 'Add References', icon: BookOpen, description: 'Include relevant citations' },
  { type: 'academic-tone', label: 'Academic Tone', icon: GraduationCap, description: 'Improve formal academic language' },
  { type: 'add-examples', label: 'Add Examples', icon: FileText, description: 'Include supporting examples' },
  { type: 'simplify', label: 'Simplify', icon: Sparkles, description: 'Make clearer and more concise' },
];

export const SectionContextMenu = ({ 
  selectedText, 
  position, 
  onClose, 
  onEnhancedContent 
}: SectionContextMenuProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingType, setLoadingType] = useState<EnhancementType | null>(null);

  const handleEnhance = async (type: EnhancementType) => {
    if (!selectedText.trim()) {
      toast({ title: "No text selected", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setLoadingType(type);

    try {
      const { data, error } = await supabase.functions.invoke('enhance-content', {
        body: { 
          content: selectedText, 
          enhancementType: type,
          tone: 'academic'
        }
      });

      if (error) throw error;

      if (data?.content) {
        onEnhancedContent(data.content);
        toast({ title: "Content enhanced successfully" });
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      toast({ 
        title: "Enhancement failed", 
        description: "Please try again",
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
      setLoadingType(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed z-50 bg-popover border border-border rounded-lg shadow-lg p-1 min-w-[200px]"
        style={{ 
          left: Math.min(position.x, window.innerWidth - 220),
          top: Math.min(position.y, window.innerHeight - 300)
        }}
      >
        <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-border">
          <span className="text-xs font-medium text-muted-foreground">Enhance Section</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 w-5 p-0" 
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-0.5">
          {enhancementOptions.map(({ type, label, icon: Icon, description }) => (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              className="w-full justify-start h-auto py-2 px-2"
              onClick={() => handleEnhance(type)}
              disabled={isLoading}
            >
              <div className="flex items-start gap-2">
                {isLoading && loadingType === type ? (
                  <Loader2 className="h-4 w-4 animate-spin mt-0.5" />
                ) : (
                  <Icon className="h-4 w-4 mt-0.5 text-primary" />
                )}
                <div className="text-left">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
            </Button>
          ))}
        </div>

        <div className="mt-1 pt-1 border-t border-border px-2 pb-1">
          <p className="text-[10px] text-muted-foreground truncate">
            Selected: "{selectedText.slice(0, 50)}{selectedText.length > 50 ? '...' : ''}"
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
