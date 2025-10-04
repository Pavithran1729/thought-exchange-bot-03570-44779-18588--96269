import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { ExtractedData } from '@/utils/regexProcessor';

export interface Report {
  id: string;
  title: string;
  content: string;
  template_id: string;
  extracted_data: ExtractedData[];
  ai_generated: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const saveReport = async (
    title: string,
    content: string,
    templateId: string,
    extractedData: ExtractedData[],
    aiGenerated: boolean
  ): Promise<Report | null> => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save reports",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          title,
          content,
          template_id: templateId,
          extracted_data: extractedData as any,
          ai_generated: aiGenerated,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Report saved!",
        description: "Your report has been saved successfully.",
      });

      return {
        ...data,
        extracted_data: data.extracted_data as unknown as ExtractedData[],
      };
    } catch (error) {
      console.error('Error saving report:', error);
      toast({
        title: "Failed to save report",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateReport = async (
    id: string,
    title: string,
    content: string,
    templateId: string,
    extractedData: ExtractedData[]
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('reports')
        .update({
          title,
          content,
          template_id: templateId,
          extracted_data: extractedData as any,
        })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Report updated!",
        description: "Your changes have been saved.",
      });

      return true;
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Failed to update report",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getReports = async (): Promise<Report[]> => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(report => ({
        ...report,
        extracted_data: report.extracted_data as unknown as ExtractedData[],
      }));
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Failed to load reports",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Report deleted",
        description: "The report has been deleted successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Failed to delete report",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    saveReport,
    updateReport,
    getReports,
    deleteReport,
  };
};