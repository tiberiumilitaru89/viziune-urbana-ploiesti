import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politică privind Fișierele Cookies",
  description:
    "Detalii privind utilizarea cookie-urilor strict necesare și preferințele de confidențialitate pe platforma Viziune Urbană Ploiești.",
  alternates: {
    canonical: "https://www.viziuneurbanaploiesti.ro/cookies",
  },
  openGraph: {
    url: "https://www.viziuneurbanaploiesti.ro/cookies",
  },
};

export default function CookiesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>;
}
