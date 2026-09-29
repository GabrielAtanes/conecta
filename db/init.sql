CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  username text NOT NULL,
  password_hash text,
  google_sub text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique_idx ON users (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_unique_idx ON users (lower(username));
CREATE UNIQUE INDEX IF NOT EXISTS users_google_sub_unique_idx ON users (google_sub) WHERE google_sub IS NOT NULL;