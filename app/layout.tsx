import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "talk2strangers — talk with anyone. actually talk.",
  description:
    "Anonymous chat rooms and 1-on-1 random matching. No accounts, no ads in conversations, nothing stored. The internet's late-night line."
};

export const viewport: Viewport = {
  themeColor: "#080A12"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-ink text-[#E9EAF2] font-body">{children}</body>
    </html>
  );
}
