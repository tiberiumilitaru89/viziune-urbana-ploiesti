import { NextResponse } from "next/server";
import { z } from "zod";
import {
  LEGACY_SESSION_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  createSessionToken,
  extractSessionTokenFromRequest,
  isRequestAuthenticatedAsync,
  revokeSessionToken,
  verifyAdminPassword,
} from "@/lib/auth";
import { applyPrivateNoStoreHeaders } from "@/lib/logger";
import { checkRateLimitAsync, getClientIp } from "@/lib/rateLimit";
import {
  InvalidJsonBodyError,
  PayloadTooLargeError,
  readJsonWithLimit,
} from "@/lib/request-guard";
import { verifySameOriginRequest } from "@/lib/security-utils";

const MAX_AUTH_BODY_BYTES = 4_096;

const authBodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("logout") }).strict(),
  z
    .object({
      action: z.literal("login"),
      password: z.string().min(1).max(128),
    })
    .strict(),
]);

export async function GET(req: Request) {
  const authenticated = await isRequestAuthenticatedAsync(req);
  return applyPrivateNoStoreHeaders(
    NextResponse.json({
      success: true,
      authenticated,
    })
  );
}

export async function POST(req: Request) {
  try {
    const originCheck = verifySameOriginRequest(req);
    if (!originCheck.allowed) {
      return applyPrivateNoStoreHeaders(
        NextResponse.json(
          { success: false, error: "Cerere respinsă: origine invalidă." },
          { status: 403 }
        )
      );
    }

    const ip = getClientIp(req);
    const body = await readJsonWithLimit(req, MAX_AUTH_BODY_BYTES);
    const parsed = authBodySchema.safeParse(body);

    if (!parsed.success) {
      return applyPrivateNoStoreHeaders(
        NextResponse.json(
          { success: false, error: "Cerere de autentificare invalidă." },
          { status: 400 }
        )
      );
    }

    if (parsed.data.action === "logout") {
      const currentToken = extractSessionTokenFromRequest(req);
      if (currentToken) {
        await revokeSessionToken(currentToken);
      }

      const response = NextResponse.json({
        success: true,
        message: "Deconectare reușită",
      });

      const isProd = process.env.NODE_ENV === "production";
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/",
        maxAge: 0,
      });

      if (LEGACY_SESSION_COOKIE_NAME !== SESSION_COOKIE_NAME) {
        response.cookies.set({
          name: LEGACY_SESSION_COOKIE_NAME,
          value: "",
          httpOnly: true,
          secure: isProd,
          sameSite: "strict",
          path: "/",
          maxAge: 0,
        });
      }

      return applyPrivateNoStoreHeaders(response);
    }

    // action === "login": Protecție Rate-Limiting distribuită împotriva atacurilor Brute-Force (5 încercări / 15 minute)
    const rateLimitKey = `admin-login:${ip}`;
    const limit = await checkRateLimitAsync(rateLimitKey, 5, 15 * 60 * 1000);

    if (!limit.allowed) {
      const waitMinutes = Math.ceil(limit.resetInMs / 60000);
      return applyPrivateNoStoreHeaders(
        NextResponse.json(
          {
            success: false,
            error: `Prea multe încercări eșuate de autentificare. Încercați din nou peste ${waitMinutes} minute.`,
          },
          { status: 429 }
        )
      );
    }

    if (!verifyAdminPassword(parsed.data.password)) {
      return applyPrivateNoStoreHeaders(
        NextResponse.json(
          {
            success: false,
            error: "Parolă administrativă incorectă.",
            attemptsRemaining: limit.remaining,
          },
          { status: 401 }
        )
      );
    }

    // Generare sesiune semnată HMAC-SHA256
    const token = createSessionToken();
    const response = NextResponse.json({
      success: true,
      message: "Autentificare reușită.",
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });

    return applyPrivateNoStoreHeaders(response);
  } catch (err) {
    if (err instanceof PayloadTooLargeError) {
      return applyPrivateNoStoreHeaders(
        NextResponse.json(
          { success: false, error: "Cerere prea mare." },
          { status: 413 }
        )
      );
    }
    if (err instanceof InvalidJsonBodyError) {
      return applyPrivateNoStoreHeaders(
        NextResponse.json(
          { success: false, error: "Corp JSON invalid." },
          { status: 400 }
        )
      );
    }
    return applyPrivateNoStoreHeaders(
      NextResponse.json(
        { success: false, error: "Eroare internă de server la autentificare." },
        { status: 500 }
      )
    );
  }
}
