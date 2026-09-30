# Viziune Urbană Ploiești

Platformă civică dedicată reabilitării tehnice a subsolurilor și rețelelor de termoficare din blocurile din Municipiul Ploiești.

---

## Structura Proiectului

Proiectul conține două direcții de design și abordare arhitecturală complet funcționale, dezvoltate în **Next.js 15 (App Router)** cu **TypeScript** și **Tailwind CSS**:

```text
├── A/                 # Varianta A: Modern Tech & Civic Trust (Dark Slate, Emerald & Electric Blue)
├── B/                 # Varianta B: Autoritate Instituțională & Editorială (Midnight Navy & Warm Amber/Gold)
├── .knowledge/        # Sursa Unică de Adevăr (SSOT - Reguli Business, Securitate PII, Scheme FSM)
└── README.md
```

---

## Comparație Variante

| Criteriu | Varianta A | Varianta B |
| :--- | :--- | :--- |
| **Concept & Direcție** | Inginerească, date tehnice vizibile, glisor interactiv Before/After | Solemnă, editorială, sigilii heraldice de garanție 5 ani, cadru decret |
| **Paletă Cromatică** | Dark Slate (`#060911`), Emerald (`#10b981`), Electric Blue (`#3b82f6`) | Midnight Royal Navy (`#070d1e`), Warm Amber/Gold (`#d97706`), Alabaster |
| **Port Local Implicit** | `http://localhost:3005` | `http://localhost:3006` |
| **Framework** | Next.js 15.5.27 (Turbopack) | Next.js 15.5.27 (Turbopack) |

---

## Rulare Locală

### Varianta A
```bash
cd A
npm install
npm run dev
# Accesați: http://localhost:3005
```

### Varianta B
```bash
cd B
npm install
npm run dev
# Accesați: http://localhost:3006
```

---

## Desfășurare pe Vercel

În Vercel Dashboard:
1. Conectați repository-ul `viziune-urbana-ploiesti`.
2. **Pentru Varianta A:** setați **Root Directory** pe `A`.
3. **Pentru Varianta B:** adăugați din nou proiectul și setați **Root Directory** pe `B`.
