import { sql } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

export async function initDB() {
  await sql`
    CREATE TABLE IF NOT EXISTS playlists (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at BIGINT NOT NULL
    );
  `;
}

export async function getPlaylists() {
  // Ensure table exists (lazy init)
  // In production, this should ideally be a migration script, but this works for simple apps
  try {
    const { rows } = await sql`SELECT * FROM playlists ORDER BY created_at DESC LIMIT 50`;
    return rows;
  } catch (error) {
    // If table doesn't exist, try to create it and retry
    if (error.message.includes('relation "playlists" does not exist')) {
      await initDB();
      const { rows } = await sql`SELECT * FROM playlists ORDER BY created_at DESC LIMIT 50`;
      return rows;
    }
    throw error;
  }
}

export async function createPlaylist(title, content) {
  const id = uuidv4();
  const createdAt = Date.now();

  try {
    await sql`
        INSERT INTO playlists (id, title, content, created_at)
        VALUES (${id}, ${title}, ${content}, ${createdAt})
      `;
  } catch (error) {
    if (error.message.includes('relation "playlists" does not exist')) {
      await initDB();
      await sql`
            INSERT INTO playlists (id, title, content, created_at)
            VALUES (${id}, ${title}, ${content}, ${createdAt})
          `;
    } else {
      throw error;
    }
  }

  return { id };
}

export async function getPlaylistById(id) {
  try {
    const { rows } = await sql`SELECT * FROM playlists WHERE id = ${id}`;
    return rows[0];
  } catch (error) {
    if (error.message.includes('relation "playlists" does not exist')) {
      return undefined;
    }
    throw error;
  }
}
