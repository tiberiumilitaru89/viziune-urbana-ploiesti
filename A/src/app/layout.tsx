import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

import { JsonLd } from "@/components/seo/JsonLd";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FAF7F2",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://viziune-urbana-ploiesti.ro"),
  title: {
    default: "Viziune Urbană Ploiești | Reabilitare Subsoluri de Bloc & Sponsorizări",
    template: "%s | Viziune Urbană Ploiești",
  },
  description:
    "Fundația unui bloc sănătos începe de jos. Asociația Viziune Urbană Ploiești oferă evaluare tehnică gratuită și sponsorizări integrale în materiale (țevi PPR, robineți, izolații Armaflex) pentru asociațiile de proprietari din Ploiești.",
  keywords: [
    // Asociații & Localizare Ploiești
    "asociații de proprietari Ploiești",
    "asociație proprietari bloc Ploiești",
    "reabilitare subsoluri Ploiești",
    "subsol bloc Ploiești",
    "inundație subsol bloc Ploiești",
    "scurgeri apă subsol Ploiești",
    "reparații subsol bloc",
    "curățare subsol bloc Ploiești",
    "igienizare subsol Ploiești",
    
    // Instalații & Materiale
    "înlocuire țevi subsol",
    "schimbare instalație bloc Ploiești",
    "țevi PPR fibră compozită",
    "izolație termică Armaflex 19mm",
    "robineți sferici trecere",
    "conducte apă caldă menajeră",
    "conducte apă rece bloc",
    "coloane canalizare PVC subsol",
    "termoficare bloc Ploiești",
    "calorifere bloc Ploiești",

    // Parteneri & Entități
    "Instal Serv Becheanu",
    "Instal Serv Becheanu Ploiești",
    "George Becheanu instalator",
    "Asociația Viziune Urbană Ploiești",
    "Viziune Urbană Ploiești",
    "ACCRP",
    "Liceul Tehnologic Toma Socolescu",
    "Universitatea Petrol-Gaze Ploiești UPG",

    // Sponsorizări & Finanțare
    "sponsorizare materiale asociații de proprietari",
    "sponsorizări gratuite asociații",
    "fond de reparații bloc",
    "evaluare tehnică gratuită instalații",
    "deviz gratuit subsol bloc",
    "garanție 5 ani instalații bloc",
    "formularul 230 Ploiești",
    "redirecționează 3.5 la sută impozit Ploiești",

    // Cartiere Ploiești
    "Ploiești Cartier Vest",
    "Ploiești Cartier Nord",
    "Ploiești Malu Roșu",
    "Ploiești Mihai Bravu",
    "Ploiești Centru",
    "Ploiești Bariera București",
    "Ploiești Republicii",
    "Ploiești Democrației",
    "Ploiești 9 Mai",
    "Ploiești Sud"
  ],
  authors: [{ name: "Asociația Viziune Urbană Ploiești" }],
  creator: "Asociația Viziune Urbană Ploiești",
  publisher: "Asociația Viziune Urbană Ploiești",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Viziune Urbană Ploiești | Reabilitare Subsoluri de Bloc & Sponsorizări",
    description: "Sponsorizări materiale pentru rețeaua principală a blocului tău — fără costuri de materiale pentru asociația de proprietari.",
    url: "https://viziune-urbana-ploiesti.ro",
    siteName: "Viziune Urbană Ploiești",
    locale: "ro_RO",
    type: "website",
    images: [
      {
        url: "/ploiesti-hero-background.jpg",
        width: 1376,
        height: 768,
        alt: "Viziune Urbană Ploiești - Halele Centrale & Reabilitare Subsoluri de Bloc",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Viziune Urbană Ploiești | Reabilitare Subsoluri de Bloc",
    description: "Fundația unui bloc sănătos începe de jos. Evaluare tehnică gratuită și sponsorizări integrale în materiale.",
    images: ["/ploiesti-hero-background.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={`${playfairDisplay.variable} ${plusJakartaSans.variable} scroll-smooth`}>
      <head>
        <JsonLd />
      </head>
      <body className="min-h-screen bg-[#FAF7F2] text-slate-900 antialiased selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden w-full font-sans">
        {/* Desktop Fixed Civic Panoramic Background — active on desktop (lg:block), mobile uses in-flow showcase */}
        <div
          className="hidden lg:block pointer-events-none"
          style={{
            position: "fixed",
            top: "var(--navbar-height, 96px)",
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "calc(100vh - var(--navbar-height, 96px))",
            zIndex: 0,
            backgroundImage: "url('/ploiesti-hero-background.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "right top",
            backgroundRepeat: "no-repeat",
          }}
          aria-hidden="true"
        />

        {/* Page Content Container at z-10 — scrolls smoothly over the fixed background */}
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
