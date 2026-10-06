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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FAF7F2",
};

export const metadata: Metadata = {
  title: "Viziune Urbană Ploiești | Reabilitare Subsoluri de Bloc & Sponsorizări",
  description: "Fundația unui bloc sănătos începe de jos. Asociația Viziune Urbană Ploiești oferă evaluare tehnică gratuită și sponsorizări integrale în materiale pentru asociațiile de proprietari.",
  keywords: ["Viziune Urbana Ploiesti", "reabilitare subsoluri Ploiesti", "instalatii bloc", "tevi PPR", "sponsorizare materiale asociatii", "Instal Serv Becheanu"],
  openGraph: {
    title: "Viziune Urbană Ploiești | Fundația unui bloc sănătos începe de jos",
    description: "Sponsorizări materiale pentru rețeaua principală a blocului tău — fără costuri pentru asociație.",
    locale: "ro_RO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={`${playfairDisplay.variable} ${plusJakartaSans.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[#FAF7F2] text-slate-900 antialiased selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden w-full font-sans">
        {/* Fixed Civic Panoramic Backdrop */}
        <div
          className="fixed inset-0 pointer-events-none -z-50 bg-cover bg-[center_28%] bg-no-repeat transition-all duration-700 opacity-30"
          style={{ backgroundImage: "url('/ploiesti-hero-background.jpg')" }}
        />
        <div className="fixed inset-0 pointer-events-none -z-40 bg-gradient-to-b from-[#FAF7F2]/40 via-[#FAF7F2]/70 to-[#FAF7F2]/90" />

        {children}
      </body>
    </html>
  );
}
