import { SITE_CONFIG } from '../constants';
import { getUnsubscribeToken } from './unsubscribe';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildNewsletterEmail({
  locale = 'fr',
  post,
  siteUrl,
  subscriberEmail,
}) {
  const safeLocale = ['fr', 'en', 'de'].includes(locale) ? locale : 'fr';
  const title =
    post?.title?.[safeLocale] ||
    post?.title?.fr ||
    post?.title ||
    'Nouveau post';
  const rawText =
    post?.texte?.[safeLocale] || post?.texte?.fr || post?.text || '';

  const firstParagraph = String(rawText).split('\n\n')[0].trim();
  const snippet =
    firstParagraph.length > 260
      ? `${firstParagraph.slice(0, 257)}…`
      : firstParagraph;

  const canonicalSiteUrl = String(siteUrl || '').replace(/\/$/, '');
  const readUrl = `${canonicalSiteUrl}/${safeLocale}?post=${encodeURIComponent(post._id)}#blog`;

  const unsubToken = getUnsubscribeToken(subscriberEmail);
  const unsubUrl = `${canonicalSiteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(
    subscriberEmail
  )}&token=${encodeURIComponent(unsubToken)}`;

  const hero = post?.image?.asset?.url || post?.imageUrl;

  // Format date (ex: "12 oct. 2026")
  const postDate = post?.date
    ? new Date(post.date).toLocaleDateString(
        safeLocale === 'fr' ? 'fr-FR' : safeLocale === 'de' ? 'de-DE' : 'en-US',
        {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }
      )
    : '';

  // Email HTML (table-based + inline CSS) pour compat maximale
  return {
    subject:
      safeLocale === 'fr'
        ? `Nouveau post — ${title}`
        : safeLocale === 'de'
          ? `Neuer Beitrag — ${title}`
          : `New post — ${title}`,
    html: `<!doctype html>
<html lang="${safeLocale}">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#1a1a1a;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#1a1a1a;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="width:640px;max-width:100%;background:#1a1a1a;">
            <!-- Header -->
            <tr>
              <td style="padding:0 32px 40px 32px;text-align:center;font-family:Georgia, 'Times New Roman', serif;border-bottom:1px solid rgba(255,255,255,0.08);">
                <div style="font-size:13px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(242,242,242,0.65);margin-bottom:8px;">
                  View in browser
                </div>
                <div style="font-size:32px;letter-spacing:0.06em;font-style:italic;color:#ffffff;">
                  ${escapeHtml(SITE_CONFIG.author || 'HAN-NOAH MASSENGO')}
                </div>
              </td>
            </tr>

            <!-- Title with Date -->
            <tr>
              <td style="padding:32px 32px 24px 32px;font-family:Georgia, 'Times New Roman', serif;color:#ffffff;">
                <div style="font-size:28px;line-height:1.3;font-style:italic;margin-bottom:8px;">
                  "${escapeHtml(title)}"${postDate ? ` - ${escapeHtml(postDate)}` : ''}
                </div>
              </td>
            </tr>

            <!-- Hero Image -->
            ${
              hero
                ? `<tr>
              <td style="padding:0 32px 24px 32px;">
                <img src="${escapeHtml(hero)}" width="576" style="width:100%;max-width:576px;height:auto;display:block;border:0;" alt="${escapeHtml(title)}" />
              </td>
            </tr>`
                : ''
            }

            <!-- Divider -->
            <tr>
              <td style="padding:0 32px;height:1px;background:rgba(255,255,255,0.15);"></td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:32px 32px 24px 32px;font-family:Georgia, 'Times New Roman', serif;font-size:16px;line-height:1.7;color:rgba(242,242,242,0.88);">
                ${escapeHtml(snippet)}
              </td>
            </tr>

            <!-- Discover Project Link -->
            <tr>
              <td style="padding:0 32px 40px 32px;font-family:Georgia, 'Times New Roman', serif;">
                <a href="${escapeHtml(readUrl)}" style="font-size:15px;font-style:italic;color:rgba(242,242,242,0.85);text-decoration:none;border-bottom:1px solid rgba(242,242,242,0.85);">
                  discover project
                </a>
              </td>
            </tr>

            <!-- Footer Divider -->
            <tr>
              <td style="height:1px;background:rgba(255,255,255,0.08);"></td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:32px 32px;font-family:Georgia, 'Times New Roman', serif;text-align:center;color:rgba(242,242,242,0.75);font-size:13px;line-height:1.8;">
                <div style="margin-bottom:12px;">
                  © 2026 ${escapeHtml(SITE_CONFIG.author || 'STUDIO')}
                </div>
                <div style="font-size:12px;color:rgba(242,242,242,0.65);">
                  You're receiving this email because you are subscribed to ${escapeHtml(SITE_CONFIG.author || 'hanmassengo')}.com
                </div>
                <div style="margin-top:16px;">
                  <a href="${escapeHtml(unsubUrl)}" style="color:rgba(242,242,242,0.65);text-decoration:none;font-size:12px;">
                    Unsubscribe here
                  </a>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`,
  };
}
