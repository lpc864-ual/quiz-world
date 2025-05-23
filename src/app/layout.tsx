import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QuizWorld",
  description: "Explore an interactive 3D world, learn about countries around the globe, and test your geographical knowledge in this fun quiz. Navigate the globe, discover fascinating facts, and challenge your skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
