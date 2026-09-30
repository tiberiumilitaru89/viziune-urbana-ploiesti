import { Resend } from "resend";

// Instantiated lazily so the server can start without RESEND_API_KEY configured.
let _resend: Resend | null = null;
function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

export interface NewAuditRequestEmailData {
  name: string;
  phone: string;
  building: string;
  address: string;
  problem: string;
  id: number;
}

export async function sendNewAuditRequestEmail(data: NewAuditRequestEmailData): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const client = getResend();
  if (!client || !adminEmail) {
    // Log and skip — email not configured
    console.warn(
      "[email] RESEND_API_KEY sau ADMIN_EMAIL lipsesc. Notificarea email a fost omisă."
    );
    return;
  }

  const siteUrl = process.env.SITE_URL ?? "https://viziune-urbana.ro";
  const adminLink = `${siteUrl}/admin#asociatii-pending`;

  const { error } = await client.emails.send({
    from: process.env.EMAIL_FROM ?? "noreply@viziune-urbana.ro",
    to: adminEmail,
    subject: `[Viziune Urbană] Cerere nouă de la bloc ${data.building}`,
    html: `
<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"></head>
<body style="font-family: Arial, sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h2 style="color: #2563eb; margin-bottom: 8px;">🏢 Cerere nouă de audit energetic</h2>
  <p style="color: #6b7280; margin-top: 0;">A fost completat un nou formular de înscriere pe platforma Viziune Urbană Ploiești.</p>

  <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
    <tr style="background: #f3f4f6;">
      <td style="padding: 10px 14px; font-weight: bold; width: 40%;">Bloc</td>
      <td style="padding: 10px 14px;">${escapeHtml(data.building)}</td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; font-weight: bold;">Adresă</td>
      <td style="padding: 10px 14px;">${escapeHtml(data.address)}</td>
    </tr>
    <tr style="background: #f3f4f6;">
      <td style="padding: 10px 14px; font-weight: bold;">Persoană contact</td>
      <td style="padding: 10px 14px;">${escapeHtml(data.name)}</td>
    </tr>
    <tr>
      <td style="padding: 10px 14px; font-weight: bold;">Telefon</td>
      <td style="padding: 10px 14px;">${escapeHtml(data.phone)}</td>
    </tr>
    <tr style="background: #f3f4f6;">
      <td style="padding: 10px 14px; font-weight: bold; vertical-align: top;">Descriere problemă</td>
      <td style="padding: 10px 14px; white-space: pre-wrap;">${escapeHtml(data.problem)}</td>
    </tr>
  </table>

  <p style="margin: 24px 0;">
    <a href="${adminLink}"
       style="background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
      Deschide panoul de administrare →
    </a>
  </p>

  <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
    Cerere #${data.id} · Viziune Urbană Ploiești
  </p>
</body>
</html>`,
  });

  if (error) {
    console.error("[email] Eroare la trimiterea notificării:", error);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
