/**
 * Serviciu Centralizat de Notificări Email pentru Asociația Viziune Urbană Ploiești
 * Expediază alerte detaliate către coordonatorul tehnic (George Becheanu)
 * și confirmări oficiale cetățenilor cu număr unic de dosar și date de contact directe.
 */

export const ADMIN_NOTIFICATION_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || "viziuneurbanaploiesti@yahoo.com";

export const OFFICIAL_COORDINATOR_NAME = "George Becheanu";
export const OFFICIAL_COORDINATOR_PHONE = "0720 015 592";
export const OFFICIAL_COORDINATOR_EMAIL = "viziuneurbanaploiesti@yahoo.com";
export const OFFICIAL_DOMAIN = "viziuneurbanaploiesti.ro";

export type EmailNotificationPayload = {
  subject: string;
  type: "audit_request" | "partner_application" | "donation" | "formular_230";
  title: string;
  fields: { label: string; value: string | number | undefined | null }[];
  replyTo?: string;
};

export async function sendAdminNotification(payload: EmailNotificationPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.NOTIFICATION_FROM_EMAIL ||
    "George Becheanu | Viziune Urbană Ploiești <notificari@viziuneurbanaploiesti.ro>";
  const adminRecipient = process.env.ADMIN_NOTIFICATION_EMAIL || "viziuneurbanaploiesti@yahoo.com";

  // Căutăm dacă solicitantul a lăsat un email valid pentru a permite reply direct din căsuța lui George
  const applicantEmailField = payload.fields.find(
    (f) =>
      f.label.toLowerCase().includes("email") &&
      typeof f.value === "string" &&
      f.value.includes("@")
  );
  const effectiveReplyTo =
    payload.replyTo ||
    (applicantEmailField && typeof applicantEmailField.value === "string"
      ? applicantEmailField.value.trim()
      : OFFICIAL_COORDINATOR_EMAIL);

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
              Asociația Viziune Urbană Ploiești &bull; Alertă Coordonator
            </div>
            <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: bold;">
              ${payload.title}
            </h1>
          </div>

          <div style="padding: 24px;">
            <p style="color: #475569; font-size: 14px; margin-top: 0; margin-bottom: 20px; line-height: 1.5;">
              A fost înregistrată o acțiune nouă pe platformă. Detaliile transmise sunt sintetizate mai jos:
            </p>

            <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
              ${rowsHtml}
            </table>

            <div style="margin-top: 24px; padding: 14px; background: #fafaf9; border-radius: 8px; border-left: 4px solid #c48834;">
              <span style="font-size: 12px; color: #57534e; display: block; line-height: 1.5;">
                Puteți gestiona și actualiza statusul acestei intrări direct din 
                <a href="https://viziuneurbanaploiesti.ro/admin" style="color: #b45309; font-weight: bold; text-decoration: underline;">Panoul de Administrare</a>.
                ${
                  applicantEmailField
                    ? `<br /><br /><strong>Notă:</strong> Apăsând „Răspunde” (Reply) la acest email veți trimite mesajul direct solicitantului (${applicantEmailField.value}).`
                    : ""
                }
              </span>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 14px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            Notificare automată generată de platforma Asociației Viziune Urbană Ploiești &bull; Coordonator Tehnic: ${OFFICIAL_COORDINATOR_NAME}
          </div>

        </div>
      </body>
    </html>
  `;

  // 1. Expediere via Resend API
  if (apiKey && adminRecipient) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        signal: AbortSignal.timeout(10000),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [adminRecipient],
          reply_to: effectiveReplyTo,
          subject: `[VUP] ${payload.subject}`,
          html: emailHtml,
        }),
      });

      if (!res.ok) {
        console.error("Resend API alertă admin a răspuns cu eroare:", await res.text());
        return false;
      }
      return true;
    } catch (err) {
      console.error("Eroare la apelul Resend API (admin):", err);
      return false;
    }
  }

  // 2. Fallback Formspree dacă este configurat
  const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT;
  if (formspreeEndpoint) {
    try {
      const formPayload: Record<string, string> = {
        _subject: `[VUP] ${payload.subject}`,
        tip_actiune: payload.title,
        coordonator: OFFICIAL_COORDINATOR_NAME,
      };
      payload.fields.forEach((f) => {
        formPayload[f.label] = String(f.value ?? "-");
      });

      await fetch(formspreeEndpoint, {
        method: "POST",
        signal: AbortSignal.timeout(10000),
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

export type CitizenConfirmationPayload = {
  toEmail: string;
  recipientName: string;
  registrationNumber: string;
  type: "formular_230" | "audit_request";
  details: { label: string; value: string | number | undefined | null }[];
};

export async function sendCitizenConfirmation(payload: CitizenConfirmationPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.NOTIFICATION_FROM_EMAIL ||
    "George Becheanu | Viziune Urbană Ploiești <notificari@viziuneurbanaploiesti.ro>";

  if (!payload.toEmail || !payload.toEmail.includes("@")) {
    return false;
  }

  // Graceful degradation dacă nu există încă API key configurat
  if (!apiKey) {
    return true;
  }

  const isF230 = payload.type === "formular_230";
  const emailSubject = isF230
    ? `Confirmare Înregistrare Formular 230 - Asociația Viziune Urbană Ploiești (Nr. ${payload.registrationNumber})`
    : `Confirmare Înregistrare Solicitare Evaluare Tehnică (Nr. ${payload.registrationNumber})`;

  const actionHeadline = isF230
    ? "Formularul 230 a fost Înregistrat cu Succes!"
    : "Solicitarea de Evaluare Tehnică a Fost Preluată!";

  const explanation = isF230
    ? "Vă mulțumim pentru susținerea campaniei de reabilitare a subsolurilor din municipiul Ploiești! Redirecționarea a 3,5% din impozitul pe venit reprezintă un sprijin vital ce va fi inclus în borderoul oficial depus la ANAF Prahova."
    : "Vă mulțumim pentru încredere! Solicitarea asociației dumneavoastră a fost înregistrată în baza de date. Echipa tehnică a Asociației Viziune Urbană Ploiești împreună cu inginerii partenerului autorizat Instal Serv Becheanu vor analiza detaliile și vă vor contacta telefonic pentru programarea inspecției tehnice gratuite a subsolului.";

  const rowsHtml = payload.details
    .map(
      (f) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 14px; font-weight: bold; color: #1e293b; width: 40%; background: #f8fafc;">${f.label}</td>
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
          
          <div style="background: #071330; padding: 24px; color: #ffffff; border-bottom: 4px solid #c48834;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; color: #c48834;">
              Asociația Viziune Urbană Ploiești
            </div>
            <h1 style="margin: 8px 0 0 0; font-size: 20px; font-weight: bold; color: #ffffff;">
              ${actionHeadline}
            </h1>
          </div>

          <div style="padding: 24px;">
            <p style="color: #334155; font-size: 14px; margin-top: 0; line-height: 1.6;">
              Stimate/Stimată <strong>${payload.recipientName}</strong>,
            </p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6;">
              ${explanation}
            </p>

            <div style="margin: 20px 0; padding: 14px 18px; background: #fefce8; border: 1px solid #fef08a; border-radius: 8px;">
              <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #854d0e; display: block;">
                Număr Unic de Înregistrare Dosar
              </span>
              <span style="font-size: 18px; font-weight: bold; color: #071330; font-family: monospace; display: block; margin-top: 4px;">
                ${payload.registrationNumber}
              </span>
            </div>

            <table style="width: 100%; border-collapse: collapse; font-size: 13px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-top: 16px;">
              ${rowsHtml}
            </table>

            <div style="margin-top: 24px; padding: 18px; background: #fafaf9; border-radius: 8px; border-left: 4px solid #c48834;">
              <div style="font-size: 13px; font-weight: bold; color: #071330; margin-bottom: 6px;">
                Persoană de Contact & Coordonare Tehnică:
              </div>
              <div style="font-size: 13px; color: #334155; line-height: 1.6;">
                <strong>${OFFICIAL_COORDINATOR_NAME}</strong><br />
                Partener Tehnic Oficial: Instal Serv Becheanu<br />
                Telefon Direct: <a href="tel:0720015592" style="color: #b45309; font-weight: bold; text-decoration: none;">${OFFICIAL_COORDINATOR_PHONE}</a><br />
                Email Asistență: <a href="mailto:${OFFICIAL_COORDINATOR_EMAIL}" style="color: #b45309; font-weight: bold; text-decoration: none;">${OFFICIAL_COORDINATOR_EMAIL}</a>
              </div>
              <span style="font-size: 12px; color: #64748b; display: block; margin-top: 10px; border-top: 1px dashed #cbd5e1; padding-top: 8px;">
                Puteți răspunde direct la acest email sau ne puteți contacta telefonic menționând numărul de dosar <strong>${payload.registrationNumber}</strong>.
              </span>
            </div>
          </div>

          <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            Asociația Viziune Urbană Ploiești &bull; Inițiativă civică independentă dedicată comunității prahovene &bull; viziuneurbanaploiesti.ro
          </div>

        </div>
      </body>
    </html>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [payload.toEmail],
        reply_to: OFFICIAL_COORDINATOR_EMAIL,
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      console.warn("Resend API avertisment la trimitere confirmare cetatean:", await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.warn("Eroare trimitere confirmare cetatean:", err);
    return false;
  }
}
