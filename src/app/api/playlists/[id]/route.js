import { NextResponse } from 'next/server';
import { getPlaylistById } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const playlist = getPlaylistById(id);

        if (!playlist) {
            return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
        }

        return NextResponse.json(playlist);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
    }
}
