import React from "react";
import { FAQS } from "@/lib/data";

export function JsonLd() {
  const baseUrl = "https://viziuneurbanaploiesti.ro";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "NGO",
    "name": "Asociația Viziune Urbană Ploiești",
    "alternateName": ["Viziune Urbană Ploiești", "VUP Ploiești"],
    "url": baseUrl,
    "logo": `${baseUrl}/official-logo.jpg`,
    "image": `${baseUrl}/ploiesti-hero-background.jpg`,
    "description": "Inițiativă civică independentă dedicată asociațiilor de proprietari din Ploiești: evaluare tehnică gratuită și sponsorizări integrale în materiale (țevi PPR, izolații, robineți) pentru reabilitarea subsolurilor de bloc.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Ploiești",
      "addressRegion": "Prahova",
      "addressCountry": "RO"
    },
    "areaServed": {
      "@type": "City",
      "name": "Ploiești"
    },
    "email": "viziuneurbanaploiesti@yahoo.com",
    "telephone": "+40720015592",
    "sameAs": [
      "https://viziune-urbana-ploiesti.vercel.app"
    ]
  };

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Reabilitare Instalații Subsol Bloc",
    "provider": {
      "@type": "NGO",
      "name": "Asociația Viziune Urbană Ploiești"
    },
    "areaServed": {
      "@type": "City",
      "name": "Ploiești"
    },
    "description": "Program civic de modernizare și igienizare a subsolurilor tehnice din municipiul Ploiești. Materiale 100% sponsorizate gratuit pentru rețeaua principală a blocului.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "RON",
      "description": "Evaluare tehnică și deviz de materiale 100% gratuite pentru asociații de proprietari din Ploiești"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
