-- Local candidate migration. Never run against a remote database without approval.
CREATE TABLE IF NOT EXISTS finance_state (
  owner_subject TEXT PRIMARY KEY NOT NULL,
  revision INTEGER NOT NULL CHECK (revision > 0),
  sealed_json TEXT NOT NULL,
  event_type TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS finance_audit (
  owner_subject TEXT NOT NULL,
  revision INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  recorded_at TEXT NOT NULL,
  PRIMARY KEY (owner_subject, revision)
);
-- Audit receipt and encrypted state commit are one SQLite transaction.
-- No balances, identities of investors, request bodies or credentials enter the audit.
CREATE TRIGGER IF NOT EXISTS finance_state_created
AFTER INSERT ON finance_state BEGIN
  INSERT INTO finance_audit (owner_subject,revision,event_type,recorded_at)
  VALUES (NEW.owner_subject,NEW.revision,NEW.event_type,NEW.updated_at);
END;
CREATE TRIGGER IF NOT EXISTS finance_state_changed
AFTER UPDATE ON finance_state BEGIN
  INSERT INTO finance_audit (owner_subject,revision,event_type,recorded_at)
  VALUES (NEW.owner_subject,NEW.revision,NEW.event_type,NEW.updated_at);
END;
