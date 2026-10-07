/**
 * Cartierele Municipiului Ploiești & Utilitare de Clasificare Teritorială
 * Asociația Viziune Urbană Ploiești
 */

export const PLOIESTI_NEIGHBORHOODS = [
  "Nord",
  "Vest",
  "Centru",
  "Malu Roșu",
  "Sud / Bariera București",
  "Democrației",
  "Mihai Bravu",
] as const;

export type PloiestiNeighborhood = (typeof PLOIESTI_NEIGHBORHOODS)[number] | "Alte Zone";

export function detectNeighborhood(address: string, buildingName?: string): PloiestiNeighborhood {
  const text = `${address || ""} ${buildingName || ""}`.toLowerCase();

  if (
    text.includes("republicii") ||
    text.includes("nord") ||
    text.includes("cameliei") ||
    text.includes("gageni") ||
    text.includes("găgeni") ||
    text.includes("cablu") ||
    text.includes("andrei muresanu") ||
    text.includes("andrei mureșanu")
  ) {
    return "Nord";
  }

  if (
    text.includes("marasesti") ||
    text.includes("mărășești") ||
    text.includes("vest") ||
    text.includes("infratirii") ||
    text.includes("înfrățirii") ||
    text.includes("lamaita") ||
    text.includes("lămâița") ||
    text.includes("aurora") ||
    text.includes("eroilor")
  ) {
    return "Vest";
  }

  if (
    text.includes("malu rosu") ||
    text.includes("malu roșu") ||
    text.includes("pod inalt") ||
    text.includes("pod înalt") ||
    text.includes("ofelia") ||
    text.includes("oltului")
  ) {
    return "Malu Roșu";
  }

  if (
    text.includes("bucuresti") ||
    text.includes("bucurești") ||
    text.includes("gara de sud") ||
    text.includes("sud") ||
    text.includes("bariera bucuresti") ||
    text.includes("bariera bucurești") ||
    text.includes("depoului")
  ) {
    return "Sud / Bariera București";
  }

  if (
    text.includes("democratiei") ||
    text.includes("democrației") ||
    text.includes("bobilna") ||
    text.includes("bobâlna") ||
    text.includes("stefan cel mare") ||
    text.includes("ștefan cel mare") ||
    text.includes("milcov")
  ) {
    return "Democrației";
  }

  if (
    text.includes("mihai bravu") ||
    text.includes("chimiei") ||
    text.includes("gradinari") ||
    text.includes("grădinari") ||
    text.includes("teleajen")
  ) {
    return "Mihai Bravu";
  }

  if (
    text.includes("centru") ||
    text.includes("independentei") ||
    text.includes("independenței") ||
    text.includes("cuza voda") ||
    text.includes("cuza vodă") ||
    text.includes("postei") ||
    text.includes("poștei") ||
    text.includes("piata victoriei") ||
    text.includes("piața victoriei") ||
    text.includes("emile zola")
  ) {
    return "Centru";
  }

  return "Nord"; // Default reprezentativ pentru Ploiești
}
