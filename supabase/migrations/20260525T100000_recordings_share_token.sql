-- Public share links for vault memories (viral loop: /memory/[token])

ALTER TABLE public.recordings
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_recordings_share_token
  ON public.recordings (share_token)
  WHERE share_token IS NOT NULL;

COMMENT ON COLUMN public.recordings.share_token IS
  'Public playback token for beizalegacy.com/memory/[token]; raw download not exposed';

CREATE OR REPLACE FUNCTION public.get_public_shared_memory(p_share_token TEXT)
RETURNS TABLE (
  id UUID,
  prompt TEXT,
  audio_url TEXT,
  duration_seconds INTEGER,
  title TEXT,
  circle_name TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id,
    r.prompt,
    r.audio_url,
    r.duration_seconds,
    r.title,
    fc.name AS circle_name
  FROM public.recordings r
  JOIN public.family_circles fc ON fc.id = r.circle_id
  WHERE r.share_token = p_share_token
    AND r.audio_url IS NOT NULL
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_shared_memory(TEXT) TO anon, authenticated;
