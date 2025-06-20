import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Daily Scribble - Draw Every Day, Share Your Art",
  description: "Join a magical community of young artists in a safe, inspiring space to practice drawing with daily creative challenges and share your masterpieces.",
  keywords: ["drawing", "kids", "art", "children", "creative", "safe", "daily", "challenges"],
  authors: [{ name: "Daily Scribble Team" }],
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  openGraph: {
    title: "Daily Scribble - Draw Every Day, Share Your Art",
    description: "Join a magical community of young artists in a safe, inspiring space to practice drawing with daily creative challenges and share your masterpieces.",
    url: "https://dailyscribble.com",
    siteName: "Daily Scribble",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Daily Scribble - A magical community for young artists",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Scribble - Draw Every Day, Share Your Art",
    description: "Join a magical community of young artists in a safe, inspiring space to practice drawing with daily creative challenges and share your masterpieces.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
