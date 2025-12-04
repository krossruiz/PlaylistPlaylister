export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://playlist-playlister.vercel.app');
