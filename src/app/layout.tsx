import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FPL Analytics | Fantasy Premier League Data & Insights",
  description: "Get expert Fantasy Premier League recommendations, fixture analysis, and real-time player form updates. Maximize your FPL points with AI-driven picks, captain suggestions, and injury alerts.",
  keywords: "Fantasy Premier League, FPL, FPL tips, FPL analytics, fantasy football, player recommendations, fixture difficulty, captain picks, FPL AI, transfer suggestions",
  authors: [{ name: "FPL Analytics Team" }],
  openGraph: {
    title: "FPL Analytics | Fantasy Premier League Data & Insights",
    description: "Get expert Fantasy Premier League recommendations, fixture analysis, and real-time player form updates to maximize your points every gameweek.",
    url: "https://fplanalytics.com",
    siteName: "FPL Analytics",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FPL Analytics | Fantasy Premier League Data & Insights",
    description: "Get expert Fantasy Premier League recommendations, fixture analysis, and real-time player form updates.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
