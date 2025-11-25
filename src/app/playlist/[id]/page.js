import { getPlaylistById } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function PlaylistPage({ params }) {
    const { id } = await params;
    const playlist = getPlaylistById(id);

    if (!playlist) {
        notFound();
    }

    return (
        <main className="container">
            <header className="header">
                <h1>{playlist.title}</h1>
                <Link href="/" className="btn" style={{ background: '#666' }}>
                    Back to Home
                </Link>
            </header>

            <div className="card">
                <div
                    className="playlist-content"
                    dangerouslySetInnerHTML={{ __html: playlist.content }}
                />
            </div>

            <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
                <p>Created: {new Date(playlist.created_at * 1000).toLocaleString()}</p>
                <p>Share this playlist: <code style={{ background: '#eee', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{`http://localhost:3000/playlist/${playlist.id}`}</code></p>
            </div>
        </main>
    );
}
