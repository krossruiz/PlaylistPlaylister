import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

const db = new Database('playlists.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS playlists (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch())
  )
`);

export function getPlaylists() {
  return db.prepare('SELECT * FROM playlists ORDER BY created_at DESC LIMIT 50').all();
}

export function getPlaylistById(id) {
  return db.prepare('SELECT * FROM playlists WHERE id = ?').get(id);
}

export function createPlaylist(title, content) {
  const id = uuidv4();
  const stmt = db.prepare('INSERT INTO playlists (id, title, content) VALUES (?, ?, ?)');
  stmt.run(id, title, content);
  return id;
}
