import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Image, Plus, Trash2, Copy, Upload } from "lucide-react";

interface Figure {
  id: string;
  figure_number: number;
  caption: string;
  image_url: string;
  alt_text?: string;
}

interface FigureManagerProps {
  reportId?: string;
  onInsertReference?: (reference: string) => void;
}

export const FigureManager = ({ reportId, onInsertReference }: FigureManagerProps) => {
  const [figures, setFigures] = useState<Figure[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newFigure, setNewFigure] = useState({
    caption: "",
    alt_text: "",
    image_url: "",
  });

  useEffect(() => {
    if (reportId) {
      fetchFigures();
    }
  }, [reportId]);

  const fetchFigures = async () => {
    if (!reportId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('figures')
        .select('*')
        .eq('report_id', reportId)
        .order('figure_number', { ascending: true });

      if (error) throw error;
      setFigures(data || []);
    } catch (error) {
      console.error('Error fetching figures:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "Please upload an image file", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in", variant: "destructive" });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('report-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('report-files')
        .getPublicUrl(fileName);

      setNewFigure(prev => ({ ...prev, image_url: publicUrl }));
      toast({ title: "Image uploaded" });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddFigure = async () => {
    if (!newFigure.image_url || !newFigure.caption) {
      toast({ title: "Image and caption are required", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in", variant: "destructive" });
        return;
      }

      const nextNumber = figures.length + 1;

      const { data, error } = await supabase
        .from('figures')
        .insert({
          user_id: user.id,
          report_id: reportId,
          figure_number: nextNumber,
          caption: newFigure.caption,
          image_url: newFigure.image_url,
          alt_text: newFigure.alt_text || null,
        })
        .select()
        .single();

      if (error) throw error;

      setFigures(prev => [...prev, data]);
      setNewFigure({ caption: "", alt_text: "", image_url: "" });
      setIsAddDialogOpen(false);
      toast({ title: `Figure ${nextNumber} added` });
    } catch (error) {
      console.error('Error adding figure:', error);
      toast({ title: "Failed to add figure", variant: "destructive" });
    }
  };

  const handleDeleteFigure = async (id: string) => {
    try {
      const { error } = await supabase
        .from('figures')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFigures(prev => {
        const filtered = prev.filter(f => f.id !== id);
        // Re-number figures
        return filtered.map((f, i) => ({ ...f, figure_number: i + 1 }));
      });
      toast({ title: "Figure deleted" });
    } catch (error) {
      console.error('Error deleting figure:', error);
      toast({ title: "Failed to delete figure", variant: "destructive" });
    }
  };

  const handleCopyReference = (figureNumber: number) => {
    const reference = `Figure ${figureNumber}`;
    navigator.clipboard.writeText(reference);
    toast({ title: "Reference copied" });
  };

  const handleInsertReference = (figureNumber: number) => {
    onInsertReference?.(`(see Figure ${figureNumber})`);
    toast({ title: "Reference inserted" });
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Image className="h-4 w-4 text-primary" />
            Figures
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 px-2">
                <Plus className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Figure</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Upload Image</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    className="w-full mt-1"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {isUploading ? "Uploading..." : "Choose Image"}
                  </Button>
                  {newFigure.image_url && (
                    <img 
                      src={newFigure.image_url} 
                      alt="Preview" 
                      className="mt-2 max-h-32 object-contain rounded border"
                    />
                  )}
                </div>
                <div>
                  <Label className="text-xs">Caption *</Label>
                  <Input
                    value={newFigure.caption}
                    onChange={(e) => setNewFigure(p => ({ ...p, caption: e.target.value }))}
                    placeholder="Description of the figure"
                  />
                </div>
                <div>
                  <Label className="text-xs">Alt Text (for accessibility)</Label>
                  <Input
                    value={newFigure.alt_text}
                    onChange={(e) => setNewFigure(p => ({ ...p, alt_text: e.target.value }))}
                    placeholder="Brief description for screen readers"
                  />
                </div>
                <Button onClick={handleAddFigure} className="w-full" disabled={!newFigure.image_url}>
                  Add Figure
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[150px]">
          <AnimatePresence>
            {figures.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-6">
                No figures added yet
              </div>
            ) : (
              <div className="space-y-2">
                {figures.map((figure) => (
                  <motion.div
                    key={figure.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-xs group"
                  >
                    <img 
                      src={figure.image_url} 
                      alt={figure.alt_text || figure.caption}
                      className="h-10 w-10 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">Figure {figure.figure_number}</p>
                      <p className="text-muted-foreground truncate">{figure.caption}</p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => handleCopyReference(figure.figure_number)}
                        title="Copy reference"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteFigure(figure.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
