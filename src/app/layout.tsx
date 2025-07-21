import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./styles/globals.css";
import { AuthProvider } from "./providers/SessionProvider";
import { PageLoading } from "@/shared/ui/loading";
import { QueryProvider } from "./providers/QueryProvider";
import { ThemeProvider } from "@/shared/ui/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Real-Time Task Board",
  description: "A real-time collaborative task board application",
};

export default function RootLayout({
  
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <Suspense fallback={<PageLoading message="Loading application..." />}>
                {children}
              </Suspense>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
