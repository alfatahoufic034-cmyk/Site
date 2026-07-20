-- Monitoring and security tables
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor jsonb,
  action text NOT NULL,
  resource text,
  resource_id text,
  meta jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip inet,
  email text,
  success boolean,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS blocked_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip inet UNIQUE,
  reason text,
  blocked_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_attempts_created_at ON login_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_blocked_blocked_at ON blocked_ips(blocked_at);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created_at ON security_alerts(created_at);

-- RLS: example policies (adjust to your auth mapping)
-- enable row level security if using Supabase auth
-- ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "audit_admin_only" ON audit_logs USING (auth.role() = 'super_admin');
