
-- Create citations table for Citation Manager
CREATE TABLE public.citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  authors TEXT[],
  year INTEGER,
  journal TEXT,
  volume TEXT,
  pages TEXT,
  doi TEXT,
  url TEXT,
  bibtex_raw TEXT,
  citation_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for citations
CREATE POLICY "Users can view their own citations" ON public.citations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own citations" ON public.citations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own citations" ON public.citations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own citations" ON public.citations FOR DELETE USING (auth.uid() = user_id);

-- Create figures table for Figure Management
CREATE TABLE public.figures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  figure_number INTEGER,
  caption TEXT,
  image_url TEXT,
  alt_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.figures ENABLE ROW LEVEL SECURITY;

-- RLS Policies for figures
CREATE POLICY "Users can view their own figures" ON public.figures FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own figures" ON public.figures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own figures" ON public.figures FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own figures" ON public.figures FOR DELETE USING (auth.uid() = user_id);

-- Create report_tables table for Table Management
CREATE TABLE public.report_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  table_number INTEGER,
  caption TEXT,
  content JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.report_tables ENABLE ROW LEVEL SECURITY;

-- RLS Policies for report_tables
CREATE POLICY "Users can view their own tables" ON public.report_tables FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tables" ON public.report_tables FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tables" ON public.report_tables FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tables" ON public.report_tables FOR DELETE USING (auth.uid() = user_id);

-- Create custom_templates table for Template Library
CREATE TABLE public.custom_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'personal',
  university_name TEXT,
  styles JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.custom_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_templates
CREATE POLICY "Users can view their own templates" ON public.custom_templates FOR SELECT USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can create their own templates" ON public.custom_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own templates" ON public.custom_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own templates" ON public.custom_templates FOR DELETE USING (auth.uid() = user_id);
