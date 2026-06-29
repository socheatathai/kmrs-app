CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  method VARCHAR(16) NOT NULL,
  path TEXT NOT NULL,
  query_string TEXT,
  status_code INTEGER NOT NULL,
  duration_ms BIGINT NOT NULL,
  client_ip TEXT,
  user_agent TEXT,
  request_id TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_path ON audit_logs(path);
CREATE INDEX idx_audit_logs_status_code ON audit_logs(status_code);
CREATE INDEX idx_audit_logs_request_id ON audit_logs(request_id);
