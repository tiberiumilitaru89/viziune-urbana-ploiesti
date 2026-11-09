import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arhivă Lucrări & Reabilitări Subsoluri",
  description:
    "Portofoliul complet de subsoluri reabilitate în Ploiești cu materiale 100% sponsorizate prin Asociația Viziune Urbană Ploiești.",
  alternates: {
    canonical: "https://www.viziuneurbanaploiesti.ro/arhiva-lucrari",
  },
  openGraph: {
    url: "https://www.viziuneurbanaploiesti.ro/arhiva-lucrari",
  },
};

export default function ArhivaLucrariLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
