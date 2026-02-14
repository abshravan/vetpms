import type { Metadata } from "next";
import ThemeRegistry from "../theme/ThemeRegistry";
import { AuthProvider } from "../auth/AuthContext";

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
    <html lang="en">
      <body>
        <ThemeRegistry>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
