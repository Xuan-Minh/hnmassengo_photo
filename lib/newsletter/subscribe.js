import { getSanityWriteClient } from '../sanity.server';

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function upsertNewsletterSubscriber({
  email,
  locale = 'fr',
  source = 'unknown',
}) {
  const normalizedEmail = normalizeEmail(email);
  const safeLocale = ['fr', 'en', 'de'].includes(locale) ? locale : 'fr';
  const safeSource = source ? String(source).slice(0, 40) : 'unknown';

  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return { ok: false, error: 'invalid_email' };
  }

  const sanity = getSanityWriteClient();
  const existing = await sanity.fetch(
    '*[_type == "newsletterSubscriber" && email == $email][0]{_id,status}',
    { email: normalizedEmail }
  );

  const nowIso = new Date().toISOString();

  if (existing?._id) {
    await sanity
      .patch(existing._id)
      .set({
        status: 'active',
        locale: safeLocale,
        source: safeSource,
        updatedAt: nowIso,
      })
      .commit({ autoGenerateArrayKeys: true });

    return { ok: true, created: false, id: existing._id };
  }

  const created = await sanity.create({
    _type: 'newsletterSubscriber',
    email: normalizedEmail,
    locale: safeLocale,
    status: 'active',
    source: safeSource,
    createdAt: nowIso,
    updatedAt: nowIso,
  });

  return { ok: true, created: true, id: created?._id };
}
