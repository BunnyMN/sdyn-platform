-- Drop functions
DROP FUNCTION IF EXISTS cleanup_old_audit_logs();
DROP FUNCTION IF EXISTS cleanup_expired_tokens();

-- Drop tables
DROP TABLE IF EXISTS token_blacklist;
DROP TABLE IF EXISTS audit_logs;
