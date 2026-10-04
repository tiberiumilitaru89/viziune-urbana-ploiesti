import type { Metadata } from "next";
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
      <body className="min-h-screen bg-[#070d1e] text-slate-100 antialiased selection:bg-amber-500 selection:text-slate-950">
        {children}
      </body>
    </html>
  );
}
