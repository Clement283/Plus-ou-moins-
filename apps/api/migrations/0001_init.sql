CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('eleve', 'suiveur')),
  code_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);

CREATE TABLE follows (
  suiveur_id TEXT NOT NULL REFERENCES users(id),
  eleve_id TEXT NOT NULL REFERENCES users(id),
  PRIMARY KEY (suiveur_id, eleve_id)
);

CREATE TABLE tokens (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  created_at INTEGER NOT NULL
);

CREATE TABLE events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  at INTEGER NOT NULL,
  day TEXT NOT NULL,
  kind TEXT NOT NULL,
  payload TEXT NOT NULL
);

CREATE INDEX events_user_at ON events (user_id, at);
