import { NextResponse } from 'next/server';
import { logger } from '../../../lib/logger';
import { upsertNewsletterSubscriber } from '../../../lib/newsletter/subscribe';

// Rate limiting via HTTP headers (Netlify preserves these across requests)
const RATE_LIMIT = 5; // max 5 req/10min/ip
const WINDOW_MS = 10 * 60 * 1000;

function checkRateLimit(request) {
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown';

  // In production with Netlify Edge Functions, use request context
  // For now, use X-Rate-Limit headers (set by Netlify Functions)
  const remaining = parseInt(
    request.headers.get('x-rate-limit-remaining') || RATE_LIMIT
  );
  const resetTime = parseInt(
    request.headers.get('x-rate-limit-reset') || Date.now() + WINDOW_MS
  );

  return {
    ip,
    allowed: remaining > 0,
    remaining: Math.max(0, remaining - 1),
    resetTime,
  };
}

export async function POST(request) {
  try {
    const { ip, allowed, remaining, resetTime } = checkRateLimit(request);

    // Rate limit check
    if (!allowed) {
      const response = NextResponse.json(
        { success: false, message: 'Trop de requêtes, réessayez plus tard.' },
        { status: 429 }
      );
      // Add rate limit headers for next requests
      response.headers.set('x-rate-limit-remaining', '0');
      response.headers.set('x-rate-limit-reset', resetTime.toString());
      response.headers.set(
        'retry-after',
        Math.ceil((resetTime - Date.now()) / 1000).toString()
      );
      return response;
    }

    const { fullName, email, subject, message, newsletterOptIn, locale } =
      await request.json();

    // Validation côté serveur
    const errors = [];
    if (!fullName || fullName.trim().length < 2) {
      errors.push('Le nom complet est requis (au moins 2 caractères).');
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Une adresse email valide est requise.');
    }
    if (!message || message.trim().length < 10) {
      errors.push('Le message est requis (au moins 10 caractères).');
    }
    if (subject && subject.length > 100) {
      errors.push('Le sujet ne peut pas dépasser 100 caractères.');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Erreurs de validation', errors },
        { status: 400 }
      );
    }

    // Option newsletter (ne doit jamais bloquer le formulaire de contact)
    if (newsletterOptIn) {
      try {
        await upsertNewsletterSubscriber({
          email,
          locale,
          source: 'contact-form',
        });
      } catch (e) {
        logger.warn('Newsletter opt-in failed:', e);
      }
    }

    // Ici, la validation est faite, mais l'envoi sera géré par Netlify
    const response = NextResponse.json(
      { success: true, message: 'Validation réussie, envoi en cours...' },
      { status: 200 }
    );

    // Add rate limit headers for next requests
    response.headers.set('x-rate-limit-remaining', remaining.toString());
    response.headers.set('x-rate-limit-reset', resetTime.toString());

    return response;
  } catch (error) {
    logger.error('API Contact Error:', error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
