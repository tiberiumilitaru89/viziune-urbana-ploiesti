import { NextRequest, NextResponse } from "next/server";
import { isRequestAuthenticatedAsync } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { stripImageMetadata, verifySameOriginRequest } from "@/lib/security-utils";
import crypto from "crypto";
import {
  applyPrivateNoStoreHeaders,
  createProblemResponse,
  getCorrelationId,
  logStructured,
  withCorrelationHeader,
} from "@/lib/logger";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_MULTIPART_BODY_BYTES = Math.ceil(5.5 * 1024 * 1024);

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
  const correlationId = getCorrelationId(req);

  const originCheck = verifySameOriginRequest(req);
  if (!originCheck.allowed) {
    return applyPrivateNoStoreHeaders(
      createProblemResponse({
        status: 403,
        title: "Forbidden",
        detail: "Cerere respinsă: origine invalidă (protecție CSRF).",
        instance: "/api/admin/upload",
        correlationId,
      })
    );
  }

  // 1. Verificare Autentificare Admin Server-Side (cu verificarea revocării)
  const isAuth = await isRequestAuthenticatedAsync(req);
  if (!isAuth) {
    return applyPrivateNoStoreHeaders(
      createProblemResponse({
        status: 401,
        title: "Unauthorized",
        detail: "Acces neautorizat. Sesiune expirată sau invalidă.",
        instance: "/api/admin/upload",
        correlationId,
      })
    );
  }

  // 2. Verificare timpurie Content-Length pre-formData()
  const rawLength = req.headers.get("content-length");
  if (rawLength !== null) {
    const parsedLength = Number(rawLength);
    if (Number.isFinite(parsedLength) && parsedLength > MAX_MULTIPART_BODY_BYTES) {
      return applyPrivateNoStoreHeaders(
        createProblemResponse({
          status: 413,
          title: "Payload Too Large",
          detail: "Dimensiunea cererii depășește limita admisă de 5MB.",
          instance: "/api/admin/upload",
          correlationId,
        })
      );
    }
  }

  try {
    const formData = await req.formData();
    const fileEntry = formData.get("file");

    if (!fileEntry || typeof fileEntry === "string" || !(fileEntry instanceof File)) {
      return applyPrivateNoStoreHeaders(
        createProblemResponse({
          status: 400,
          title: "Bad Request",
          detail: "Nu a fost furnizat un fișier valid.",
          instance: "/api/admin/upload",
          correlationId,
        })
      );
    }

    const file = fileEntry;

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return applyPrivateNoStoreHeaders(
        createProblemResponse({
          status: 400,
          title: "Unsupported Media Type",
          detail: "Format de imagine nepermis. Sunt acceptate doar fișiere JPG, PNG sau WEBP.",
          instance: "/api/admin/upload",
          correlationId,
        })
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return applyPrivateNoStoreHeaders(
        createProblemResponse({
          status: 413,
          title: "Payload Too Large",
          detail: "Dimensiunea fișierului depășește limita admisă de 5MB.",
          instance: "/api/admin/upload",
          correlationId,
        })
      );
    }

    const extension =
      file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const safeId = crypto.randomBytes(8).toString("hex");
    const sanitizedFileName = `img_${Date.now()}_${safeId}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
      return applyPrivateNoStoreHeaders(
        createProblemResponse({
          status: 413,
          title: "Payload Too Large",
          detail: "Dimensiunea fișierului depășește limita admisă de 5MB.",
          instance: "/api/admin/upload",
          correlationId,
        })
      );
    }

    if (!hasValidImageMagicBytes(buffer, file.type)) {
      return applyPrivateNoStoreHeaders(
        createProblemResponse({
          status: 400,
          title: "Bad Request",
          detail:
            "Semnătura binară (Magic Bytes) a fișierului nu corespunde formatului declarat (JPG/PNG/WEBP).",
          instance: "/api/admin/upload",
          correlationId,
        })
      );
    }

    // Eliminare metadate EXIF/GPS/XMP/tEXt/COM pentru JPEG, PNG și WebP
    const cleanBytes = Buffer.from(stripImageMetadata(buffer, file.type));

    let targetBucket = "proiecte";
    let { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(targetBucket)
      .upload(sanitizedFileName, cleanBytes, {
        contentType: file.type,
        upsert: false,
      });

    if (
      uploadError &&
      (uploadError.message.toLowerCase().includes("not found") ||
        (uploadError as { statusCode?: string }).statusCode === "404")
    ) {
      const altResult = await supabaseAdmin.storage
        .from("Proiecte")
        .upload(sanitizedFileName, cleanBytes, {
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
      logStructured("error", "supabase_storage_upload_failed", {
        correlationId,
        reason: uploadError?.message || "missing_upload_data",
      });

      if (process.env.NODE_ENV === "production") {
        return applyPrivateNoStoreHeaders(
          createProblemResponse({
            status: 503,
            title: "Service Unavailable",
            detail: "Serviciul de stocare media Supabase Storage este indisponibil temporar.",
            instance: "/api/admin/upload",
            correlationId,
          })
        );
      }

      const base64Data = cleanBytes.toString("base64");
      const dataUrl = `data:${file.type};base64,${base64Data}`;

      return applyPrivateNoStoreHeaders(
        withCorrelationHeader(
          NextResponse.json({
            success: true,
            url: dataUrl,
            filename: sanitizedFileName,
            storage: "base64_fallback",
            message: "Imagine stocată în fallback local de dezvoltare.",
          }),
          correlationId
        )
      );
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(targetBucket)
      .getPublicUrl(uploadData.path);

    return applyPrivateNoStoreHeaders(
      withCorrelationHeader(
        NextResponse.json({
          success: true,
          url: publicUrlData.publicUrl,
          filename: sanitizedFileName,
          storage: "supabase_storage",
        }),
        correlationId
      )
    );
  } catch (error) {
    logStructured("error", "admin_image_upload_failed", {
      correlationId,
      error: error instanceof Error ? error.message : "unknown_error",
    });
    return applyPrivateNoStoreHeaders(
      createProblemResponse({
        status: 500,
        title: "Internal Server Error",
        detail: "A apărut o eroare internă la procesarea imaginii.",
        instance: "/api/admin/upload",
        correlationId,
      })
    );
  }
}
