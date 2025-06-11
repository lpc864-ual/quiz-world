import type { Metadata } from "next";
import "./globals.css";
import BackgroundMusic from "@/components/backgroundMusic"; // Importa el nuevo componente

export const metadata: Metadata = {
  icons: { 
    icon: '/images/icono.png', // Ruta relativa a la carpeta 'public'
  },
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
        <BackgroundMusic />
        {children}
      </body>
    </html>
  );
}
