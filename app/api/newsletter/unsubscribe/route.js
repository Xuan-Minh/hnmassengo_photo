import { NextResponse } from 'next/server';
import { getSanityWriteClient } from '../../../../lib/sanity.server';
import { verifyUnsubscribeToken } from '../../../../lib/newsletter/unsubscribe';

export const runtime = 'nodejs';
// LA LIGNE MAGIQUE : Interdit la mise en cache de cette route API
export const dynamic = 'force-dynamic';

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

    // On cherche l'utilisateur dans Sanity
    const existing = await sanity.fetch(
      '*[_type == "newsletterSubscriber" && email == $email][0]{_id}',
      { email }
    );

    if (existing?._id) {
      // On met à jour son statut
      await sanity
        .patch(existing._id)
        .set({ status: 'unsubscribed', updatedAt: new Date().toISOString() })
        .commit({ autoGenerateArrayKeys: true });
    } else {
      // Pour le debug : si l'email n'est pas trouvé dans Sanity
      console.error(
        `Désinscription échouée : l'email ${email} est introuvable dans Sanity.`
      );
      return new NextResponse(
        'Erreur : Email introuvable dans la base de données.',
        { status: 404 }
      );
    }

    return new NextResponse(
      `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Désinscription</title></head><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:28px;background:#0b0b0b;color:#f2f2f2;">
<h1 style="margin:0 0 10px 0;font-size:18px;">Vous êtes désinscrit.</h1>
<p style="margin:0;opacity:0.85;">${email}</p>
</body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (error) {
    console.error('Erreur Sanity Unsubscribe:', error);
    return new NextResponse('Erreur serveur lors de la désinscription', {
      status: 500,
    });
  }
}
