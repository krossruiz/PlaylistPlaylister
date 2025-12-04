'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PlaylistForm from '@/components/PlaylistForm';

export default function EditPlaylistClient({ initialData }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData) => {
        setLoading(true);

        try {
            const res = await fetch(`/api/playlists/${initialData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to update playlist');

            const data = await res.json();
            router.push(`/playlist/${data.id}`);
            router.refresh(); // Refresh server data
        } catch (error) {
            alert('Error updating playlist: ' + error.message);
            setLoading(false);
        }
    };

    return (
        <main className="container">
            <header className="header">
                <h1>Edit Playlist</h1>
                <Link href={`/playlist/${initialData.id}`} className="btn" style={{ background: '#666' }}>
                    Cancel
                </Link>
            </header>

            <PlaylistForm
                initialData={initialData}
                onSubmit={handleSubmit}
                loading={loading}
                submitLabel="Save Changes"
            />
        </main>
    );
}
