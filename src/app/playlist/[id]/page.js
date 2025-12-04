import { getPlaylistById } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PlaylistActions from './PlaylistActions';
import { BASE_URL, formatTimestamp } from '@/lib/utils';

export default async function PlaylistPage({ params }) {
    const { id } = await params;
    const playlist = await getPlaylistById(id);

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

            <PlaylistActions id={playlist.id} />

            <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
                <p>Created: {formatTimestamp(playlist.created_at)}</p>
                <p>Share this playlist: <code style={{ background: '#eee', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{`${BASE_URL}/playlist/${playlist.id}`}</code></p>
            </div>
        </main>
    );
}
