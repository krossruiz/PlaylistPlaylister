import { NextResponse } from 'next/server';
import { getPlaylists, createPlaylist } from '@/lib/db';
import sanitizeHtml from 'sanitize-html';

export async function GET() {
    try {
        const playlists = await getPlaylists();
        return NextResponse.json(playlists);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
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

        const { id } = await createPlaylist(title, cleanContent);
        return NextResponse.json({ id }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
    }
}
