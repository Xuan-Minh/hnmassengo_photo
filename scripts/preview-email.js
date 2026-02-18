#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
}

import client from '../lib/sanity.client.js';
import { buildNewsletterEmail } from '../lib/newsletter/emailTemplate.js';

async function previewEmail() {
  console.log('📧 Fetching latest blog post for preview...\n');

  // Fetch latest blog post
  const post = await client.fetch(`
    *[_type == "blogPost"] | order(date desc)[0] {
      _id,
      title,
      texte,
      date,
      image {
        asset -> {
          url
        }
      }
    }
  `);

  if (!post?._id) {
    console.error('❌ No blog posts found');
    process.exit(1);
  }

  console.log(`✅ Found post: "${post.title?.fr || post.title}"\n`);

  // Generate email
  const { subject, html } = buildNewsletterEmail({
    locale: 'fr',
    post,
    siteUrl: 'https://hannoahmassengo.com',
    subscriberEmail: 'preview@example.com',
  });

  // Save to file
  const outputPath = path.resolve(__dirname, '..', 'newsletter-preview.html');
  fs.writeFileSync(outputPath, html);

  console.log(`📄 Preview saved to: newsletter-preview.html`);
  console.log(`📧 Subject: ${subject}\n`);
  console.log(`🌐 Open this file in your browser to preview:`);
  console.log(`   ${outputPath}`);
}

previewEmail().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
