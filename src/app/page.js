import Link from 'next/link';
import { getPlaylists } from '@/lib/db';

// Force dynamic rendering to ensure we always get the latest playlists
export const dynamic = 'force-dynamic';

export default async function Home() {
    let playlists = [];
    try {
        playlists = await getPlaylists();
    } catch (error) {
        console.error('Failed to fetch playlists:', error);
        // Fallback to empty array or handle error UI
    }

    return (
        <main className="container">
            <header className="header">
                <h1>Video Playlists</h1>
                <Link href="/create" className="btn">
                    Create New Playlist
                </Link>
            </header>

            <div className="playlist-list">
                {playlists.length === 0 ? (
                    <p>No playlists found. Be the first to create one!</p>
                ) : (
                    playlists.map((playlist) => (
                        <Link href={`/playlist/${playlist.id}`} key={playlist.id} className="card" style={{ display: 'block' }}>
                            <h2 style={{ margin: '0 0 0.5rem 0' }}>{playlist.title}</h2>
                            <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                                Created: {new Date(playlist.created_at * 1000).toLocaleDateString()}
                            </p>
                        </Link>
                    ))
                )}
            </div>
        </main>
    );
}
