CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  username text NOT NULL,
  password_hash text,
  google_sub text,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique_idx ON users (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_unique_idx ON users (lower(username));
CREATE UNIQUE INDEX IF NOT EXISTS users_google_sub_unique_idx ON users (google_sub) WHERE google_sub IS NOT NULL;

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

CREATE TABLE IF NOT EXISTS challenge_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  error_count integer NOT NULL DEFAULT 0 CHECK (error_count >= 0),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE (user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS challenge_attempts_user_idx ON challenge_attempts (user_id);

CREATE TABLE IF NOT EXISTS challenge_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('palavras_ofensivas', 'preconceituoso', 'spam_propaganda', 'conteudo_improprio', 'outro')),
  details text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'rejected')),
  admin_response text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, reporter_id, reason)
);

CREATE INDEX IF NOT EXISTS challenge_reports_status_idx
  ON challenge_reports (status, created_at DESC);