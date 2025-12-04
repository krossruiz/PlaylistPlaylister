import { NextResponse } from 'next/server';
import { getPlaylistById, updatePlaylist, deletePlaylist } from '@/lib/db';
import sanitizeHtml from 'sanitize-html';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const playlist = await getPlaylistById(id);

        if (!playlist) {
            return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
        }

        return NextResponse.json(playlist);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch playlist' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = await params;
        const { title, content } = await request.json();

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        // Allow iframes for YouTube and video tags for IPFS
        const cleanContent = sanitizeHtml(content, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['iframe', 'video', 'source', 'img']),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                iframe: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'scrolling'],
                video: ['src', 'width', 'height', 'controls', 'poster', 'preload'],
                source: ['src', 'type'],
                img: ['src', 'alt', 'width', 'height']
            },
            allowedSchemes: ['http', 'https', 'mailto', 'tel']
        });

        await updatePlaylist(id, title, cleanContent);
        return NextResponse.json({ id, title, content: cleanContent });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update playlist' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = await params;
        await deletePlaylist(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
    }
}
