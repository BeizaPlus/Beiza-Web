-- Recovery requests, circle access codes, circle_members, public directory support
-- family_people = tree nodes; recordings/events/gallery_assets remain separate domains.

-- ---------------------------------------------------------------------------
-- family_circles: access code gate (public cover, private tree)
-- ---------------------------------------------------------------------------
ALTER TABLE family_circles
  ADD COLUMN IF NOT EXISTS access_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS access_code_hint TEXT,
  ADD COLUMN IF NOT EXISTS since_year INTEGER,
  ADD COLUMN IF NOT EXISTS is_in_memoriam BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION family_circles_set_access_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.access_code IS NULL OR trim(NEW.access_code) = '' THEN
    NEW.access_code := upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6));
  END IF;
  NEW.access_code := upper(trim(NEW.access_code));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_family_circles_access_code ON family_circles;
CREATE TRIGGER trg_family_circles_access_code
  BEFORE INSERT OR UPDATE OF access_code ON family_circles
  FOR EACH ROW
  EXECUTE FUNCTION family_circles_set_access_code();

UPDATE family_circles
SET access_code = upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6))
WHERE access_code IS NULL;

ALTER TABLE family_circles
  ALTER COLUMN access_code SET NOT NULL;

-- ---------------------------------------------------------------------------
-- circle_members (gate + invites + recovery; complements family_members)
-- ---------------------------------------------------------------------------
CREATE TYPE circle_member_role AS ENUM ('admin', 'member', 'viewer');
CREATE TYPE circle_joined_via AS ENUM ('code', 'invite', 'recovery');

CREATE TABLE circle_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id   UUID NOT NULL REFERENCES family_circles(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email       TEXT,
  role        circle_member_role NOT NULL DEFAULT 'member',
  joined_via  circle_joined_via NOT NULL DEFAULT 'code',
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (circle_id, user_id)
);

CREATE INDEX idx_circle_members_circle ON circle_members (circle_id);
CREATE INDEX idx_circle_members_user ON circle_members (user_id) WHERE user_id IS NOT NULL;

-- Short-lived tokens issued after successful access code (validated via API)
CREATE TABLE circle_access_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id   UUID NOT NULL REFERENCES family_circles(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_circle_access_tokens_circle ON circle_access_tokens (circle_id);
CREATE INDEX idx_circle_access_tokens_expires ON circle_access_tokens (expires_at);

-- ---------------------------------------------------------------------------
-- recovery_requests (White Swan / Heritage intake — no auth)
-- ---------------------------------------------------------------------------
CREATE TYPE recovery_request_status AS ENUM ('pending', 'reviewing', 'resolved');

CREATE TABLE recovery_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deceased_name     TEXT NOT NULL,
  deceased_contact  TEXT NOT NULL,
  requester_relation TEXT NOT NULL,
  requester_email   TEXT NOT NULL,
  document_url      TEXT,
  message           TEXT,
  status            recovery_request_status NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Public directory (covers only — no access_code exposed)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION list_public_family_circles()
RETURNS TABLE (
  id UUID,
  name TEXT,
  member_count BIGINT,
  memory_count BIGINT,
  since_year INTEGER,
  is_in_memoriam BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.name,
    (
      SELECT count(*)::bigint
      FROM family_people p
      WHERE p.circle_id = c.id
    ) + (
      SELECT count(*)::bigint
      FROM family_members fm
      WHERE fm.circle_id = c.id
    ) AS member_count,
    (SELECT count(*)::bigint FROM recordings r WHERE r.circle_id = c.id) AS memory_count,
    c.since_year,
    c.is_in_memoriam
  FROM family_circles c
  ORDER BY c.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION list_public_family_circles() TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "circle_members_select_self"
  ON circle_members FOR SELECT
  USING (user_id = auth.uid() OR legacy_user_in_circle(circle_id));

CREATE POLICY "recovery_requests_no_public"
  ON recovery_requests FOR SELECT
  USING (false);

-- Public cover metadata (never exposes access_code)
CREATE OR REPLACE FUNCTION get_public_circle_cover(p_circle_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  member_count BIGINT,
  memory_count BIGINT,
  since_year INTEGER,
  is_in_memoriam BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    c.name,
    (
      SELECT count(*)::bigint FROM family_people p WHERE p.circle_id = c.id
    ) + (
      SELECT count(*)::bigint FROM family_members fm WHERE fm.circle_id = c.id
    ),
    (SELECT count(*)::bigint FROM recordings r WHERE r.circle_id = c.id),
    c.since_year,
    c.is_in_memoriam
  FROM family_circles c
  WHERE c.id = p_circle_id;
$$;

GRANT EXECUTE ON FUNCTION get_public_circle_cover(UUID) TO anon, authenticated;

-- Storage: optional recovery documents (upload via service role API)
INSERT INTO storage.buckets (id, name, public)
VALUES ('recovery-documents', 'recovery-documents', false)
ON CONFLICT (id) DO NOTHING;
