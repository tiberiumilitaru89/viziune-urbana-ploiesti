import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verificare Status Dosar Asociație",
  description:
    "Verifică în timp real stadiul dosarului de sponsorizare și progresul colectării pentru asociația ta de proprietari din Ploiești.",
  alternates: {
    canonical: "https://www.viziuneurbanaploiesti.ro/status",
  },
  openGraph: {
    url: "https://www.viziuneurbanaploiesti.ro/status",
  },
};

export default function StatusLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
