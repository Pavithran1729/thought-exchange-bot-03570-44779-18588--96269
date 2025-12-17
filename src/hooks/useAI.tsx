import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import type { AcademicReportConfig } from '@/types/academicReport';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateReport = async (
    title: string,
    template: string = 'professional',
    documentContent: string = '',
    additionalInstructions: string = '',
    academicConfig?: AcademicReportConfig
  ): Promise<string | null> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('generate-report', {
        body: { 
          title, 
          template, 
          documentContent, 
          additionalInstructions,
          reportType: academicConfig?.reportType || 'project-report',
          academicDetails: academicConfig?.academicDetails || null
        },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast({
            title: "Rate limit exceeded",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: "AI credits depleted",
            description: "Please add more credits to continue.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return null;
      }

      return data?.content || null;
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Failed to generate report",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const enhanceContent = async (
    content: string,
    enhancementType: 'expand' | 'summarize' | 'improve' | 'rephrase' = 'improve',
    tone: string = 'professional'
  ): Promise<string | null> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('enhance-content', {
        body: { content, enhancementType, tone },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast({
            title: "Rate limit exceeded",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: "AI credits depleted",
            description: "Please add more credits to continue.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return null;
      }

      return data?.content || null;
    } catch (error) {
      console.error('Error enhancing content:', error);
      toast({
        title: "Failed to enhance content",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const extractInsights = async (content: string): Promise<any | null> => {
    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('extract-insights', {
        body: { content },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast({
            title: "Rate limit exceeded",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
        } else if (error.message?.includes('402')) {
          toast({
            title: "AI credits depleted",
            description: "Please add more credits to continue.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return null;
      }

      return data || null;
    } catch (error) {
      console.error('Error extracting insights:', error);
      toast({
        title: "Failed to extract insights",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    generateReport,
    enhanceContent,
    extractInsights,
  };
};
