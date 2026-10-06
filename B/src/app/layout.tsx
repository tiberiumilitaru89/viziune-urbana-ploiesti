import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#070d1e",
};

export const metadata: Metadata = {
  title: "Viziune Urbană Ploiești | Autoritate Civică & Reabilitare Subsoluri",
  description: "Fundația unui bloc sănătos începe de jos. Asociația civică independentă Viziune Urbană Ploiești oferă evaluare gratuită și sponsorizări integrale în materiale tehnice pentru asociațiile de proprietari.",
  keywords: ["Viziune Urbana Ploiesti", "reabilitare subsoluri Ploiesti", "asociatii de proprietari", "sponsorizare materiale tevi", "parteneri executie Ploiesti", "caiet de sarcini subsol"],
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
    <html
      lang="ro"
      className={`${playfairDisplay.variable} ${plusJakartaSans.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-[#070d1e] text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden w-full">
        {/* Fixed Panoramic Civic Background — stays fixed on scroll across the entire application */}
        <div
          className="fixed inset-0 pointer-events-none -z-50 bg-cover bg-[center_28%] bg-no-repeat transition-all duration-700 opacity-60"
          style={{ backgroundImage: "url('/ploiesti-hero-background.jpg')" }}
        />
        <div className="fixed inset-0 pointer-events-none -z-40 bg-gradient-to-b from-[#070d1e]/50 via-[#070d1e]/75 to-[#040814]/90" />
        <div className="fixed inset-0 pointer-events-none -z-30 bg-[radial-gradient(ellipse_70%_70%_at_50%_10%,rgba(217,119,6,0.12),rgba(0,0,0,0.3))]" />

        {children}
      </body>
    </html>
  );
}
