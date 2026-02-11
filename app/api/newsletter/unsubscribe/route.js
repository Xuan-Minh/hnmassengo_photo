import { NextResponse } from 'next/server';
import { getSanityWriteClient } from '../../../../lib/sanity.server';
import { verifyUnsubscribeToken } from '../../../../lib/newsletter/unsubscribe';

export const runtime = 'nodejs';

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = normalizeEmail(searchParams.get('email'));
  const token = String(searchParams.get('token') || '');

  if (!email) {
    return new NextResponse('Email manquant', { status: 400 });
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return new NextResponse('Lien de désinscription invalide', { status: 401 });
  }

  try {
    const sanity = getSanityWriteClient();
    const existing = await sanity.fetch(
      '*[_type == "newsletterSubscriber" && email == $email][0]{_id}',
      { email }
    );

    if (existing?._id) {
      await sanity
        .patch(existing._id)
        .set({ status: 'unsubscribed', updatedAt: new Date().toISOString() })
        .commit({ autoGenerateArrayKeys: true });
    }

    // Page ultra-simple (pas de dépendance front) - tu peux la styliser ensuite
    return new NextResponse(
      `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Désinscription</title></head><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:28px;background:#0b0b0b;color:#f2f2f2;">
<h1 style="margin:0 0 10px 0;font-size:18px;">Vous êtes désinscrit.</h1>
<p style="margin:0;opacity:0.85;">${email}</p>
</body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch {
    return new NextResponse('Erreur lors de la désinscription', {
      status: 500,
    });
  }
}
