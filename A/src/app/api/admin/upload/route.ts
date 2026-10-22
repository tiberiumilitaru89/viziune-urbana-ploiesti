import { NextRequest, NextResponse } from "next/server";
import { isRequestAuthenticated } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";

// Constrângeri de securitate MIME & Dimensiune
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Validare binară la nivel de octeți (Magic Bytes Inspection)
 * Previne atacurile de tip MIME Spoofing (ex. script sau executabil redenumit în .jpg/.png)
 */
function hasValidImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (mimeType === "image/jpeg") {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }
  if (mimeType === "image/png") {
    return (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }
  if (mimeType === "image/webp") {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    );
  }
  return false;
}

export async function POST(req: NextRequest) {
  // 1. Verificare Autentificare Admin Server-Side
  const isAuth = isRequestAuthenticated(req);
  if (!isAuth) {
    return NextResponse.json(
      { success: false, error: "Acces neautorizat. Sesiune expirată sau invalidă." },
      { status: 401 }
    );
  }

  try {
    const formData = await req.formData();
    const fileEntry = formData.get("file");

    if (!fileEntry || typeof fileEntry === "string" || !(fileEntry instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Nu a fost furnizat un fișier valid." },
        { status: 400 }
      );
    }

    const file = fileEntry;

    // 2. Validare MIME strictă (Fără SVG sau fișiere arbitrare)
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Format de imagine nepermis. Sunt acceptate doar fișiere JPG, PNG sau WEBP.",
        },
        { status: 400 }
      );
    }

    // 3. Validare Dimensiune Maximă
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: "Dimensiunea fișierului depășește limita admisă de 5MB.",
        },
        { status: 400 }
      );
    }

    // 4. Sanitizare Nume & Extensie fișier
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const safeId = crypto.randomBytes(8).toString("hex");
    const sanitizedFileName = `img_${Date.now()}_${safeId}.${extension}`;

    // 5. Conversie buffer & Validare Semnătură Binară (Magic Bytes)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (!hasValidImageMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Semnătura binară (Magic Bytes) a fișierului nu corespunde formatului declarat (JPG/PNG/WEBP).",
        },
        { status: 400 }
      );
    }

    // 6. Încărcare în Supabase Storage (Bucket "proiecte" sau "Proiecte")
    let targetBucket = "proiecte";
    let { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(targetBucket)
      .upload(sanitizedFileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    // Dacă utilizatorul a creat bucket-ul cu majusculă "Proiecte", încercăm automat și această variantă
    if (uploadError && (uploadError.message.toLowerCase().includes("not found") || (uploadError as { statusCode?: string }).statusCode === "404")) {
      const altResult = await supabaseAdmin.storage
        .from("Proiecte")
        .upload(sanitizedFileName, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (!altResult.error && altResult.data) {
        uploadError = null;
        uploadData = altResult.data;
        targetBucket = "Proiecte";
      }
    }

    if (uploadError || !uploadData) {
      // Dacă bucket-ul nu există sau returnează eroare de configurare storage,
      // oferim fallback pe data URL optimizat pentru a nu bloca administratorul
      console.warn("Supabase Storage bucket upload notice:", uploadError?.message || "Lipsă date răspuns storage");
      
      const base64Data = buffer.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64Data}`;
      
      return NextResponse.json({
        success: true,
        url: dataUrl,
        filename: sanitizedFileName,
        storage: "base64_fallback",
        message: "Imagine stocată cu succes.",
      });
    }

    // Obținere URL public din Supabase Storage
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(targetBucket)
      .getPublicUrl(uploadData.path);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      filename: sanitizedFileName,
      storage: "supabase_storage",
    });
  } catch (error) {
    console.error("Eroare upload imagine admin:", error);
    return NextResponse.json(
      { success: false, error: "A apărut o eroare internă la procesarea imaginii." },
      { status: 500 }
    );
  }
}
