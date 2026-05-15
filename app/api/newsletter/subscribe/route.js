import { NextResponse } from 'next/server';
import { upsertNewsletterSubscriber } from '../../../../lib/newsletter/subscribe';
import { checkRateLimit, getClientIp } from '../../../../lib/rateLimit';

export const runtime = 'nodejs';

const RATE_LIMIT = 10; // max 10 req/10min/ip
const WINDOW_MS = 10 * 60 * 1000;

export async function POST(request) {
  const ip = getClientIp(request);
  const { allowed, remaining, resetTime } = checkRateLimit({
    key: 'newsletter-subscribe',
    identifier: ip,
    limit: RATE_LIMIT,
    windowMs: WINDOW_MS,
  });

  if (!allowed) {
    return NextResponse.json(
      { success: false, message: 'Trop de requêtes, réessayez plus tard.' },
      {
        status: 429,
        headers: {
          'x-rate-limit-limit': String(RATE_LIMIT),
          'x-rate-limit-remaining': '0',
          'x-rate-limit-reset': String(resetTime),
          'retry-after': String(Math.ceil((resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  try {
    const body = await request.json();
    const locale = ['fr', 'en', 'de'].includes(body?.locale)
      ? body.locale
      : 'fr';
    const source = body?.source
      ? String(body.source).slice(0, 40)
      : 'standalone';

    const result = await upsertNewsletterSubscriber({
      email: body?.email,
      locale,
      source,
    });

    if (!result.ok) {
      return NextResponse.json(
        { success: false, message: 'Une adresse email valide est requise.' },
        { status: 400 }
      );
      }

      return NextResponse.json(
        {
          success: true,
          message: result.created
            ? 'Inscription enregistrée.'
            : 'Inscription mise à jour.',
        },
        {
          headers: {
            'x-rate-limit-limit': String(RATE_LIMIT),
            'x-rate-limit-remaining': String(remaining),
            'x-rate-limit-reset': String(resetTime),
          },
        }
      );
  } catch {
    return NextResponse.json(
      { success: false, message: "Erreur lors de l'inscription." },
      { status: 500 }
    );
  }
}
