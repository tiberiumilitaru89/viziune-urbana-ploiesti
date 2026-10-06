---
id: okf-index
title: "Harta de Cunoaștere Canonică: Viziune Urbană Noua Ploiești"
domain: architecture
last_verified: 2026-10-06
dependencies: []
---

# Harta de Cunoaștere Canonică (OKF) — Viziune Urbană Noua Ploiești

Acest document reprezintă Sursa Unică de Adevăr (SSOT) pentru ambele variante de implementare (`A` și `B`):

| Criteriu | Varianta A (`A/`) | Varianta B (`B/`) |
| :--- | :--- | :--- |
| **Direcție Design** | Modern Tech & Civic Trust (stil Next-gen SaaS / civic dashboard) | Autoritate Instituțională & Editorială (stil whitepaper / fundație nobilă) |
| **Tipografie** | `Plus Jakarta Sans` / Inter (precizie geometrică curată) | `Playfair Display` serif pentru titluri + `Plus Jakarta Sans` pentru corp |
| **Paletă Cromatică** | Dark Slate (`#060911`), Emerald (`#10b981`), Electric Blue (`#3b82f6`) | Midnight Royal Navy (`#070d1e`), Warm Amber/Gold (`#d97706`), Alabaster |
| **Elemente Cheie** | Carduri inginerești, glisor Before/After interactiv, badge-uri moderne | Sigilii heraldice de garanție 5 ani, citat manifest decret, cadru solemn |
| **Optimizare Mobil** | Touch-pan-y, 16px iOS inputs (fără auto-zoom), IBAN break-all | Touch-pan-y, 16px iOS inputs (fără auto-zoom), IBAN break-all |
| **Port Local** | `http://localhost:3005` | `http://localhost:3006` |
| **Deploy Mode** | Pregătit pentru import Git pe Vercel | Pregătit pentru import Git pe Vercel |
| **Stare Build** | ✓ 100% Finalizat (Next.js 15.5.27), zero erori de compilare | ✓ 100% Finalizat (Next.js 15.5.27), zero erori de compilare |

---

## Noduri de Cunoaștere Active

1. **Business & Copywriting Canonic:**
   - [`business-rules/copywriting_and_mission.md`](./business-rules/copywriting_and_mission.md)
   - *Conține:* 100% din textele originale extrase, misiunea, parteneriatele oficiale (Instal Serv Becheanu, Liceul Tehnic Toma Socolescu, ACCR Ploiești, UPG Ploiești), specificațiile tehnice și secțiunea FAQ.

2. **Bază de Date & FSM (Automate Finite de Stare):**
   - [`database/schema_and_fsm.md`](./database/schema_and_fsm.md)
   - *Conține:* Schema relațională pentru cereri de audit, proiecte și donații, tranziții de stare deterministe fără orbie booleană.

3. **Securitate, PII & Autentificare:**
   - [`security/pii_and_auth.md`](./security/pii_and_auth.md)
   - *Conține:* Politici anti-scurgere PII (date locatari), protecție rate-limiting, autentificare admin cu hash criptografic și validare Zod pe toate intrările.
