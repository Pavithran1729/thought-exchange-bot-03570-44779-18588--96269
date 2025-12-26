-- Create academic_profiles table for saving and reusing academic details
CREATE TABLE public.academic_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  author_name TEXT,
  student_id TEXT,
  institution TEXT,
  department TEXT,
  course TEXT,
  supervisor_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.academic_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for academic_profiles
CREATE POLICY "Users can view their own profiles" 
ON public.academic_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profiles" 
ON public.academic_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles" 
ON public.academic_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles" 
ON public.academic_profiles 
FOR DELETE 
USING (auth.uid() = user_id);