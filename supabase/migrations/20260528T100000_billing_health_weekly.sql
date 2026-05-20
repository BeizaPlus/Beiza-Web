-- Billing (Keeper), health conditions, traits, weekly health question engine

CREATE TYPE legacy_billing_tier AS ENUM ('circle', 'keeper', 'heritage');
CREATE TYPE legacy_subscription_status AS ENUM (
  'none', 'active', 'past_due', 'canceled', 'trialing', 'incomplete'
);

CREATE TABLE legacy_entitlements (
  user_id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier                     legacy_billing_tier NOT NULL DEFAULT 'circle',
  status                   legacy_subscription_status NOT NULL DEFAULT 'none',
  stripe_customer_id       TEXT,
  stripe_subscription_id   TEXT,
  current_period_end       TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE stripe_events (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id  TEXT NOT NULL UNIQUE,
  event_type       TEXT NOT NULL,
  processed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Health (medical) — separate from character traits
-- ---------------------------------------------------------------------------
CREATE TYPE health_condition_category AS ENUM (
  'cardiovascular', 'metabolic', 'neurological', 'mental_health', 'cancer',
  'autoimmune', 'respiratory', 'musculoskeletal', 'hereditary', 'addiction', 'other'
);

CREATE TABLE person_health_conditions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id     UUID NOT NULL REFERENCES family_circles(id) ON DELETE CASCADE,
  person_id     UUID NOT NULL REFERENCES family_people(id) ON DELETE CASCADE,
  category      health_condition_category NOT NULL DEFAULT 'other',
  condition     TEXT NOT NULL CHECK (char_length(trim(condition)) > 0),
  age_of_onset  INTEGER CHECK (age_of_onset IS NULL OR age_of_onset BETWEEN 0 AND 120),
  still_active  BOOLEAN NOT NULL DEFAULT true,
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (circle_id, person_id, category, condition)
);

CREATE INDEX idx_person_health_circle ON person_health_conditions (circle_id);
CREATE INDEX idx_person_health_person ON person_health_conditions (person_id);

-- Character traits (persisted; replaces localStorage over time)
CREATE TYPE person_trait_category AS ENUM ('physical', 'personality', 'skills', 'known_for');

CREATE TABLE person_traits (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id  UUID NOT NULL REFERENCES family_circles(id) ON DELETE CASCADE,
  person_id  UUID NOT NULL REFERENCES family_people(id) ON DELETE CASCADE,
  category   person_trait_category NOT NULL,
  trait      TEXT NOT NULL CHECK (char_length(trim(trait)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (circle_id, person_id, category, trait)
);

CREATE INDEX idx_person_traits_person ON person_traits (person_id);

-- ---------------------------------------------------------------------------
-- Weekly health questions (52-week cycle; week counter is explicit)
-- ---------------------------------------------------------------------------
CREATE TABLE health_question_bank (
  id          TEXT PRIMARY KEY,
  prompt      TEXT NOT NULL,
  dimension   TEXT NOT NULL,
  retired     BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE circle_health_cadence (
  circle_id           UUID PRIMARY KEY REFERENCES family_circles(id) ON DELETE CASCADE,
  current_week_number INTEGER NOT NULL DEFAULT 1 CHECK (current_week_number >= 1),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE health_question_weeks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id       UUID NOT NULL REFERENCES family_circles(id) ON DELETE CASCADE,
  week_number     INTEGER NOT NULL CHECK (week_number >= 1),
  question_id     TEXT NOT NULL REFERENCES health_question_bank(id),
  custom_prompt   TEXT,
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (circle_id, week_number)
);

CREATE TABLE health_question_send_log (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id    UUID NOT NULL REFERENCES family_circles(id) ON DELETE CASCADE,
  week_number  INTEGER NOT NULL,
  email        TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error        TEXT,
  sent_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (circle_id, week_number, email)
);

CREATE TABLE health_question_opt_outs (
  email          TEXT PRIMARY KEY,
  circle_id      UUID REFERENCES family_circles(id) ON DELETE CASCADE,
  unsubscribed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE health_custom_questions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id    UUID NOT NULL REFERENCES family_circles(id) ON DELETE CASCADE,
  prompt       TEXT NOT NULL,
  target_week  INTEGER CHECK (target_week IS NULL OR target_week >= 1),
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Answers link to a person + week
CREATE TABLE health_question_answers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circle_id    UUID NOT NULL REFERENCES family_circles(id) ON DELETE CASCADE,
  week_number  INTEGER NOT NULL,
  person_id    UUID NOT NULL REFERENCES family_people(id) ON DELETE CASCADE,
  answer_text  TEXT NOT NULL,
  answered_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (circle_id, week_number, person_id)
);

-- RLS
ALTER TABLE legacy_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_health_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE circle_health_cadence ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_question_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_custom_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "legacy_entitlements_select_own"
  ON legacy_entitlements FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "person_health_select_circle"
  ON person_health_conditions FOR SELECT
  USING (legacy_user_in_circle(circle_id));

CREATE POLICY "person_health_mutate_circle"
  ON person_health_conditions FOR ALL
  USING (legacy_user_in_circle(circle_id))
  WITH CHECK (legacy_user_in_circle(circle_id));

CREATE POLICY "person_traits_select_circle"
  ON person_traits FOR SELECT
  USING (legacy_user_in_circle(circle_id));

CREATE POLICY "person_traits_mutate_circle"
  ON person_traits FOR ALL
  USING (legacy_user_in_circle(circle_id))
  WITH CHECK (legacy_user_in_circle(circle_id));

CREATE POLICY "cadence_select_circle"
  ON circle_health_cadence FOR SELECT
  USING (legacy_user_in_circle(circle_id));

CREATE POLICY "health_weeks_select_circle"
  ON health_question_weeks FOR SELECT
  USING (legacy_user_in_circle(circle_id));

CREATE POLICY "health_answers_select_circle"
  ON health_question_answers FOR SELECT
  USING (legacy_user_in_circle(circle_id));

CREATE POLICY "health_answers_insert_circle"
  ON health_question_answers FOR INSERT
  WITH CHECK (legacy_user_in_circle(circle_id));

CREATE POLICY "custom_questions_select_circle"
  ON health_custom_questions FOR SELECT
  USING (legacy_user_in_circle(circle_id));

CREATE POLICY "custom_questions_insert_keeper"
  ON health_custom_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members m
      WHERE m.circle_id = health_custom_questions.circle_id
        AND m.user_id = auth.uid()
        AND m.role = 'keeper'
    )
  );

-- Seed 52-week question bank (append-only; lookup by id)
INSERT INTO health_question_bank (id, prompt, dimension, sort_order) VALUES
  ('wk01', 'Has anyone in your family been diagnosed with high blood pressure?', 'cardiovascular', 1),
  ('wk02', 'Are there patterns of diabetes or blood sugar issues in your family?', 'metabolic', 2),
  ('wk03', 'Has stroke or heart attack affected close relatives?', 'cardiovascular', 3),
  ('wk04', 'Do mental health conditions run in your family (depression, anxiety, etc.)?', 'mental_health', 4),
  ('wk05', 'Has cancer appeared in more than one generation?', 'cancer', 5),
  ('wk06', 'Are there known hereditary conditions in your family line?', 'hereditary', 6),
  ('wk07', 'Has asthma or chronic lung disease affected relatives?', 'respiratory', 7),
  ('wk08', 'Do joint or back problems recur across generations?', 'musculoskeletal', 8),
  ('wk09', 'Has addiction (alcohol, substances) affected family members?', 'addiction', 9),
  ('wk10', 'Are autoimmune conditions (lupus, thyroid, etc.) present in the family?', 'autoimmune', 10),
  ('wk11', 'At what age did parents or grandparents first notice heart issues?', 'cardiovascular', 11),
  ('wk12', 'Who in the family manages cholesterol or statins?', 'cardiovascular', 12),
  ('wk13', 'Has anyone had kidney disease linked to diabetes or hypertension?', 'metabolic', 13),
  ('wk14', 'Are migraines or severe headaches common in the family?', 'neurological', 14),
  ('wk15', 'Has dementia or memory loss appeared in elders?', 'neurological', 15),
  ('wk16', 'Do skin conditions (eczema, psoriasis) run in the family?', 'autoimmune', 16),
  ('wk17', 'Has breast, prostate, or colon cancer affected multiple relatives?', 'cancer', 17),
  ('wk18', 'Are blood clots or DVT known in the family history?', 'cardiovascular', 18),
  ('wk19', 'Has gout or arthritis been discussed across generations?', 'musculoskeletal', 19),
  ('wk20', 'Do family members share similar sleep or insomnia patterns?', 'other', 20),
  ('wk21', 'Who had the earliest known heart-related diagnosis?', 'cardiovascular', 21),
  ('wk22', 'Are thyroid problems common on one side of the family?', 'metabolic', 22),
  ('wk23', 'Has epilepsy or seizures occurred in relatives?', 'neurological', 23),
  ('wk24', 'Do allergies or food sensitivities cluster in the family?', 'other', 24),
  ('wk25', 'Has liver disease (fatty liver, hepatitis) affected relatives?', 'metabolic', 25),
  ('wk26', 'Are vision or glaucoma issues hereditary in your line?', 'other', 26),
  ('wk27', 'Has sickle cell or blood disorder testing been part of family health talks?', 'hereditary', 27),
  ('wk28', 'Do relatives share similar weight or metabolism patterns?', 'metabolic', 28),
  ('wk29', 'Has panic disorder or PTSD been acknowledged in the family?', 'mental_health', 29),
  ('wk30', 'Are dental or gum disease patterns worth noting for health history?', 'other', 30),
  ('wk31', 'Who in the family had hypertension before age 50?', 'cardiovascular', 31),
  ('wk32', 'Has PCOS or fertility-related health been discussed?', 'metabolic', 32),
  ('wk33', 'Are chronic pain conditions (fibromyalgia, etc.) in the family?', 'musculoskeletal', 33),
  ('wk34', 'Has hepatitis B or C affected elders?', 'other', 34),
  ('wk35', 'Do family members get regular blood pressure checks?', 'cardiovascular', 35),
  ('wk36', 'Has anemia or iron deficiency been common?', 'other', 36),
  ('wk37', 'Are hearing loss patterns known in older relatives?', 'neurological', 37),
  ('wk38', 'Has osteoporosis or bone density issues been mentioned?', 'musculoskeletal', 38),
  ('wk39', 'Do relatives share similar dietary restrictions for health?', 'metabolic', 39),
  ('wk40', 'Has bipolar disorder or similar been named in family health talks?', 'mental_health', 40),
  ('wk41', 'Who had the most recent cancer diagnosis in the family?', 'cancer', 41),
  ('wk42', 'Are childhood illnesses (asthma, etc.) remembered across siblings?', 'respiratory', 42),
  ('wk43', 'Has anyone had organ transplant or dialysis in the family?', 'other', 43),
  ('wk44', 'Do men in the family discuss prostate screening?', 'cancer', 44),
  ('wk45', 'Has miscarriage or pregnancy loss been part of family health history?', 'other', 45),
  ('wk46', 'Are stroke symptoms recognized quickly in your family culture?', 'cardiovascular', 46),
  ('wk47', 'Has substance use recovery been part of family stories?', 'addiction', 47),
  ('wk48', 'Do women in the family share notes on mammogram timing?', 'cancer', 48),
  ('wk49', 'Has chronic fatigue or long illness affected multiple members?', 'other', 49),
  ('wk50', 'Are vitamin D or B12 deficiencies common when tested?', 'metabolic', 50),
  ('wk51', 'Who is the best source for accurate family medical history?', 'other', 51),
  ('wk52', 'What health screening would you want the next generation to prioritize?', 'other', 52)
ON CONFLICT (id) DO NOTHING;
