'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function PlaylistActions({ id }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
            return;
        }

        setDeleting(true);
        try {
            const res = await fetch(`/api/playlists/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete playlist');

            router.push('/');
            router.refresh();
        } catch (error) {
            alert('Error deleting playlist: ' + error.message);
            setDeleting(false);
        }
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <Link href={`/playlist/${id}/edit`} className="btn" style={{ background: '#0070f3' }}>
                Edit
            </Link>
            <button
                onClick={handleDelete}
                className="btn"
                style={{ background: '#ff4d4f' }}
                disabled={deleting}
            >
                {deleting ? 'Deleting...' : 'Delete'}
            </button>
        </div>
    );
}
