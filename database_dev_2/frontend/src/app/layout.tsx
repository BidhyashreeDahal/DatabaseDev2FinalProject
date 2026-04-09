/**
 * Page Purpose:
 * Root layout for the entire frontend app.
 *
 * What goes here:
 * - Global providers (AuthProvider, theme provider, query provider)
 * - Global CSS import
 * - App-wide metadata and base HTML structure
 *
 * What should NOT go here:
 * - Page-specific data fetching
 * - Feature-specific business logic
 */
import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const appFont = Plus_Jakarta_Sans({
  variable: "--font-app",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const displayFont = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "Britannicus Reading Room",
  description: "Inventory, contacts, pricing, and sales management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${appFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
