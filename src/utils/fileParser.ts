import { supabase } from "@/integrations/supabase/client";

export const parseTextFile = async (file: File): Promise<string> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  // Handle PDF and DOCX files via edge function
  if (fileExtension === 'pdf' || fileExtension === 'docx') {
    return await parseDocumentFile(file);
  }

  // Handle text-based files directly
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        resolve(content);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    switch (fileExtension) {
      case 'txt':
      case 'md':
      case 'csv':
      case 'json':
        reader.readAsText(file);
        break;
      default:
        reject(new Error(`Unsupported file type: ${fileExtension}`));
    }
  });
};

const parseDocumentFile = async (file: File): Promise<string> => {
  try {
    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    // Call edge function to parse document
    const { data, error } = await supabase.functions.invoke('parse-document', {
      body: { 
        fileData: base64,
        fileName: file.name,
        fileType: file.type
      }
    });

    if (error) throw error;
    
    if (!data || !data.content) {
      throw new Error('Failed to extract content from document');
    }

    return data.content;
  } catch (error) {
    console.error('Error parsing document:', error);
    throw new Error(`Failed to parse document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
