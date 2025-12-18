import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TableIcon, Plus, Trash2, Copy, Minus } from "lucide-react";

interface ReportTable {
  id: string;
  table_number: number;
  caption: string;
  content: string[][];
}

interface TableEditorProps {
  reportId?: string;
  onInsertReference?: (reference: string) => void;
  onInsertTable?: (markdown: string) => void;
}

export const TableEditor = ({ reportId, onInsertReference, onInsertTable }: TableEditorProps) => {
  const [tables, setTables] = useState<ReportTable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const [newTable, setNewTable] = useState({
    caption: "",
    rows: 3,
    cols: 3,
    content: [['', '', ''], ['', '', ''], ['', '', '']],
  });

  useEffect(() => {
    if (reportId) {
      fetchTables();
    }
  }, [reportId]);

  const fetchTables = async () => {
    if (!reportId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('report_tables')
        .select('*')
        .eq('report_id', reportId)
        .order('table_number', { ascending: true });

      if (error) throw error;
      setTables(data?.map(t => ({
        id: t.id,
        table_number: t.table_number || 0,
        caption: t.caption || '',
        content: (t.content as string[][]) || [],
      })) || []);
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const adjustTableSize = (newRows: number, newCols: number) => {
    const content = [...newTable.content];
    
    // Adjust rows
    while (content.length < newRows) {
      content.push(Array(newCols).fill(''));
    }
    while (content.length > newRows) {
      content.pop();
    }
    
    // Adjust columns
    for (let i = 0; i < content.length; i++) {
      while (content[i].length < newCols) {
        content[i].push('');
      }
      while (content[i].length > newCols) {
        content[i].pop();
      }
    }
    
    setNewTable(prev => ({ ...prev, rows: newRows, cols: newCols, content }));
  };

  const updateCell = (row: number, col: number, value: string) => {
    const content = [...newTable.content];
    content[row][col] = value;
    setNewTable(prev => ({ ...prev, content }));
  };

  const handleAddTable = async () => {
    if (!newTable.caption) {
      toast({ title: "Caption is required", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in", variant: "destructive" });
        return;
      }

      const nextNumber = tables.length + 1;

      const { data, error } = await supabase
        .from('report_tables')
        .insert({
          user_id: user.id,
          report_id: reportId,
          table_number: nextNumber,
          caption: newTable.caption,
          content: newTable.content,
        })
        .select()
        .single();

      if (error) throw error;

      setTables(prev => [...prev, {
        id: data.id,
        table_number: data.table_number || 0,
        caption: data.caption || '',
        content: (data.content as string[][]) || [],
      }]);
      
      setNewTable({
        caption: "",
        rows: 3,
        cols: 3,
        content: [['', '', ''], ['', '', ''], ['', '', '']],
      });
      setIsAddDialogOpen(false);
      toast({ title: `Table ${nextNumber} added` });
    } catch (error) {
      console.error('Error adding table:', error);
      toast({ title: "Failed to add table", variant: "destructive" });
    }
  };

  const handleDeleteTable = async (id: string) => {
    try {
      const { error } = await supabase
        .from('report_tables')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTables(prev => {
        const filtered = prev.filter(t => t.id !== id);
        return filtered.map((t, i) => ({ ...t, table_number: i + 1 }));
      });
      toast({ title: "Table deleted" });
    } catch (error) {
      console.error('Error deleting table:', error);
      toast({ title: "Failed to delete table", variant: "destructive" });
    }
  };

  const tableToMarkdown = (table: ReportTable): string => {
    if (table.content.length === 0) return '';
    
    const header = `| ${table.content[0].join(' | ')} |`;
    const separator = `| ${table.content[0].map(() => '---').join(' | ')} |`;
    const rows = table.content.slice(1).map(row => `| ${row.join(' | ')} |`).join('\n');
    
    return `**Table ${table.table_number}: ${table.caption}**\n\n${header}\n${separator}\n${rows}`;
  };

  const handleInsertTable = (table: ReportTable) => {
    onInsertTable?.(tableToMarkdown(table));
    toast({ title: "Table inserted" });
  };

  const handleCopyReference = (tableNumber: number) => {
    navigator.clipboard.writeText(`Table ${tableNumber}`);
    toast({ title: "Reference copied" });
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <TableIcon className="h-4 w-4 text-primary" />
            Tables
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 px-2">
                <Plus className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Table</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Caption *</Label>
                  <Input
                    value={newTable.caption}
                    onChange={(e) => setNewTable(p => ({ ...p, caption: e.target.value }))}
                    placeholder="Description of the table"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Rows:</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => adjustTableSize(Math.max(2, newTable.rows - 1), newTable.cols)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{newTable.rows}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => adjustTableSize(Math.min(10, newTable.rows + 1), newTable.cols)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">Columns:</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => adjustTableSize(newTable.rows, Math.max(2, newTable.cols - 1))}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{newTable.cols}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => adjustTableSize(newTable.rows, Math.min(8, newTable.cols + 1))}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <tbody>
                      {newTable.content.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {row.map((cell, colIdx) => (
                            <td key={colIdx} className="p-1">
                              <Input
                                value={cell}
                                onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                                placeholder={rowIdx === 0 ? `Header ${colIdx + 1}` : `Cell`}
                                className={`text-sm h-8 ${rowIdx === 0 ? 'font-medium bg-muted' : ''}`}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Button onClick={handleAddTable} className="w-full">
                  Create Table
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea className="h-[150px]">
          <AnimatePresence>
            {tables.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-6">
                No tables created yet
              </div>
            ) : (
              <div className="space-y-2">
                {tables.map((table) => (
                  <motion.div
                    key={table.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-2 bg-muted/50 rounded-lg text-xs group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">Table {table.table_number}</p>
                        <p className="text-muted-foreground truncate">{table.caption}</p>
                        <p className="text-muted-foreground">
                          {table.content.length} rows × {table.content[0]?.length || 0} cols
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleInsertTable(table)}
                          title="Insert table"
                        >
                          <TableIcon className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyReference(table.table_number)}
                          title="Copy reference"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteTable(table.id)}
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
      </CardContent>
    </Card>
  );
};
