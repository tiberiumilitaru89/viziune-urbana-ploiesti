/**
 * Validator Matematic Oficial CNP (România)
 * Implementează algoritmul național de control cu cheia de ponderare 279146358279,
 * verificarea de secol, an, lună și zi calendaristică.
 */

export type CnpValidationResult = {
  readonly isValid: boolean;
  readonly error?: string;
  readonly birthDate?: Date;
  readonly gender?: "M" | "F";
};

const CNP_WEIGHTS: readonly number[] = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];

export function validateRomanianCnp(cnp: string): CnpValidationResult {
  const clean = (cnp || "").trim();

  if (!/^[1-8]\d{12}$/.test(clean)) {
    return {
      isValid: false,
      error: "CNP-ul trebuie să conțină exact 13 cifre numerice și să înceapă cu o cifră între 1 și 8.",
    };
  }

  const s = parseInt(clean[0], 10);
  const aa = parseInt(clean.substring(1, 3), 10);
  const ll = parseInt(clean.substring(3, 5), 10);
  const zz = parseInt(clean.substring(5, 7), 10);

  // Verificare lună calendaristică
  if (ll < 1 || ll > 12) {
    return {
      isValid: false,
      error: "Luna de naștere indicată în CNP este invalidă (trebuie să fie între 01 și 12).",
    };
  }

  // Determinare secol
  let century = 1900;
  let gender: "M" | "F" = "M";

  if (s === 1 || s === 2) {
    century = 1900;
    gender = s === 1 ? "M" : "F";
  } else if (s === 3 || s === 4) {
    century = 1800;
    gender = s === 3 ? "M" : "F";
  } else if (s === 5 || s === 6) {
    century = 2000;
    gender = s === 5 ? "M" : "F";
  } else if (s === 7 || s === 8) {
    century = 1900; // Rezidenți străini
    gender = s === 7 ? "M" : "F";
  }

  const fullYear = century + aa;

  // Verificare an și zi funcție de an bisect
  const daysInMonth = new Date(fullYear, ll, 0).getDate();
  if (zz < 1 || zz > daysInMonth) {
    return {
      isValid: false,
      error: `Ziua de naștere din CNP (${zz}) este invalidă pentru luna ${ll} a anului ${fullYear}.`,
    };
  }

  const birthDate = new Date(Date.UTC(fullYear, ll - 1, zz));
  const now = new Date();
  if (birthDate > now) {
    return {
      isValid: false,
      error: "Data nașterii din CNP nu poate fi în viitor.",
    };
  }

  // Algoritmul ponderat pentru cifra de control
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean[i], 10) * CNP_WEIGHTS[i];
  }

  const remainder = sum % 11;
  const controlDigit = remainder === 10 ? 1 : remainder;

  if (controlDigit !== parseInt(clean[12], 10)) {
    return {
      isValid: false,
      error: "Cifra de control a CNP-ului nu corespunde (eroare de tastare a cifrelor).",
    };
  }

  return {
    isValid: true,
    birthDate,
    gender,
  };
}
