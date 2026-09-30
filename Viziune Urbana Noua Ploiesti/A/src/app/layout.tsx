import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

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
    <html lang="ro" className={`${plusJakartaSans.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[#060911] text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
