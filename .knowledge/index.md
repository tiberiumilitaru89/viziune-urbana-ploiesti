---
id: okf-index
title: "Harta de Cunoaștere Canonică: Viziune Urbană Noua Ploiești"
domain: architecture
last_verified: 2026-10-06
dependencies: []
---

# Harta de Cunoaștere Canonică (OKF) — Viziune Urbană Noua Ploiești

Acest document reprezintă Sursa Unică de Adevăr (SSOT) pentru platforma unificată oficială (`A/`):

| Criteriu | Aplicația Oficială (`A/`) |
| :--- | :--- |
| **Identitate Vizuală** | Sigla heraldică oficială (`official-logo.jpg`), Fundal civic Ploiești (`ploiesti-hero-background.jpg`) |
| **Tipografie & Contrast** | `Playfair Display` serif + `Plus Jakarta Sans`, contrast maxim WCAG AAA (Navy `#071330` pe Fildeș `#FAF7F2`) |
| **Partener Tehnic** | Instal Serv Becheanu (clauza *„Garanție 5 Ani oferită de către partenerii de execuție”* intactă) |
| **Partener Calificare** | ACCRP Ploiești (Centrul de Calificare și Recalificare Profesională Ploiești) |
| **Panou Admin (`/admin`)** | 4 Taburi complete (Asociații, Parteneri, Galerie/Poze, Metrici), parolă `vup2026`, anti-autofill |
| **Deploy Vercel** | `https://viziune-urbana-ploiesti.vercel.app` (Root Directory: `A`) |
| **Stare Build** | ✓ 100% Finalizat (Next.js 15.5.27), zero erori de compilare statică |

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
