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

async function diagnose() {
  const sanity = getSanityWriteClient();

  const [campaignsResult, postsResult] = await Promise.all([
    sanity.fetch(`*[_type == "newsletterCampaign"]`),
    sanity.fetch(`*[_type == "blogPost"]`)
  ]);

  const campaigns = campaignsResult || [];
  const posts = postsResult || [];
  const validPostIds = new Set(posts.map(p => p._id));
  const orphaned = campaigns.filter(c => !validPostIds.has(c.post?._ref)).length;

  console.log(`
📊 Sanity Campaigns Status
━━━━━━━━━━━━━━━━━━━━━━━━━
Total campaigns: ${campaigns.length}
Total blogPosts: ${posts.length}
Orphaned campaigns: ${orphaned}
Valid campaigns: ${campaigns.length - orphaned}
`);

  if (campaigns.length <= 10000) {
    console.log('✅ Under 10k document limit');
  } else {
    console.log(`⚠️  Over 10k limit by ${campaigns.length - 10000} documents`);
  }
}

diagnose().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
