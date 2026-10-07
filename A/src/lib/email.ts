/**
 * Serviciu Centralizat de Notificări Email pentru Asociația Viziune Urbană Ploiești
 * Trimite alerte detaliate pentru toate acțiunile de pe site către adresa administratorului.
 */

export const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "";

export type EmailNotificationPayload = {
  subject: string;
  type: "audit_request" | "partner_application" | "donation" | "formular_230";
  title: string;
  fields: { label: string; value: string | number | undefined | null }[];
};

export async function sendAdminNotification(payload: EmailNotificationPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || "notificari@viziuneurbanaploiesti.ro";

  const rowsHtml = payload.fields
    .map(
      (f) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; font-weight: bold; color: #1e293b; width: 35%; background: #f8fafc;">${f.label}</td>
        <td style="padding: 10px 14px; color: #334155; font-family: sans-serif;">${f.value ?? "-"}</td>
      </tr>
    `
    )
    .join("");

  const emailHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; padding: 24px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          
          <div style="background: #c48834; padding: 20px 24px; color: #ffffff;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; opacity: 0.9;">
              Asociația Viziune Urbană Ploiești • Alertă Site
            </div>
            <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: bold;">
              ${payload.title}
            </h1>
          </div>

          <div style="padding: 24px;">
            <p style="color: #475569; font-size: 14px; margin-top: 0; margin-bottom: 20px; line-height: 1.5;">
              A fost înregistrată o acțiune nouă pe site-ul oficial. Detaliile transmise sunt sintetizate mai jos:
            </p>

            <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              ${rowsHtml}
            </table>

            <div style="margin-top: 24px; padding: 14px; background: #fafaf9; border-radius: 8px; border-left: 4px solid #c48834;">
              <span style="font-size: 12px; color: #57534e; display: block;">
                Puteți gestiona și actualiza statusul acestei intrări direct din 
                <a href="https://viziuneurbanaploiesti.ro/admin" style="color: #b45309; font-weight: bold; text-decoration: underline;">Panoul de Administrare</a>.
              </span>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 14px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            Notificare automată generată de platforma Asociației Viziune Urbană Ploiești
          </div>

        </div>
      </body>
    </html>
  `;

  // Dacă nu avem configurată adresă sau vreun serviciu activ, facem doar logging silențios
  if (!ADMIN_NOTIFICATION_EMAIL && !process.env.FORMSPREE_ENDPOINT) {
    return true;
  }

  // 1. Dacă există RESEND_API_KEY configurat în mediu, trimitem via Resend API
  if (apiKey && ADMIN_NOTIFICATION_EMAIL) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [ADMIN_NOTIFICATION_EMAIL],
          subject: `[VUP] ${payload.subject}`,
          html: emailHtml,
        }),
      });

      if (!res.ok) {
        console.error("Resend API a răspuns cu eroare:", await res.text());
        return false;
      }
      return true;
    } catch (err) {
      console.error("Eroare la apelul Resend API:", err);
      return false;
    }
  }

  // 2. Suport Formspree (dacă clientul adaugă FORMSPREE_ENDPOINT în Vercel)
  const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT;
  if (formspreeEndpoint) {
    try {
      const formPayload: Record<string, string> = {
        _subject: `[VUP] ${payload.subject}`,
        tip_actiune: payload.title,
      };
      payload.fields.forEach((f) => {
        formPayload[f.label] = String(f.value ?? "-");
      });

      await fetch(formspreeEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(formPayload),
      });
      return true;
    } catch (err) {
      console.error("Eroare la apelul Formspree:", err);
      return false;
    }
  }

  return true;
}
