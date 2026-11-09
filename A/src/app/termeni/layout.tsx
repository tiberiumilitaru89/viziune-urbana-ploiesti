import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termeni și Condiții de Utilizare",
  description:
    "Termenii și condițiile oficiale ale programului civic de sponsorizare în materiale derulat de Asociația Viziune Urbană Ploiești.",
  alternates: {
    canonical: "https://www.viziuneurbanaploiesti.ro/termeni",
  },
  openGraph: {
    url: "https://www.viziuneurbanaploiesti.ro/termeni",
  },
};

export default function TermeniLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
