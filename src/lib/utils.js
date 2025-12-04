export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://playlist-playlister.vercel.app');

export function formatTimestamp(epochMs) {
    // Convert to number if string, handle invalid values
    const timestamp = Number(epochMs);

    if (!timestamp || isNaN(timestamp)) {
        return 'Invalid date';
    }

    const date = new Date(timestamp);

    // Format date in PST (America/Los_Angeles)
    const pstDate = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        month: '2-digit',
        day: '2-digit',
        year: 'numeric'
    }).format(date);

    const pstTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Los_Angeles',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(date);

    return `Epoch: ${timestamp} | ${pstDate} ${pstTime} PST`;
}
