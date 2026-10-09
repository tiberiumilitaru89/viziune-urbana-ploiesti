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
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Nu a fost furnizat niciun fișier." },
        { status: 400 }
      );
    }

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

    // 5. Conversie buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 6. Încărcare în Supabase Storage (Bucket "proiecte")
    const bucketName = "proiecte";
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(sanitizedFileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      // Dacă bucket-ul nu există sau returnează eroare de configurare storage,
      // oferim fallback pe data URL optimizat pentru a nu bloca administratorul
      console.warn("Supabase Storage bucket upload notice:", uploadError.message);
      
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
      .from(bucketName)
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
