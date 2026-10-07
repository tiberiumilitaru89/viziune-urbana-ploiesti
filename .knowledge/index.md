---
id: okf-index
title: "Harta de Cunoaștere Canonică: Viziune Urbană Noua Ploiești"
domain: architecture
last_verified: 2026-10-07
dependencies: []
---

# Harta de Cunoaștere Canonică (OKF) — Viziune Urbană Noua Ploiești

Acest document reprezintă Sursa Unică de Adevăr (SSOT) pentru platforma unificată oficială (`A/`):

| Criteriu | Aplicația Oficială (`A/`) |
| :--- | :--- |
| **Identitate Vizuală** | Sigla heraldică oficială mărită și adaptată pe fildeș (`official-logo.jpg`). **Fundal responsiv diferențiat:** Pe PC/laptop (`min-width: 1024px`), fundal panoramic orizontal cu Halele Centrale pe dreapta (`ploiesti-hero-background.jpg`), aliniat imediat sub meniu (`top: 96px`); pe mobil/tabletă (`< 1024px`), fundal vertical portret 9:16 dedicat (`ploiesti-hero-mobile.jpg`), centrat impecabil pentru ecrane de telefon. |
| **Design & Carduri** | Glassmorphism civic translucid (`bg-white/85 backdrop-blur-md`) pe toate cardurile și dashboard-urile (inclusiv `/admin`), permițând vizibilitatea fundalului fix |
| **Tipografie & Contrast** | `Playfair Display` serif + `Plus Jakarta Sans`, contrast maxim WCAG AAA (Navy `#071330` pe Fildeș `#FAF7F2`) |
| **Navigație & Header** | Înălțime fixă deterministă `88px` (mobil) / `96px` (desktop) sincronizată via variabila CSS `--navbar-height`, eliminând orice suprapunere peste fundal |
| **Partener Tehnic** | Instal Serv Becheanu (siglă oficială integrată `becheanu-logo.png`; clauza *„Garanție 5 Ani oferită de către partenerii de execuție”* intactă) |
| **Partener Calificare** | ACCRP Ploiești (Centrul de Calificare și Recalificare Profesională Ploiești) |
| **Cont Bancar Oficial** | UniCredit Bank România — `RO94 BACX 0000 0042 3447 3000` |
| **SEO & Googlebot** | Sitemap dinamic (`/sitemap.xml`), robots.txt optimizat, Schema.org JSON-LD (NGO, Service, FAQPage), 30+ cuvinte cheie Ploiești |
| **Panou Admin (`/admin`)** | 4 Taburi complete (Asociații, Parteneri, Galerie/Poze, Metrici), persistență sesiune, parolă `vup2026`, buton deconectare |
| **Deploy Vercel & Hostico** | `https://viziuneurbanaploiesti.ro` (Vercel Root Directory: `A`) -> Mapare DNS Hostico (A + CNAME) |
| **Stare Build** | ✓ 100% Finalizat (Next.js 15.5.27), zero erori de compilare statică (10/10 pagini generate) |

---

## Noduri de Cunoaștere Active

1. **Business & Copywriting Canonic:**
   - [`business-rules/copywriting_and_mission.md`](./business-rules/copywriting_and_mission.md)
   - *Conține:* 100% din textele originale, misiunea, parteneriatele oficiale (Instal Serv Becheanu, Liceul Tehnic Toma Socolescu, ACCRP Ploiești, UPG Ploiești), specificațiile tehnice și secțiunea FAQ.

2. **Bază de Date & FSM (Automate Finite de Stare):**
   - [`database/schema_and_fsm.md`](./database/schema_and_fsm.md)
   - *Conține:* Schema relațională pentru cereri de audit, proiecte, parteneri și donații, tranziții de stare deterministe fără orbie booleană.

3. **Securitate, PII & Autentificare:**
   - [`security/pii_and_auth.md`](./security/pii_and_auth.md)
   - *Conține:* Politici anti-scurgere PII (date locatari), protecție rate-limiting, autentificare admin cu hash criptografic și validare Zod pe toate intrările.
