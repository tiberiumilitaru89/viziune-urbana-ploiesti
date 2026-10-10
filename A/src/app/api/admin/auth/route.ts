import { NextResponse } from "next/server";
import { 
  SESSION_COOKIE_NAME, 
  SESSION_DURATION_SECONDS,
  createSessionToken, 
  isRequestAuthenticated, 
  verifyAdminPassword 
} from "@/lib/auth";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET(req: Request) {
  const authenticated = isRequestAuthenticated(req);
  return NextResponse.json({
    success: true,
    authenticated,
  });
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const body = await req.json().catch(() => ({}));
    const { action, password } = body;

    if (action === "logout") {
      const response = NextResponse.json({
        success: true,
        message: "Deconectare reușită",
      });

      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });

      return response;
    }

    if (action === "login") {
      // Protecție Rate-Limiting împotriva atacurilor Brute-Force (5 încercări / 15 minute)
      const rateLimitKey = `admin-login:${ip}`;
      const limit = checkRateLimit(rateLimitKey, 5, 15 * 60 * 1000);

      if (!limit.allowed) {
        const waitMinutes = Math.ceil(limit.resetInMs / 60000);
        return NextResponse.json(
          {
            success: false,
            error: `Prea multe încercări eșuate de autentificare. Încercați din nou peste ${waitMinutes} minute.`,
          },
          { status: 429 }
        );
      }

      if (!password || !verifyAdminPassword(password)) {
        return NextResponse.json(
          {
            success: false,
            error: "Parolă administrativă incorectă.",
            attemptsRemaining: limit.remaining,
          },
          { status: 401 }
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
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_DURATION_SECONDS, // 8 ore conforme politicilor de securitate
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Acțiune de autentificare necunoscută." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Eroare internă de server la autentificare." },
      { status: 500 }
    );
  }
}
