import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, List, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface OutlineItem {
  id: string;
  title: string;
  level: number;
  children: OutlineItem[];
}

interface DocumentOutlineProps {
  content: string;
  onNavigate?: (sectionId: string) => void;
  className?: string;
}

export const DocumentOutline = ({ content, onNavigate, className }: DocumentOutlineProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Parse headings from content
  const outline = useMemo(() => {
    if (!content) return [];
    
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const items: OutlineItem[] = [];
    const stack: OutlineItem[] = [];
    let match;
    let index = 0;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const title = match[2]
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .trim();
      
      const item: OutlineItem = {
        id: `heading-${index++}`,
        title,
        level,
        children: [],
      };

      // Find parent based on level
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      if (stack.length === 0) {
        items.push(item);
      } else {
        stack[stack.length - 1].children.push(item);
      }

      stack.push(item);
    }

    return items;
  }, [content]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleNavigate = (item: OutlineItem) => {
    onNavigate?.(item.id);
  };

  const renderOutlineItem = (item: OutlineItem, depth: number = 0) => {
    const hasChildren = item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);

    return (
      <div key={item.id}>
        <motion.div
          className={cn(
            "flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors group",
            depth > 0 && "ml-4"
          )}
          onClick={() => handleNavigate(item)}
          whileHover={{ x: 2 }}
        >
          {hasChildren ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(item.id);
              }}
              className="p-0.5 hover:bg-muted rounded"
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-4" />
          )}
          
          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          
          <span
            className={cn(
              "text-sm truncate",
              item.level === 1 && "font-medium text-foreground",
              item.level === 2 && "text-foreground/90",
              item.level >= 3 && "text-muted-foreground"
            )}
            title={item.title}
          >
            {item.title}
          </span>
        </motion.div>

        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {item.children.map((child) => renderOutlineItem(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (outline.length === 0) {
    return null;
  }

  return (
    <div className={cn("border-r border-border bg-background/50", className)}>
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <List className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Document Outline</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-7 w-7 p-0"
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <ScrollArea className="h-[400px]">
              <div className="p-2 space-y-1">
                {outline.map((item) => renderOutlineItem(item))}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
