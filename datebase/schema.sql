CREATE TABLE IF NOT EXISTS drama (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(120) NOT NULL,
  description TEXT,
  cover_url VARCHAR(500),
  status VARCHAR(32) DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS episode (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  drama_id INTEGER NOT NULL,
  episode_no INTEGER NOT NULL,
  title VARCHAR(120) NOT NULL,
  video_url VARCHAR(500) NOT NULL,
  subtitle_url VARCHAR(500),
  subtitle_content TEXT,
  duration REAL DEFAULT 0,
  analyze_status VARCHAR(32) DEFAULT 'pending',
  analyze_error TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (drama_id) REFERENCES drama(id)
);

CREATE TABLE IF NOT EXISTS highlight_event (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  episode_id INTEGER NOT NULL,
  start_time REAL NOT NULL,
  end_time REAL NOT NULL,
  highlight_type VARCHAR(32) NOT NULL,
  emotion VARCHAR(64),
  intensity REAL DEFAULT 0.5,
  confidence REAL DEFAULT 0.5,
  trigger_score REAL DEFAULT 0.5,
  reason TEXT,
  button_text VARCHAR(120),
  effect VARCHAR(64),
  status VARCHAR(32) DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (episode_id) REFERENCES episode(id)
);

CREATE TABLE IF NOT EXISTS interaction_template (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  highlight_type VARCHAR(32) NOT NULL UNIQUE,
  button_text VARCHAR(120) NOT NULL,
  effect VARCHAR(64) NOT NULL,
  position VARCHAR(32) DEFAULT 'bottom',
  duration_ms INTEGER DEFAULT 4000,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS user_interaction_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id VARCHAR(120) NOT NULL,
  episode_id INTEGER NOT NULL,
  highlight_id INTEGER NOT NULL,
  action_type VARCHAR(32) NOT NULL,
  action_value VARCHAR(120),
  watch_time REAL DEFAULT 0,
  idempotency_key VARCHAR(160) NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (episode_id) REFERENCES episode(id),
  FOREIGN KEY (highlight_id) REFERENCES highlight_event(id)
);

CREATE INDEX IF NOT EXISTS idx_episode_drama ON episode(drama_id);
CREATE INDEX IF NOT EXISTS idx_episode_analyze_status ON episode(analyze_status);
CREATE INDEX IF NOT EXISTS idx_highlight_episode_status ON highlight_event(episode_id, status);
CREATE INDEX IF NOT EXISTS idx_interaction_episode_action ON user_interaction_log(episode_id, action_type);
