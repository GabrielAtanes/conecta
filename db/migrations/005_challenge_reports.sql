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
