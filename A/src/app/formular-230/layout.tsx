import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formular 230 Online — Redirecționează 3,5% din Impozit",
  description:
    "Completează și semnează digital Formularul 230 pentru a susține gratuit reabilitarea subsolurilor blocurilor din Ploiești.",
  alternates: {
    canonical: "https://www.viziuneurbanaploiesti.ro/formular-230",
  },
  openGraph: {
    url: "https://www.viziuneurbanaploiesti.ro/formular-230",
  },
};

export default function Formular230Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
