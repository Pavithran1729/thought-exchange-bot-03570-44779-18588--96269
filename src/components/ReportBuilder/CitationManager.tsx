import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { parseBibTeX, generateBibTeXEntry } from "@/utils/bibtexParser";
import { formatCitation, formatInTextCitation } from "@/utils/citationFormatter";
import { BookOpen, Plus, Trash2, Copy, Upload, Download, Search } from "lucide-react";
import type { CitationStyle } from "@/types/academicReport";

interface Citation {
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  journal?: string;
  volume?: string;
  pages?: string;
  doi?: string;
  url?: string;
  citation_key?: string;
  bibtex_raw?: string;
}

interface CitationManagerProps {
  reportId?: string;
  citationStyle: CitationStyle;
  onInsertCitation?: (citation: string) => void;
}

export const CitationManager = ({ reportId, citationStyle, onInsertCitation }: CitationManagerProps) => {
  const [citations, setCitations] = useState<Citation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [bibtexInput, setBibtexInput] = useState("");
  
  const [newCitation, setNewCitation] = useState({
    title: "",
    authors: "",
    year: "",
    journal: "",
    volume: "",
    pages: "",
    doi: "",
    url: "",
  });

  useEffect(() => {
    if (reportId) {
      fetchCitations();
    }
  }, [reportId]);

  const fetchCitations = async () => {
    if (!reportId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('citations')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      setCitations(data?.map(c => ({
        id: c.id,
        title: c.title,
        authors: c.authors || [],
        year: c.year,
        journal: c.journal || undefined,
        volume: c.volume || undefined,
        pages: c.pages || undefined,
        doi: c.doi || undefined,
        url: c.url || undefined,
        citation_key: c.citation_key || undefined,
        bibtex_raw: c.bibtex_raw || undefined,
      })) || []);
    } catch (error) {
      console.error('Error fetching citations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCitation = async () => {
    if (!newCitation.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in", variant: "destructive" });
        return;
      }

      const authors = newCitation.authors.split(/[,;]/).map(a => a.trim()).filter(a => a);
      const year = newCitation.year ? parseInt(newCitation.year) : null;

      const { data, error } = await supabase
        .from('citations')
        .insert({
          user_id: user.id,
          report_id: reportId,
          title: newCitation.title,
          authors,
          year,
          journal: newCitation.journal || null,
          volume: newCitation.volume || null,
          pages: newCitation.pages || null,
          doi: newCitation.doi || null,
          url: newCitation.url || null,
          citation_key: authors[0]?.split(' ')[0]?.toLowerCase() + (year || ''),
        })
        .select()
        .single();

      if (error) throw error;

      setCitations(prev => [...prev, {
        id: data.id,
        title: data.title,
        authors: data.authors || [],
        year: data.year,
        journal: data.journal || undefined,
        volume: data.volume || undefined,
        pages: data.pages || undefined,
        doi: data.doi || undefined,
        url: data.url || undefined,
      }]);

      setNewCitation({ title: "", authors: "", year: "", journal: "", volume: "", pages: "", doi: "", url: "" });
      setIsAddDialogOpen(false);
      toast({ title: "Citation added" });
    } catch (error) {
      console.error('Error adding citation:', error);
      toast({ title: "Failed to add citation", variant: "destructive" });
    }
  };

  const handleImportBibTeX = async () => {
    const parsed = parseBibTeX(bibtexInput);
    
    if (parsed.length === 0) {
      toast({ title: "No valid BibTeX entries found", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in", variant: "destructive" });
        return;
      }

      const toInsert = parsed.map(p => ({
        user_id: user.id,
        report_id: reportId,
        title: p.title,
        authors: p.authors,
        year: p.year,
        journal: p.journal || null,
        volume: p.volume || null,
        pages: p.pages || null,
        doi: p.doi || null,
        url: p.url || null,
        citation_key: p.citationKey,
        bibtex_raw: p.bibtexRaw,
      }));

      const { data, error } = await supabase
        .from('citations')
        .insert(toInsert)
        .select();

      if (error) throw error;

      setCitations(prev => [...prev, ...(data?.map(c => ({
        id: c.id,
        title: c.title,
        authors: c.authors || [],
        year: c.year,
        journal: c.journal || undefined,
        volume: c.volume || undefined,
        pages: c.pages || undefined,
        doi: c.doi || undefined,
        url: c.url || undefined,
      })) || [])]);

      setBibtexInput("");
      setIsImportDialogOpen(false);
      toast({ title: `Imported ${parsed.length} citations` });
    } catch (error) {
      console.error('Error importing BibTeX:', error);
      toast({ title: "Failed to import citations", variant: "destructive" });
    }
  };

  const handleDeleteCitation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('citations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCitations(prev => prev.filter(c => c.id !== id));
      toast({ title: "Citation deleted" });
    } catch (error) {
      console.error('Error deleting citation:', error);
      toast({ title: "Failed to delete citation", variant: "destructive" });
    }
  };

  const handleCopyInTextCitation = (citation: Citation, index: number) => {
    const inText = formatInTextCitation(citation.authors, citation.year, citationStyle, index + 1);
    navigator.clipboard.writeText(inText);
    toast({ title: "In-text citation copied" });
  };

  const handleInsertCitation = (citation: Citation, index: number) => {
    const inText = formatInTextCitation(citation.authors, citation.year, citationStyle, index + 1);
    onInsertCitation?.(inText);
    toast({ title: "Citation inserted" });
  };

  const exportBibTeX = () => {
    const bibtex = citations.map(c => 
      c.bibtex_raw || generateBibTeXEntry({
        citationKey: c.citation_key || c.authors[0]?.split(' ')[0]?.toLowerCase() + (c.year || ''),
        title: c.title,
        authors: c.authors,
        year: c.year || undefined,
        journal: c.journal,
        volume: c.volume,
        pages: c.pages,
        doi: c.doi,
        url: c.url,
      })
    ).join('\n\n');

    const blob = new Blob([bibtex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'references.bib';
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredCitations = citations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.authors.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-primary" />
            Citation Manager
          </CardTitle>
          <div className="flex gap-1">
            <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 px-2">
                  <Upload className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Import BibTeX</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Paste BibTeX entries here..."
                    value={bibtexInput}
                    onChange={(e) => setBibtexInput(e.target.value)}
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <Button onClick={handleImportBibTeX} className="w-full">
                    Import Citations
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {citations.length > 0 && (
              <Button variant="outline" size="sm" className="h-7 px-2" onClick={exportBibTeX}>
                <Download className="h-3 w-3" />
              </Button>
            )}

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-7 px-2">
                  <Plus className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Citation</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Title *</Label>
                    <Input
                      value={newCitation.title}
                      onChange={(e) => setNewCitation(p => ({ ...p, title: e.target.value }))}
                      placeholder="Publication title"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Authors (comma-separated)</Label>
                    <Input
                      value={newCitation.authors}
                      onChange={(e) => setNewCitation(p => ({ ...p, authors: e.target.value }))}
                      placeholder="Smith, John; Doe, Jane"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Year</Label>
                      <Input
                        type="number"
                        value={newCitation.year}
                        onChange={(e) => setNewCitation(p => ({ ...p, year: e.target.value }))}
                        placeholder="2024"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Journal/Conference</Label>
                      <Input
                        value={newCitation.journal}
                        onChange={(e) => setNewCitation(p => ({ ...p, journal: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Volume</Label>
                      <Input
                        value={newCitation.volume}
                        onChange={(e) => setNewCitation(p => ({ ...p, volume: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Pages</Label>
                      <Input
                        value={newCitation.pages}
                        onChange={(e) => setNewCitation(p => ({ ...p, pages: e.target.value }))}
                        placeholder="1-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">DOI</Label>
                    <Input
                      value={newCitation.doi}
                      onChange={(e) => setNewCitation(p => ({ ...p, doi: e.target.value }))}
                      placeholder="10.1000/xyz123"
                    />
                  </div>
                  <Button onClick={handleAddCitation} className="w-full">
                    Add Citation
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {citations.length > 3 && (
          <div className="relative mb-3">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search citations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-sm"
            />
          </div>
        )}

        <ScrollArea className="h-[200px]">
          <AnimatePresence>
            {filteredCitations.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                No citations added yet
              </div>
            ) : (
              <div className="space-y-2">
                {filteredCitations.map((citation, index) => (
                  <motion.div
                    key={citation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-2 bg-muted/50 rounded-lg text-xs group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <Badge variant="outline" className="text-[10px] mb-1">
                          [{index + 1}]
                        </Badge>
                        <p className="font-medium truncate">{citation.title}</p>
                        <p className="text-muted-foreground truncate">
                          {citation.authors.join(', ')} {citation.year && `(${citation.year})`}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyInTextCitation(citation, index)}
                          title="Copy in-text citation"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCitation(citation.id)}
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

        {citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Formatted References ({citationStyle.toUpperCase()}):</p>
            <div className="text-xs space-y-1 max-h-[100px] overflow-y-auto">
              {citations.map((c, i) => (
                <p key={c.id} className="text-muted-foreground">
                  [{i + 1}] {formatCitation(c, citationStyle)}
                </p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
