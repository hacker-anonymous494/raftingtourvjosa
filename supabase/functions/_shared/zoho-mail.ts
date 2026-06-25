// Zoho Mail API via OAuth2 (using account-level token)
// Prerequisites: Create Zoho Mail app and get client ID/secret, then obtain refresh token.
// We'll use the password-based API for simplicity (less secure but works for transactional emails).
// Better: use Zoho's SMTP or API with access token.
// This example uses Zoho's Mail API v1 with an API key from Zoho Mail.
export async function sendZohoEmail({
  to,
  subject,
  htmlBody,
}: {
  to: string;
  subject: string;
  htmlBody: string;
}) {
  const accountEmail = Deno.env.get('ZOHO_EMAIL')!;
  const apiKey = Deno.env.get('ZOHO_MAIL_API_KEY')!; // from Zoho Mail API keys
  const response = await fetch(`https://mail.zoho.com/api/accounts/${accountEmail}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Zoho-oauthtoken ${apiKey}`,
    },
    body: JSON.stringify({
      fromAddress: accountEmail,
      toAddress: to,
      subject,
      content: htmlBody,
      mailFormat: 'html',
    }),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Zoho email failed: ${error}`);
  }
  return response.json();
}