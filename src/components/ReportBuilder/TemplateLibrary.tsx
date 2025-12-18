import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { templates, Template } from "@/utils/templates";
import { Layout, Plus, Trash2, Check, Star, Building, FileText } from "lucide-react";

interface CustomTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  university_name?: string;
  styles: Template['styles'];
  is_public: boolean;
}

interface TemplateLibraryProps {
  selectedTemplate: string;
  onTemplateSelect: (templateId: string, styles?: Template['styles']) => void;
}

// Preset academic templates
const presetTemplates: { id: string; name: string; description: string; category: string; styles: Template['styles'] }[] = [
  {
    id: 'ieee-paper',
    name: 'IEEE Paper',
    description: 'Standard IEEE conference/journal format',
    category: 'ieee',
    styles: {
      fontSize: { h1: '2xl', h2: 'xl', h3: 'lg', body: 'sm' },
      fontFamily: { heading: 'font-serif', body: 'font-serif' },
      spacing: { paragraph: 'mb-3', section: 'mb-6' },
      colors: { heading: 'text-foreground', body: 'text-foreground', accent: 'text-foreground', background: 'bg-white' },
      decoration: { headingUnderline: false, accentBar: false, shadow: false },
    },
  },
  {
    id: 'acm-paper',
    name: 'ACM Conference',
    description: 'ACM SIGCHI format',
    category: 'acm',
    styles: {
      fontSize: { h1: '3xl', h2: '2xl', h3: 'xl', body: 'base' },
      fontFamily: { heading: 'font-sans', body: 'font-serif' },
      spacing: { paragraph: 'mb-4', section: 'mb-8' },
      colors: { heading: 'text-foreground', body: 'text-foreground/90', accent: 'text-primary', background: 'bg-background' },
      decoration: { headingUnderline: false, accentBar: true, shadow: false },
    },
  },
  {
    id: 'thesis-chapter',
    name: 'Thesis Chapter',
    description: 'Standard thesis/dissertation format',
    category: 'thesis',
    styles: {
      fontSize: { h1: '4xl', h2: '2xl', h3: 'xl', body: 'base' },
      fontFamily: { heading: 'font-serif', body: 'font-serif' },
      spacing: { paragraph: 'mb-6', section: 'mb-12' },
      colors: { heading: 'text-foreground', body: 'text-foreground/85', accent: 'text-foreground', background: 'bg-background' },
      decoration: { headingUnderline: false, accentBar: false, shadow: false },
    },
  },
];

export const TemplateLibrary = ({ selectedTemplate, onTemplateSelect }: TemplateLibraryProps) => {
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'personal',
    university_name: '',
  });

  useEffect(() => {
    fetchCustomTemplates();
  }, []);

  const fetchCustomTemplates = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('custom_templates')
        .select('*')
        .or(`user_id.eq.${user.id},is_public.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setCustomTemplates(data?.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description || undefined,
        category: t.category || 'personal',
        university_name: t.university_name || undefined,
        styles: t.styles as Template['styles'],
        is_public: t.is_public || false,
      })) || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in", variant: "destructive" });
        return;
      }

      // Get current template styles as base
      const baseTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];

      const { data, error } = await supabase
        .from('custom_templates')
        .insert({
          user_id: user.id,
          name: newTemplate.name,
          description: newTemplate.description || null,
          category: newTemplate.category,
          university_name: newTemplate.university_name || null,
          styles: baseTemplate.styles,
          is_public: false,
        })
        .select()
        .single();

      if (error) throw error;

      setCustomTemplates(prev => [{
        id: data.id,
        name: data.name,
        description: data.description || undefined,
        category: data.category || 'personal',
        university_name: data.university_name || undefined,
        styles: data.styles as Template['styles'],
        is_public: data.is_public || false,
      }, ...prev]);

      setNewTemplate({ name: '', description: '', category: 'personal', university_name: '' });
      setIsCreateDialogOpen(false);
      toast({ title: "Template saved" });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({ title: "Failed to save template", variant: "destructive" });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCustomTemplates(prev => prev.filter(t => t.id !== id));
      toast({ title: "Template deleted" });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({ title: "Failed to delete template", variant: "destructive" });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ieee':
      case 'acm':
        return <FileText className="h-3 w-3" />;
      case 'university':
        return <Building className="h-3 w-3" />;
      default:
        return <Star className="h-3 w-3" />;
    }
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layout className="h-4 w-4 text-primary" />
            Template Library
          </CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 px-2">
                <Plus className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save as Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Template Name *</Label>
                  <Input
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(p => ({ ...p, name: e.target.value }))}
                    placeholder="My Custom Template"
                  />
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Input
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(p => ({ ...p, description: e.target.value }))}
                    placeholder="Brief description"
                  />
                </div>
                <div>
                  <Label className="text-xs">University (optional)</Label>
                  <Input
                    value={newTemplate.university_name}
                    onChange={(e) => setNewTemplate(p => ({ ...p, university_name: e.target.value }))}
                    placeholder="University name"
                  />
                </div>
                <Button onClick={handleCreateTemplate} className="w-full">
                  Save Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="w-full h-8">
            <TabsTrigger value="presets" className="text-xs flex-1">Presets</TabsTrigger>
            <TabsTrigger value="custom" className="text-xs flex-1">My Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="mt-2">
            <ScrollArea className="h-[180px]">
              <div className="space-y-2">
                {/* Built-in templates */}
                {templates.map((template) => (
                  <motion.div
                    key={template.id}
                    whileHover={{ scale: 1.01 }}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate === template.id 
                        ? 'bg-primary/20 border border-primary' 
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                    onClick={() => onTemplateSelect(template.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{template.name}</p>
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      </div>
                      {selectedTemplate === template.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </motion.div>
                ))}

                {/* Preset academic templates */}
                <div className="pt-2 border-t border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Academic Presets</p>
                  {presetTemplates.map((template) => (
                    <motion.div
                      key={template.id}
                      whileHover={{ scale: 1.01 }}
                      className={`p-2 rounded-lg cursor-pointer transition-colors mb-1 ${
                        selectedTemplate === template.id 
                          ? 'bg-primary/20 border border-primary' 
                          : 'bg-muted/50 hover:bg-muted'
                      }`}
                      onClick={() => onTemplateSelect(template.id, template.styles)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(template.category)}
                          <div>
                            <p className="text-sm font-medium">{template.name}</p>
                            <p className="text-xs text-muted-foreground">{template.description}</p>
                          </div>
                        </div>
                        {selectedTemplate === template.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="custom" className="mt-2">
            <ScrollArea className="h-[180px]">
              <AnimatePresence>
                {customTemplates.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-6">
                    <Layout className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No custom templates saved</p>
                    <p className="text-xs mt-1">Click + to save current style as template</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customTemplates.map((template) => (
                      <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`p-2 rounded-lg cursor-pointer transition-colors group ${
                          selectedTemplate === template.id 
                            ? 'bg-primary/20 border border-primary' 
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                        onClick={() => onTemplateSelect(template.id, template.styles)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(template.category)}
                            <div>
                              <div className="flex items-center gap-1">
                                <p className="text-sm font-medium">{template.name}</p>
                                {template.is_public && (
                                  <Badge variant="outline" className="text-[10px]">Public</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {template.university_name || template.description || template.category}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            {selectedTemplate === template.id && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTemplate(template.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
