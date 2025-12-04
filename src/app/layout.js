import "./globals.css";

export const metadata = {
    title: "Video Playlist Sharer",
    description: "Share your video playlists",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
