import { getPlaylistById } from '@/lib/db';
import { notFound } from 'next/navigation';
import EditPlaylistClient from './EditPlaylistClient';

export default async function EditPlaylistPage({ params }) {
    const { id } = await params;
    const playlist = await getPlaylistById(id);

    if (!playlist) {
        notFound();
    }

    // Pass plain object to client component
    const initialData = {
        title: playlist.title,
        content: playlist.content,
        id: playlist.id
    };

    return <EditPlaylistClient initialData={initialData} />;
}
