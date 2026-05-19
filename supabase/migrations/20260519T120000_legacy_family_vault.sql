-- Beiza Legacy: family circles, members, recordings + RLS

CREATE TYPE legacy_member_role AS ENUM ('keeper', 'member');

CREATE TABLE family_circles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 100),
  invite_code TEXT NOT NULL UNIQUE,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE family_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id    UUID NOT NULL REFERENCES family_circles(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         legacy_member_role NOT NULL DEFAULT 'member',
  display_name TEXT,
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (circle_id, user_id)
);

CREATE TABLE recordings (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id        UUID NOT NULL REFERENCES family_circles(id) ON DELETE CASCADE,
  recorded_by      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt           TEXT NOT NULL,
  audio_url        TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  title            TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_family_members_user ON family_members (user_id);
CREATE INDEX idx_family_members_circle ON family_members (circle_id);
CREATE INDEX idx_recordings_circle ON recordings (circle_id, created_at DESC);

-- Helper: is current user in circle?
CREATE OR REPLACE FUNCTION legacy_user_in_circle(p_circle_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM family_members
    WHERE circle_id = p_circle_id AND user_id = auth.uid()
  );
$$;

ALTER TABLE family_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- family_circles
CREATE POLICY "legacy_circles_select_member"
  ON family_circles FOR SELECT
  USING (legacy_user_in_circle(id));

CREATE POLICY "legacy_circles_insert_auth"
  ON family_circles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "legacy_circles_update_keeper"
  ON family_circles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members m
      WHERE m.circle_id = id AND m.user_id = auth.uid() AND m.role = 'keeper'
    )
  );

-- Allow invite lookup by code (authenticated users joining)
CREATE POLICY "legacy_circles_select_by_invite"
  ON family_circles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- family_members
CREATE POLICY "legacy_members_select_circle"
  ON family_members FOR SELECT
  USING (legacy_user_in_circle(circle_id));

CREATE POLICY "legacy_members_insert_self"
  ON family_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- recordings
CREATE POLICY "legacy_recordings_select_circle"
  ON recordings FOR SELECT
  USING (legacy_user_in_circle(circle_id));

CREATE POLICY "legacy_recordings_insert_member"
  ON recordings FOR INSERT
  WITH CHECK (
    recorded_by = auth.uid() AND legacy_user_in_circle(circle_id)
  );

-- Storage bucket for legacy audio
INSERT INTO storage.buckets (id, name, public)
VALUES ('legacy-recordings', 'legacy-recordings', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "legacy_storage_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'legacy-recordings' AND auth.uid() IS NOT NULL);

CREATE POLICY "legacy_storage_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'legacy-recordings'
    AND auth.uid() IS NOT NULL
  );
