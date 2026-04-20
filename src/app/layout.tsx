import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Hannah Lab",
    default: "Hannah Lab - Automatización e Innovación Tecnológica",
  },
  description:
    "Hannah Lab: Automatización inteligente, desarrollo de software y producción audiovisual. Creamos soluciones tecnológicas que transforman tu negocio.",
  icons: {
    icon: "/images/logos/hannah.png",
    shortcut: "/images/logos/hannah.png",
    apple: "/images/logos/hannah.png",
  },
  keywords: [
    "automatización",
    "desarrollo de software",
    "producción audiovisual",
    "consultoría técnica",
    "innovación tecnológica",
    "Hannah Lab",
    "soluciones digitales"
  ],
  authors: [{ name: "Hannah Lab" }],
  creator: "Hannah Lab",
  publisher: "Hannah Lab",
  metadataBase: new URL("https://hannahlab.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://hannahlab.com",
    siteName: "Hannah Lab",
    title: "Hannah Lab - Automatización e Innovación Tecnológica",
    description: "Automatización inteligente, desarrollo de software y producción audiovisual. Transformamos tu negocio con tecnología.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Hannah Lab - Automatización e Innovación",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hannah Lab - Automatización e Innovación Tecnológica",
    description: "Automatización inteligente, desarrollo de software y producción audiovisual.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Google+Sans:ital,opsz,wght@0,17..18,400..700;1,17..18,400..700&family=Outfit:wght@100..900&family=Raleway:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="flex flex-col min-h-screen">
          {/* Navigation */}
          <NavBar />

          {/* Main Content */}
          <main className="flex-1">{children}</main>

          {/* Footer */}
          <Footer />
          <WhatsAppButton phoneNumber="984323201"/>
          <Toaster 
            position="top-right"
            duration={5000}
          />
        </div>
      </body>
    </html>
  );
}
