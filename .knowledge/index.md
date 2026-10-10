---
id: okf-index
title: "Harta de Cunoaștere Canonică: Viziune Urbană Noua Ploiești"
domain: architecture
last_verified: 2026-10-10
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
| **Panou Admin (`/admin`)** | 6 Taburi complete (Asociații, Parteneri, Galerie & Poze pe etape, Metrici, Formulare 230, Donații & Sponsorizări), selector dropdown lucrări, clasificare etape foto (Înainte, În execuție, După recepție), exporturi universale CSV/Excel cu BOM UTF-8, generator oficial de Fișe de Avizier (A4 Print/PDF) |
| **Arhivă & Galerie Lucrări (`/arhiva-lucrari`)** | Pagină dedicată de transparență civică: selector proiecte, filtru pe etape de execuție, comparator glisant/față-în-față și Lightbox modal fullscreen cu navigare din tastatură |
| **Portal Public Urmărire (`/status`)** | Căutare instantă după număr dosar (`DOSAR-PH-101`) sau nume bloc, filtre cartiere, stepper vizual FSM în 5 pași, transparență civică 100% fără scurgere de PII |
| **Securitate & Autentificare** | Hardening critic: Sesiuni HMAC-SHA256 cu `timingSafeEqual` împotriva atacurilor prin canal lateral, eliminare completă a parolelor fallback, sesiune 8h (`SESSION_COOKIE_NAME`), Fail-Fast la pornire dacă lipsesc cheile de mediu |
| **Upload Securizat Imagini** | Endpoint dedicat `/api/admin/upload` cu validare strictă de tip MIME (JPG/PNG/WEBP), plafon 5MB, fără execuție scripturi SVG și integrare automată în Supabase Storage |
| **Deploy Vercel & Hostico** | `https://viziuneurbanaploiesti.ro` (Vercel Root Directory: `A`) -> Mapare DNS Hostico (A + CNAME) |
| **Stare Build** | ✓ 100% Finalizat (Next.js 15.5.27), zero erori de compilare statică (10/10 pagini generate la build) |

---

## Noduri de Cunoaștere Active

1. **Business & Copywriting Canonic:**
   - [`business-rules/copywriting_and_mission.md`](./business-rules/copywriting_and_mission.md)
   - *Conține:* 100% din textele originale, misiunea, parteneriatele oficiale (Instal Serv Becheanu, Liceul Tehnic Toma Socolescu, ACCRP Ploiești, UPG Ploiești), specificațiile tehnice și secțiunea FAQ.

2. **Bază de Date & FSM (Automate Finite de Stare):**
   - [`database/schema_and_fsm.md`](./database/schema_and_fsm.md)
   - *Conține:* Schema relațională pentru cereri de audit, proiecte, parteneri și donații, tranziții de stare deterministe fără orbie booleană.

3. **Securitate, PII, GDPR & Autentificare:**
   - [`security/pii_and_auth.md`](./security/pii_and_auth.md)
   - [`security/gdpr_and_legal.md`](./security/gdpr_and_legal.md)
   - *Conține:* Politici anti-scurgere PII, validare matematică CNP, conformitate GDPR (Legea 190/2018), regim zero-tracking cookies și autentificare admin HMAC-SHA256.
