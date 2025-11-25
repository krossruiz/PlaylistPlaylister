import { NextResponse } from 'next/server';
import { getPlaylists, createPlaylist } from '@/lib/db';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

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

        const window = new JSDOM('').window;
        const DOMPurify = createDOMPurify(window);

        // Allow iframes for YouTube and video tags for IPFS
        const cleanContent = DOMPurify.sanitize(content, {
            ADD_TAGS: ['iframe', 'video', 'source'],
            ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'src', 'width', 'height', 'controls', 'type', 'poster', 'preload']
        });

        const { id } = await createPlaylist(title, cleanContent);
        return NextResponse.json({ id }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
    }
}
