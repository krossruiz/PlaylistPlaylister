import "./globals.css";

export const metadata = {
    title: "Video Playlist Sharer",
    description: "Share your video playlists",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
