-- Create ads table
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT NOT NULL,
    placement TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add status constraint
ALTER TABLE public.ads
    ADD CONSTRAINT ads_status_check
    CHECK (status IN ('draft', 'active', 'archived'));

-- Create trigger for updated_at timestamp
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.ads
FOR EACH ROW EXECUTE PROCEDURE public.trigger_set_timestamp();

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public ads" ON public.ads
    FOR SELECT USING (status = 'active');

CREATE POLICY "Managers manage ads" ON public.ads
    FOR ALL USING (public.is_manager()) WITH CHECK (public.is_manager());

