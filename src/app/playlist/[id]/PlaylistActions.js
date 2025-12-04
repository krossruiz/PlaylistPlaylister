'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import Modal from '@/components/Modal';

export default function PlaylistActions({ id }) {
    const router = useRouter();
    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        setShowDeleteModal(false);
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
        <>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <Link href={`/playlist/${id}/edit`} className="btn" style={{ background: '#0070f3' }}>
                    Edit
                </Link>
                <button
                    onClick={handleDeleteClick}
                    className="btn"
                    style={{ background: '#ff4d4f' }}
                    disabled={deleting}
                >
                    {deleting ? 'Deleting...' : 'Delete'}
                </button>
            </div>

            <Modal
                isOpen={showDeleteModal}
                title="Delete Playlist"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setShowDeleteModal(false)}
            >
                <p>Are you sure you want to delete this playlist? This action cannot be undone.</p>
                <div className="modal-actions">
                    <button type="button" className="btn" style={{ background: '#666' }} onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </button>
                    <button type="button" className="btn" style={{ background: '#ff4d4f' }} onClick={handleDeleteConfirm}>
                        Delete
                    </button>
                </div>
            </Modal>
        </>
    );
}

