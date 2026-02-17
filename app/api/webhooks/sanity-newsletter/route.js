import crypto from 'crypto';
import { NextResponse } from 'next/server';
import client from '../../../../lib/sanity.client';
import { getSanityWriteClient } from '../../../../lib/sanity.server';
import { buildNewsletterEmail } from '../../../../lib/newsletter/emailTemplate';
import { mapWithConcurrency } from '../../../../lib/newsletter/concurrency';

export const runtime = 'nodejs';

function timingSafeEqualString(a, b) {
  try {
    const ba = Buffer.from(String(a));
    const bb = Buffer.from(String(b));
    if (ba.length !== bb.length) return false;
    return crypto.timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

function verifySanitySignature({ rawBody, signatureHeader }) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  if (!secret) return { ok: false, reason: 'Missing SANITY_WEBHOOK_SECRET' };

  const header = String(signatureHeader || '').trim();
  if (!header) return { ok: false, reason: 'Missing signature header' };

  const provided = header.startsWith('sha256=')
    ? header.slice('sha256='.length)
    : header;
  const hex = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const base64 = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('base64');

  const ok =
    timingSafeEqualString(provided, hex) ||
    timingSafeEqualString(provided, base64) ||
    timingSafeEqualString(provided, `sha256=${hex}`) ||
    timingSafeEqualString(provided, `sha256=${base64}`);

  return ok ? { ok: true } : { ok: false, reason: 'Bad signature' };
}

function pickPostId(payload) {
  if (!payload) return null;
  if (payload._type === 'blogPost' && payload._id) return payload._id;
  if (payload._id) return payload._id;

  const ids = payload?.ids;
  if (Array.isArray(ids?.published) && ids.published[0])
    return ids.published[0];
  if (Array.isArray(ids?.created) && ids.created[0]) return ids.created[0];
  if (Array.isArray(ids?.updated) && ids.updated[0]) return ids.updated[0];

  if (payload?.documentId) return payload.documentId;
  if (payload?.document?._id) return payload.document._id;

  return null;
}

export async function POST(request) {
  const rawBody = await request.text();
  const signatureHeader =
    request.headers.get('x-sanity-signature') ||
    request.headers.get('X-Sanity-Signature');

  // TODO: Re-enable signature verification once Sanity webhook secret is properly configured
  // const verified = verifySanitySignature({ rawBody, signatureHeader });
  // if (!verified.ok) {
  //   return NextResponse.json(
  //     {
  //       success: false,
  //       message: 'Unauthorized webhook',
  //       reason: verified.reason,
  //     },
  //     { status: 401 }
  //   );
  // }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { success: false, message: 'Invalid JSON payload' },
      { status: 400 }
    );
  }

  console.log('Webhook payload:', JSON.stringify(payload, null, 2));
  const postId = pickPostId(payload);
  console.log('Extracted postId:', postId);

  if (!postId) {
    return NextResponse.json(
      { success: false, message: 'Missing blogPost id in webhook payload' },
      { status: 400 }
    );
  }

  const siteUrl = process.env.SITE_URL;
  if (!siteUrl) {
    return NextResponse.json(
      { success: false, message: 'Missing SITE_URL' },
      { status: 500 }
    );
  }

  const from = process.env.RESEND_FROM;
  const resendKey = process.env.RESEND_API_KEY;
  if (!from || !resendKey) {
    return NextResponse.json(
      { success: false, message: 'Missing RESEND_FROM or RESEND_API_KEY' },
      { status: 500 }
    );
  }

  const sanityWrite = getSanityWriteClient();

  // Wait for the post to be indexed in Sanity (sometimes there's a slight delay)
  let post = null;
  for (let i = 0; i < 5; i++) {
    try {
      post = await client.fetch('*[_id == $id][0]{_id}', { id: postId });
      if (post?._id) break;
      console.log(`Post not found yet (attempt ${i + 1}/5), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (e) {
      console.log('Error fetching post:', e);
    }
  }

  if (!post?._id) {
    console.error('Post could not be found after retries:', postId);
    return NextResponse.json(
      { success: false, message: 'Post not found after indexing wait' },
      { status: 404 }
    );
  }

  // Anti-duplication: une campagne par post
  const existingCampaign = await sanityWrite.fetch(
    '*[_type == "newsletterCampaign" && post._ref == $postId][0]{_id,status}',
    { postId }
  );
  if (existingCampaign?.status === 'sent') {
    return NextResponse.json({
      success: true,
      message: 'Already sent (skipped)',
    });
  }

  const campaignId = existingCampaign?._id;
  const campaignDocId =
    campaignId ||
    (
      await sanityWrite.create({
        _type: 'newsletterCampaign',
        post: { _type: 'reference', _ref: postId },
        status: 'sending',
      })
    )._id;

  try {
    const post = await client.fetch(
      '*[_id == $id][0]{_id, title, texte, date, image{asset->{url}}, layout}',
      { id: postId }
    );

    if (!post?._id) {
      await sanityWrite
        .patch(campaignDocId)
        .set({ status: 'error', lastError: `Post not found: ${postId}` })
        .commit();

      return NextResponse.json(
        { success: false, message: 'Post not found' },
        { status: 404 }
      );
    }

    const subscribers = await sanityWrite.fetch(
      '*[_type == "newsletterSubscriber" && status == "active"]{email, locale}',
      {}
    );

    const { Resend } = await import('resend');
    const resend = new Resend(resendKey);

    let errorCount = 0;

    await mapWithConcurrency(subscribers || [], 8, async sub => {
      const to = String(sub?.email || '').trim();
      if (!to) return;

      try {
        const { subject, html } = buildNewsletterEmail({
          locale: sub?.locale || 'fr',
          post,
          siteUrl,
          subscriberEmail: to,
        });

        await resend.emails.send({
          from,
          to,
          subject,
          html,
        });
      } catch (e) {
        errorCount++;
      }
    });

    await sanityWrite
      .patch(campaignDocId)
      .set({
        status: errorCount > 0 ? 'error' : 'sent',
        sentAt: new Date().toISOString(),
        subscriberCount: (subscribers || []).length,
        errorCount,
        lastError: errorCount > 0 ? 'Some emails failed to send.' : null,
      })
      .commit();

    return NextResponse.json({
      success: true,
      message: 'Newsletter processed',
      postId,
      subscriberCount: (subscribers || []).length,
      errorCount,
    });
  } catch (error) {
    await sanityWrite
      .patch(campaignDocId)
      .set({ status: 'error', lastError: String(error?.message || error) })
      .commit();

    return NextResponse.json(
      { success: false, message: 'Webhook failed' },
      { status: 500 }
    );
  }
}
