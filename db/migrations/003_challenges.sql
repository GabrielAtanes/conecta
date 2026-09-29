CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

CREATE TABLE IF NOT EXISTS challenge_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  position smallint NOT NULL CHECK (position BETWEEN 0 AND 3),
  title text NOT NULL,
  connection text NOT NULL,
  color text NOT NULL CHECK (color IN ('blue', 'green', 'orange', 'purple')),
  UNIQUE (challenge_id, position)
);

CREATE TABLE IF NOT EXISTS challenge_words (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES challenge_groups(id) ON DELETE CASCADE,
  position smallint NOT NULL CHECK (position BETWEEN 0 AND 3),
  label text NOT NULL,
  UNIQUE (group_id, position)
);

CREATE INDEX IF NOT EXISTS challenges_published_at_idx
  ON challenges (published_at DESC)
  WHERE status = 'published';