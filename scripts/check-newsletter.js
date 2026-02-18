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

const { getSanityWriteClient } = await import('../lib/sanity.server.js');

async function diagnoseNewsletter() {
  const sanity = getSanityWriteClient();

  console.log('📬 Newsletter Diagnostic\n');

  // Fetch campaigns
  const campaigns = await sanity.fetch(`
    *[_type == "newsletterCampaign"] | order(_createdAt desc) {
      _id,
      _createdAt,
      status,
      sentAt,
      errorCount,
      lastError,
      subscriberCount,
      post -> {
        _id,
        title
      }
    }
  `);

  console.log(`📧 Campagnes (${campaigns.length}):`);
  campaigns.forEach((c, i) => {
    console.log(`
  ${i + 1}. ${c.post?.title?.fr || 'Sans titre'}
     Status: ${c.status}
     Subscribers sent: ${c.subscriberCount || 0}
     Errors: ${c.errorCount || 0}
     Last error: ${c.lastError || 'None'}
     Date: ${c._createdAt ? new Date(c._createdAt).toLocaleString('fr-FR') : 'N/A'}`);
  });

  // Fetch subscribers
  const subscribers = await sanity.fetch(`*[_type == "newsletterSubscriber"] {
    _id,
    email,
    locale,
    status,
    _createdAt
  }`);

  console.log(`\n👥 Abonnés (${subscribers.length}):`);
  const activeCount = subscribers.filter(s => s.status === 'active').length;
  
  subscribers.forEach(s => {
    const statusColor = s.status === 'active' ? '✅' : '❌';
    console.log(`  ${statusColor} ${s.email} (${s.status}, ${s.locale})`);
  });

  console.log(`\n📊 Résumé:`);
  console.log(`  Abonnés actifs: ${activeCount}/${subscribers.length}`);
  console.log(`  Campagnes envoyées: ${campaigns.filter(c => c.status === 'sent').length}`);
  console.log(`  Campagnes en erreur: ${campaigns.filter(c => c.status === 'error').length}`);
}

diagnoseNewsletter().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
