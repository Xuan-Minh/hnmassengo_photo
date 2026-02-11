import { NextResponse } from 'next/server';
import { upsertNewsletterSubscriber } from '../../../../lib/newsletter/subscribe';

export const runtime = 'nodejs';

const RATE_LIMIT = 10; // max 10 req/10min/ip
const WINDOW_MS = 10 * 60 * 1000;
const ipHits = new Map();

function cleanupOldEntries() {
  const now = Date.now();
  for (const [ip, { first }] of ipHits.entries()) {
    if (now - first > WINDOW_MS) ipHits.delete(ip);
  }
}

export async function POST(request) {
  cleanupOldEntries();
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const entry = ipHits.get(ip) || { first: now, count: 0 };
  if (now - entry.first < WINDOW_MS && entry.count >= RATE_LIMIT) {
    return NextResponse.json(
      { success: false, message: 'Trop de requêtes, réessayez plus tard.' },
      { status: 429 }
    );
  }
  entry.count++;
  ipHits.set(ip, entry);

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

    return NextResponse.json({
      success: true,
      message: result.created
        ? 'Inscription enregistrée.'
        : 'Inscription mise à jour.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Erreur lors de l'inscription." },
      { status: 500 }
    );
  }
}
