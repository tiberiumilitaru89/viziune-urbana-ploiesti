---
id: okf-security-gdpr-legal
title: "Conformitate GDPR, Politică Cookies & Cadru Legal Asociație"
domain: security
last_verified: 2026-10-08
dependencies: ["okf-index", "okf-security-pii-auth"]
---

# Conformitate GDPR, Politică Cookies & Cadru Legal Asociație

## 1. Cadru Juridic & Identificare Operator

* **Operator de Date:** Asociația Viziune Urbană Ploiești, persoană juridică română de drept privat fără scop patrimonial, înființată în temeiul OG nr. 26/2000 și al Legii nr. 196/2018.
* **Sediul / Date de Contact:** Municipiul Ploiești, Jud. Prahova, e-mail: `viziuneurbanaploiesti@yahoo.com`, telefon: `0720 015 592`.
* **Reglementări aplicabile:**
  - Regulamentul (UE) 2016/679 (GDPR);
  - Legea nr. 190/2018 privind măsuri de punere în aplicare a Regulamentului (UE) 2016/679 (în special art. 4 privind prelucrarea numărului de identificare național - CNP);
  - Legea nr. 506/2004 privind prelucrarea datelor cu caracter personal și protecția vieții private în sectorul comunicațiilor electronice;
  - Codul Fiscal (Legea nr. 227/2015, art. 79 alin. (3)) și Codul de Procedură Fiscală (Legea nr. 207/2015) privind Formularul 230 ANAF;
  - Legea nr. 32/1994 privind sponsorizarea.

---

## 2. Taxonomia Datelor Prelucrate & Temeiuri Juridice

| Modul / Formular | Categorii de Date Prelucrate | Temei Juridic (GDPR) | Termen de Retenție | Destinatari |
| :--- | :--- | :--- | :--- | :--- |
| **Formular 230 ANAF** (`/formular-230`) | Nume, prenume, inițiala tatălui, CNP, adresă completă domiciliu, telefon, e-mail, semnătură olografă digitalizată | Art. 6(1)(a) (Consimțământ) & Art. 6(1)(c) (Obligație legală / mandat de depunere la organul fiscal) | 5 ani fiscali (conform arhivării documentelor fiscale justificative din Codul de Procedură Fiscală) | AJFP Prahova (ANAF Ploiești), personal autorizat Asociație |
| **Audit Tehnic Subsol** (`AuditModal`) | Nume persoană contact, telefon, e-mail, denumire imobil/bloc, adresă asociație, descriere avarii | Art. 6(1)(b) (Demersuri precontractuale la cererea persoanei) & Art. 6(1)(f) (Interes legitim civic) | 1 an de la data soluționării sau pe durata execuției lucrărilor tehnice | Comisia tehnică a Asociației, partener tehnic acreditat (*Instal Serv Becheanu*) |
| **Sponsorizare / Donație** (`DonationModal`) | Nume persoană / companie, CUI/CIF, telefon, e-mail, sumă sau bunuri sponsorizate | Art. 6(1)(b) & (c) (Încheiere contract de sponsorizare Legea 32/1994) | 5 ani (documente contabile obligatorii) | Departamentul financiar-contabil, bănci partenere |

---

## 3. Regimul Special al CNP-ului (Art. 4 Legea 190/2018)

1. CNP-ul este solicitat **exclusiv** în cadrul Formularului 230, fiind o rubrică obligatorie impusă de Ordinul Președintelui ANAF pentru validarea calității de contribuabil.
2. Este strict interzisă utilizarea CNP-ului în scopuri secundare, de marketing, profilare sau transmiterea lui către partenerii comerciali ori publicitari.
3. Consimțământul este colectat explicit printr-o acțiune afirmativă (bifă activată de utilizator) înainte de generarea și transmiterea formularului.

---

## 4. Politică Deterministă Privind Modulele Cookie

* **Statut Zero-Tracking:** Platforma `viziuneurbanaploiesti.ro` **nu** utilizează instrumente terțe de tracking, retargeting sau analiză comercială (Google Analytics, Meta Pixel, TikTok etc.).
* **Cookie-uri Strict Necesare:**
  - `vup_admin_session`: token de sesiune administrativă criptat HMAC-SHA256, valabil 8 ore, securizat prin atributele `HttpOnly`, `SameSite=Lax`, `Secure`, `Path=/`.
* **Exceptare Legală de la Banner-ul de Consimțământ:**  
  Conform Art. 5 alin. (3) din Directiva 2002/58/CE (ePrivacy) și Deciziilor EDPB, cookie-urile strict necesare furnizării unui serviciu solicitat în mod expres de utilizator (autentificarea în zona protejată) sunt scutite de obligația obținerii consimțământului prealabil prin banner pop-up.

---

## 5. Rute și Puncte de Contact Publice

* `/confidentialitate` — Notă de informare exhaustivă GDPR;
* `/termeni` — Termeni și condiții de utilizare și acord de sponsorizare asociații;
* `/cookies` — Informare tehnică privind modulele cookie;
* Link-uri canonice plasate permanent în subsolul tuturor paginilor (`Footer.tsx`).

---

## 6. Soluționarea Alternativă a Litigiilor (SAL & SOL) și Relația cu Autoritățile

Conform dispozițiilor *Ordinului Președintelui ANPC nr. 449/2022* și *Regulamentului (UE) nr. 524/2013*, precum și principiilor de transparență civică:

1. **Soluționarea Litigiilor de Consum (Locatari & Asociații de Proprietari):**
   - **ANPC - SAL (Soluționarea Alternativă a Litigiilor):** Procedură extrajudiciară gratuită sau cu cost redus prin Direcția SAL din cadrul ANPC (`https://anpc.ro/ce-este-sal/`).
   - **Comisia Europeană - SOL (Soluționarea Online a Litigiilor):** Instrument digital transfrontalier pentru sesizări online (`https://ec.europa.eu/consumers/odr`).

2. **Autorități de Reglementare & Verificare Publică:**
   - **ANAF – Registrul Entităților Fiscale Scutite (3,5%):** Verificare oficială a eligibilității Asociației Viziune Urbană Ploiești (CIF `48923410`) pe portalul ANAF (`https://www.anaf.ro/anaf/internet/ANAF/servicii_online/registre/entitati_cult`).
   - **ANPC:** Autoritatea Națională pentru Protecția Consumatorilor (`https://anpc.ro/`).
   - **ANSPDCP:** Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (`https://www.dataprotection.ro/`).
   - **Primăria Municipiului Ploiești:** Serviciul Îndrumare Asociații de Proprietari conform Legii nr. 196/2018 (`https://www.ploiesti.ro/`).
   - **Termo Ploiești S.R.L. & Apa Nova Ploiești:** Operatori locali de rețele edilitare pentru coordonarea aviziilor de golire/izolare a branșamentelor tehnice.

