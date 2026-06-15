import { NextResponse } from 'next/server';
import { getSanityWriteClient } from '../../../../lib/sanity.server';
import { verifyUnsubscribeToken } from '../../../../lib/newsletter/unsubscribe';
import { logger } from '../../../../lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE =
  /^[^\s@<>()[\]\\.,;:"']+@[^\s@<>()[\]\\.,;:"']+\.[^\s@<>()[\]\\.,;:"']+$/;

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

// eslint-disable-next-line react-doctor/nextjs-no-side-effect-in-get-handler
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = normalizeEmail(searchParams.get('email'));
  const token = String(searchParams.get('token') || '');

  if (!email || !EMAIL_RE.test(email)) {
    return new NextResponse('Email invalide ou manquant', { status: 400 });
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return new NextResponse('Lien de désinscription invalide', { status: 401 });
  }

  // Renvoie un simple formulaire HTML qui fera un POST vers cette même URL
  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Confirmer la désinscription</title></head><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:28px;background:#0b0b0b;color:#f2f2f2;">
<h1 style="margin:0 0 10px 0;font-size:18px;">Désinscription de la newsletter</h1>
<p style="margin:0 0 20px 0;opacity:0.85;">Êtes-vous sûr de vouloir vous désinscrire avec l'adresse <strong>${email}</strong> ?</p>
<form method="POST" action="/api/newsletter/unsubscribe">
  <input type="hidden" name="email" value="${email}" />
  <input type="hidden" name="token" value="${token}" />
  <button type="submit" style="background:#f2f2f2;color:#0b0b0b;border:none;padding:10px 20px;font-size:16px;cursor:pointer;font-weight:600;border-radius:4px;">
    Confirmer la désinscription
  </button>
</form>
</body></html>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export async function POST(request) {
  let email = '';
  let token = '';

  try {
    const formData = await request.formData();
    email = normalizeEmail(formData.get('email'));
    token = String(formData.get('token') || '');
  } catch (e) {
    return new NextResponse('Requête invalide', { status: 400 });
  }

  if (!email || !EMAIL_RE.test(email)) {
    return new NextResponse('Email invalide ou manquant', { status: 400 });
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return new NextResponse('Lien de désinscription invalide', { status: 401 });
  }

  try {
    const sanity = getSanityWriteClient();

    // On cherche l'utilisateur dans Sanity
    const existing = await sanity.fetch(
      '*[_type == "newsletterSubscriber" && email == $email][0]{_id}',
      { email }
    );

    if (existing?._id) {
      await sanity
        .patch(existing._id)
        .set({ status: 'unsubscribed', updatedAt: new Date().toISOString() })
        .commit({ autoGenerateArrayKeys: true });
    } else {
      logger.error(
        `Désinscription échouée : l'email ${email} est introuvable dans Sanity.`
      );
      return new NextResponse(
        'Erreur : Email introuvable dans la base de données.',
        { status: 404 }
      );
    }

    return new NextResponse(
      `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Désinscription confirmée</title></head><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:28px;background:#0b0b0b;color:#f2f2f2;">
<h1 style="margin:0 0 10px 0;font-size:18px;">Vous êtes désinscrit.</h1>
<p style="margin:0;opacity:0.85;">Votre adresse ne recevra plus la newsletter.</p>
</body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (error) {
    logger.error('Erreur Sanity Unsubscribe:', error);
    return new NextResponse('Erreur serveur lors de la désinscription', {
      status: 500,
    });
  }
}
