CREATE TABLE questions (
  id TEXT PRIMARY KEY,
  eleve_id TEXT NOT NULL REFERENCES users(id),
  course_id TEXT NOT NULL,
  calc TEXT NOT NULL,
  given TEXT NOT NULL,
  expected TEXT NOT NULL,
  correction TEXT NOT NULL,
  note TEXT,
  asked_at INTEGER NOT NULL,
  answer TEXT,
  answered_at INTEGER,
  answered_by TEXT REFERENCES users(id),
  read_at INTEGER
);

CREATE INDEX questions_eleve_asked ON questions (eleve_id, asked_at);
