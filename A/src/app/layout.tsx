import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#060911",
};

export const metadata: Metadata = {
  title: "Viziune Urbană Ploiești | Reabilitare Subsoluri de Bloc & Sponsorizări",
  description: "Fundația unui bloc sănătos începe de jos. Asociația Viziune Urbană Ploiești oferă evaluare tehnică gratuită și sponsorizări integrale în materiale pentru asociațiile de proprietari.",
  keywords: ["Viziune Urbana Ploiesti", "reabilitare subsoluri Ploiesti", "instalatii bloc", "tevi PPR", "sponsorizare materiale asociatii", "parteneri executie Ploiesti"],
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
    <html lang="ro" className={`${plusJakartaSans.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[#060911] text-slate-100 antialiased selection:bg-emerald-500 selection:text-white relative overflow-x-hidden w-full">
        {/* Fixed Panoramic Civic Background — stays fixed on scroll across the entire application */}
        <div
          className="fixed inset-0 pointer-events-none -z-50 bg-cover bg-[center_28%] bg-no-repeat transition-all duration-700 opacity-60"
          style={{ backgroundImage: "url('/ploiesti-hero-background.jpg')" }}
        />
        <div className="fixed inset-0 pointer-events-none -z-40 bg-gradient-to-b from-[#060911]/50 via-[#060911]/75 to-[#04070f]/90" />
        <div className="fixed inset-0 pointer-events-none -z-30 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(16,185,129,0.12),rgba(0,0,0,0.3))]" />

        {children}
      </body>
    </html>
  );
}
