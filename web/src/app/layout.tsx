import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "../theme/ThemeRegistry";
import { AuthProvider } from "../auth/AuthContext";
import { ThemeProvider } from "../theme/ThemeContext";

export const metadata: Metadata = {
  title: "VetPMS — Veterinary Practice Management",
  description: "Full-featured veterinary practice management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <ThemeRegistry>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeRegistry>
        </ThemeProvider>
      </body>
    </html>
  );
}
