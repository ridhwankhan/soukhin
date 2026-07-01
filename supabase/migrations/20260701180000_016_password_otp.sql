-- Password reset / change via email OTP

CREATE TABLE IF NOT EXISTS password_otp_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  otp_hash text NOT NULL,
  purpose text NOT NULL CHECK (purpose IN ('forgot', 'change')),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS password_otp_email_active_idx
  ON password_otp_requests (lower(email), created_at DESC)
  WHERE used_at IS NULL;

ALTER TABLE password_otp_requests ENABLE ROW LEVEL SECURITY;

-- Only service role (edge functions) accesses this table
