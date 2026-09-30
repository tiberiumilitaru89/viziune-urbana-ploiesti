---
id: okf-security-pii-auth
title: "Securitate, Protecție PII & Autentificare Deterministă"
domain: security
last_verified: 2026-09-29
dependencies: ["okf-index"]
---

# Securitate, Protecție PII & Politici Autentificare

## 1. Protecție PII (Zero-Leakage Invariant)
* **Problema din versiunea legacy:** Endpoint-ul `GET /api/audit-requests` returna în clar numele complet, numerele de telefon și adresele exacte ale solicitanților către orice vizitator neautentificat.
* **Invariantă Noul Sistem:**
  1. Endpoint-ul public `/api/associations-progress` returnează **exclusiv date agregate și anonimizate**:
     - `id`
     - `building` (Nume bloc, ex: "Bloc 14A")
     - `neighborhood` / zonă (fără număr de apartament sau date de contact)
     - `status`
     - `forms_collected` & `forms_target`
     - `funds_collected` & `funds_target`
  2. Numele complet (`name`), telefonul (`phone`) și descrierea detaliată sunt accesibile **strict în panoul de administrare securizat** (`/admin`), protejat prin sesiune criptografică.

## 2. Autentificare Admin Rezistentă la Atacuri
* **Admin Login:**
  - Rate limiting strict (maxim 5 încercări pe interval de 15 minute per IP).
  - Parolă verificată prin `scrypt` sau `argon2id` (fără comparație plain-text vulnerabilă la timing attacks).
  - Cookie de sesiune: `HttpOnly; Secure; SameSite=Strict`.

## 3. Validare Server-Side Zod (Fail-Fast)
Toate cererile (cereri de audit, donații, autentificare) sunt validate strict la nivel de schemă Zod. Orice sarcină utilă care conține câmpuri neașteptate sau formate invalide este respinsă imediat cu `400 Bad Request`.
