import { SITE_CONFIG } from '../constants.js';
import { getUnsubscribeToken } from './unsubscribe.js';

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildNewsletterEmail({
  locale = 'en',
  post,
  siteUrl,
  subscriberEmail,
}) {
  const safeLocale = ['fr', 'en', 'de'].includes(locale) ? locale : 'en';
  const title =
    post?.title?.[safeLocale] ||
    post?.title?.en ||
    post?.title ||
    'New post';
  const rawText =
    post?.texte?.[safeLocale] || post?.texte?.en || post?.text || '';

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

  // Format date (ex: "12 Oct 2026")
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

  // Email HTML matching site design (dark theme with Playfair + Lexend)
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
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital@0;1&family=Lexend:wght@400;500&display=swap');
    </style>
  </head>
  <body style="margin:0;padding:0;background:#0f0f0f;font-family:'Lexend', -apple-system, BlinkMacSystemFont, sans-serif;color:#f0f0f0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#0f0f0f;">
      <tr>
        <td align="center" style="padding:48px 16px;">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" border="0" style="width:640px;max-width:100%;background:#1a1a1a;border:1px solid rgba(255,255,255,0.05);">
            <!-- Header with Author -->
            <tr>
              <td style="padding:40px 32px 32px;border-bottom:1px solid rgba(255,255,255,0.08);text-align:center;">
                <div style="margin-bottom:12px;">
                  <a href="${escapeHtml(canonicalSiteUrl)}" style="font-family:'Lexend', sans-serif;font-size:11px;letter-spacing:0.08em;text-transform:uppercase;color:rgba(255,255,255,0.5);text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.3);">
                    View in browser
                  </a>
                </div>
                <div style="font-family:'Playfair Display', serif;font-size:36px;font-style:italic;font-weight:normal;color:#ffffff;line-height:1;letter-spacing:-0.02em;">
                  ${escapeHtml(SITE_CONFIG.author || 'HAN-NOAH MASSENGO')}
                </div>
              </td>
            </tr>

            <!-- Title with Date -->
            <tr>
              <td style="padding:32px 32px 0;">
                <div style="font-family:'Playfair Display', serif;font-size:24px;font-style:italic;font-weight:normal;line-height:1.2;color:#ffffff;margin-bottom:8px;letter-spacing:-0.01em;">
                  "${escapeHtml(title)}"
                </div>
                ${postDate ? `<div style="font-family:'Lexend', sans-serif;font-size:11px;color:rgba(255,255,255,0.45);letter-spacing:0.05em;text-transform:uppercase;">— ${escapeHtml(postDate)}</div>` : ''}
              </td>
            </tr>

            <!-- Hero Image -->
            ${
              hero
                ? `<tr>
              <td style="padding:24px 32px;">
                <img src="${escapeHtml(hero)}" width="576" style="width:100%;max-width:576px;height:auto;display:block;border:0;" alt="${escapeHtml(title)}" />
              </td>
            </tr>`
                : ''
            }

            <!-- Divider -->
            <tr>
              <td style="padding:0 32px;height:1px;background:rgba(255,255,255,0.08);"></td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:32px 32px 24px;font-family:'Lexend', sans-serif;font-size:14px;line-height:1.7;color:rgba(255,255,255,0.85);font-weight:400;">
                ${escapeHtml(snippet)}
              </td>
            </tr>

            <!-- Discover Project Link -->
            <tr>
              <td style="padding:0 32px 40px;">
                <a href="${escapeHtml(readUrl)}" style="font-family:'Playfair Display', serif;font-size:13px;font-style:italic;color:rgba(255,255,255,0.9);text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.3);padding-bottom:2px;display:inline-block;transition:all 0.2s;font-weight:normal;">
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
              <td style="padding:32px;font-family:'Lexend', sans-serif;text-align:center;color:rgba(255,255,255,0.6);font-size:11px;line-height:1.8;font-weight:400;">
                <div style="margin-bottom:12px;color:rgba(255,255,255,0.9);font-weight:500;">
                  © 2026 ${escapeHtml(SITE_CONFIG.author || 'STUDIO')}
                </div>
                <div style="margin-bottom:16px;color:rgba(255,255,255,0.55);">
                  You're receiving this email because you subscribed to ${escapeHtml(SITE_CONFIG.author || 'hanmassengo')}.com
                </div>
                <a href="${escapeHtml(unsubUrl)}" style="font-family:'Lexend', sans-serif;font-size:11px;color:rgba(255,255,255,0.5);text-decoration:none;border-bottom:1px solid rgba(255,255,255,0.2);">
                  Unsubscribe
                </a>
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
