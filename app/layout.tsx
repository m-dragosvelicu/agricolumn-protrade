import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Theme } from "@radix-ui/themes";
import "@radix-ui/themes/styles.css";
import "./global.css";
import { GlobalBanner } from "@/components/ui/global-banner";
import { AccessGate } from "@/components/auth/AccessGate";
import { AuthProvider } from "@/lib/auth/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProTrade Dashboard",
  description: "Professional grain trading dashboard",
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
        <Theme>
          <AuthProvider>
            <GlobalBanner />
            <AccessGate>
              {children}
            </AccessGate>
          </AuthProvider>
        </Theme>
      </body>
    </html>
  );
}
