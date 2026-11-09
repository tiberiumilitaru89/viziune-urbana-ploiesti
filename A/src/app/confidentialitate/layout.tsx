import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politică de Confidențialitate & Protecția Datelor (GDPR)",
  description:
    "Informații oficiale privind prelucrarea și protecția datelor cu caracter personal în cadrul Asociației Viziune Urbană Ploiești.",
  alternates: {
    canonical: "https://www.viziuneurbanaploiesti.ro/confidentialitate",
  },
  openGraph: {
    url: "https://www.viziuneurbanaploiesti.ro/confidentialitate",
  },
};

export default function ConfidentialitateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
