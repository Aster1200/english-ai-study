import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "English AI Study",
  description: "Mini app personal para estudiar ingles practico con IA y tecnologia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
