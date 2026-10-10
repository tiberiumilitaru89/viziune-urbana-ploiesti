---
id: okf-security-pii-auth
title: "Securitate, Protecție PII & Autentificare Deterministă"
domain: security
last_verified: 2026-10-10
dependencies: ["okf-index"]
---

# Securitate, Protecție PII & Politici Autentificare Deterministă

## 1. Protecție PII (Zero-Leakage Invariant)
* **Vulnerabilitate critică remediată:** Endpoint-ul `GET /api/formular-230` și datele de audit returnau date cu caracter personal (CNP, semnături olografe Base64, telefoane, adrese complete).
* **Barieră Tehnică Implementată:**
  1. Endpoint-ul `GET /api/formular-230` și `PUT /api/formular-230` sunt protejate inviolabil prin `isRequestAuthenticated(req)`. Orice apel neautentificat primește `401 Unauthorized`.
  2. Endpoint-ul public `/api/public/data` este singura sursă publică de date, oferind date anonimizate cu Cache-Control Edge (`s-maxage=30`).
  3. Formularul public de Formular 230 își încarcă datele publice de identificare ONG din `/api/public/data`, fără a accesa lista de semnături sau CNP-uri.

## 2. Autentificare Admin Criptografică (HMAC-SHA256 Session Token)
* **Arhitectură de Sesiune:**
  - Token-ul de sesiune este generat pe server cu `crypto.createHmac("sha256", secret)` și conține timestamp de expirare determinist (durată: 8 ore).
  - Cookie securizat: `vup_admin_session`, setat cu flag-urile `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` în producție.
  - Verificare timp-constant: `crypto.timingSafeEqual` pentru eliminarea atacurilor de tip *timing attack*.
  - Eliminat complet `sessionStorage` și verificarea de parolă hardcodată în frontend.
* **Protecție Brute-Force & Rate-Limiting:**
  - Endpoint-ul `/api/admin/auth` limitează tentativele de autentificare la 5 încercări greșite per fereastră de 15 minute per IP (`429 Too Many Requests`).
  - Toate endpoint-urile publice de colectare date (`/api/formular-230`, `/api/audit-request`, `/api/donation`, `/api/partner-application`) sunt protejate cu rate-limiting de 5 cereri per 10 minute per IP.

## 3. Capcană Bot & Spam (Honeypot Invizibil)
* Câmpul mascat `hp_website` este inclus pe toate formularele publice.
* Câmpul este complet invizibil utilizatorilor umani (`style={{ display: "none" }}`, `tabIndex={-1}`, `aria-hidden="true"`).
* Dacă un bot automat completează acest câmp, serverul returnează un răspuns simulat de succes (`201 Created`), dar abandonează sarcina utilă fără a o salva în baza de date și fără a trimite notificări email.

## 4. Validare Matematică Oficială a CNP-ului Românesc
* Validare completă în `src/lib/cnp.ts` conform algoritmului oficial al Direcției Generale pentru Evidența Persoanelor (ANAF / MAI):
  - Structură 13 caractere strict numerice.
  - Prefix sex și secol: 1-2 (secolul XIX), 3-4 (secolul XIX-XX), 5-6 (secolul XXI), 7-8 (rezidenți).
  - Validare an bisect, lună (01-12) și zi validă pentru luna respectivă.
  - Validare cod județ (01-52).
  - Calcul cifră de control cu ponderile constante `[2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9]` modulo 11 (dacă restul este 10, cifra de control este 1).
* Verificarea este executată instant în browser (pentru feedback prietenos) și revalidată obligatoriu server-side înainte de persistență.

## 5. Izolare Bază de Date & Supabase Client Roles
* Operațiunile server-side de mutație și salvare utilizează exclusiv `supabaseAdmin` (Service Role cu `persistSession: false`), asigurând compatibilitate completă cu politicile RLS (Row Level Security).
* Clientul public anonim `supabase` este utilizat strict pentru citiri publice permise.

## 6. Politică CSP cu Nonce Dinamic & Prevenire Crash Hydration
* **Problemă critică remediată:** Utilizarea `script-src 'self'` static în `next.config.ts` bloca scripturile inline esențiale generate de Next.js App Router (`self.__next_f.push`), provocând un ecran alb complet în browser („nu afișează nimic”).
* **Arhitectură Implementată:**
  - `src/middleware.ts` generează per-request un token criptografic unic (Nonce) cu `crypto.randomUUID()`.
  - Header-ul `x-nonce` este transmis către Next.js, permițând framework-ului să atașeze automat atributul `nonce` la toate scripturile inline de hidratare.
  - Directiva CSP `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'` elimină complet necesitatea `'unsafe-inline'` în producție, garantând conformitatea cu principiul zero-trust fără a compromite funcționalitatea.
  - Redirect-ul domeniului alternativ către domeniul canonic folosește adresa unificată `https://viziuneurbanaploiesti.ro/:path*`.
  - Componentele de barieră `app/error.tsx` și `app/not-found.tsx` previn căderea interfeței în ecran alb la erori neașteptate.
