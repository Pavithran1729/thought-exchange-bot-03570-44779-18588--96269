import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface AcademicProfile {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  author_name: string | null;
  student_id: string | null;
  institution: string | null;
  department: string | null;
  course: string | null;
  supervisor_name: string | null;
  created_at: string;
}

export const useAcademicProfiles = () => {
  const [profiles, setProfiles] = useState<AcademicProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [defaultProfile, setDefaultProfile] = useState<AcademicProfile | null>(null);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('academic_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const typedData = data as AcademicProfile[];
      setProfiles(typedData || []);
      
      const defaultOne = typedData?.find(p => p.is_default);
      setDefaultProfile(defaultOne || null);
    } catch (error) {
      console.error('Error fetching academic profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const saveProfile = async (profileData: {
    name: string;
    author_name?: string;
    student_id?: string;
    institution?: string;
    department?: string;
    course?: string;
    supervisor_name?: string;
    is_default?: boolean;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Please sign in", variant: "destructive" });
        return null;
      }

      // If setting as default, unset other defaults first
      if (profileData.is_default) {
        await supabase
          .from('academic_profiles')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      const { data, error } = await supabase
        .from('academic_profiles')
        .insert({
          user_id: user.id,
          ...profileData,
        })
        .select()
        .single();

      if (error) throw error;

      toast({ title: "Profile saved successfully" });
      await fetchProfiles();
      return data as AcademicProfile;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({ title: "Failed to save profile", variant: "destructive" });
      return null;
    }
  };

  const setAsDefault = async (profileId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Unset all defaults
      await supabase
        .from('academic_profiles')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      await supabase
        .from('academic_profiles')
        .update({ is_default: true })
        .eq('id', profileId);

      toast({ title: "Default profile updated" });
      await fetchProfiles();
    } catch (error) {
      console.error('Error setting default:', error);
      toast({ title: "Failed to update default", variant: "destructive" });
    }
  };

  const deleteProfile = async (profileId: string) => {
    try {
      const { error } = await supabase
        .from('academic_profiles')
        .delete()
        .eq('id', profileId);

      if (error) throw error;

      toast({ title: "Profile deleted" });
      await fetchProfiles();
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast({ title: "Failed to delete profile", variant: "destructive" });
    }
  };

  return {
    profiles,
    loading,
    defaultProfile,
    fetchProfiles,
    saveProfile,
    setAsDefault,
    deleteProfile,
  };
};
