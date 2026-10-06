# Viziune Urbană Ploiești

Platformă civică dedicată reabilitării tehnice a subsolurilor și rețelelor de termoficare din blocurile din Municipiul Ploiești.

---

## Structura Proiectului

Aplicația este unificată într-o singură variantă oficială, dezvoltată în **Next.js 15 (App Router)** cu **TypeScript** și **Tailwind CSS**:

```text
├── A/                 # Aplicația Oficială Viziune Urbană Ploiești (Deploy activ: viziune-urbana-ploiesti.vercel.app)
├── .knowledge/        # Sursa Unică de Adevăr (SSOT - Reguli Business, Securitate PII, Scheme FSM)
└── README.md
```

---

## Caracteristici Tehnice & Identitate Oficială

- **Identitate Vizuală:** Sigla oficială heraldică cu coloane aurii și monogramă albastră (`official-logo.jpg`), fundal de patrimoniu cu Palatul Culturii Ploiești și caligrafia civică (`ploiesti-hero-background.jpg`).
- **Lizibilitate Maximă:** Tipografie contrastantă de înaltă rezoluție (Bleumarin Imperial `#071330` pe fildeș/alabastru `#FAF7F2`), conformă standardelor WCAG AAA (>15:1 contrast).
- **Partener Tehnic Oficial:** Instal Serv Becheanu (clauza inviolabilă: *„Garanție de 5 ani oferită de către partenerii de execuție”*).
- **Panou de Administrare Complet (`/admin`):**
  - Gestionare Asociații (stadiu, formulare ANAF 230, fond de manoperă)
  - Gestionare Parteneri Oficiali (adăugare/editare)
  - Galerie Lucrări & Poze Before/After
  - Metrici Globale în timp real
  - Autentificare securizată (parolă `vup2026`) cu protecție anti-autofill
- **Parteneri Instituționali:** Lic. Tehnologic „Toma Socolescu”, ACCRP Ploiești, Universitatea Petrol-Gaze (UPG) Ploiești.

---

## Rulare Locală

```bash
cd A
npm install
npm run dev
# Accesați: http://localhost:3005 (sau portul configurat)
```

---

## Desfășurare pe Vercel

Proiectul este conectat direct la repository-ul GitHub cu **Root Directory:** `A`.
URL de Producție: **`https://viziune-urbana-ploiesti.vercel.app`**
