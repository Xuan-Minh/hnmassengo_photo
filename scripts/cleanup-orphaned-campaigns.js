#!/usr/bin/env node

/**
 * Cleanup script: Remove orphaned newsletter campaigns
 * (campaigns pointing to non-existent posts)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env.local');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
  console.log('✅ Loaded environment variables from .env.local\n');
}

const { getSanityWriteClient } = await import('../lib/sanity.server.js');

async function cleanupOrphanedCampaigns() {
  const sanity = getSanityWriteClient();

  console.log('🔍 Fetching all newsletter campaigns...');
  const campaigns = await sanity.fetch(
    `*[_type == "newsletterCampaign"] {
      _id,
      _createdAt,
      status,
      post {
        _ref
      }
    }`
  );
  console.log(`📊 Total campaigns: ${campaigns.length}\n`);

  console.log('🔍 Fetching all valid blogPosts...');
  const blogPosts = await sanity.fetch(`*[_type == "blogPost"] {_id}`);
  console.log(`📊 Total blogPosts: ${blogPosts.length}\n`);

  const validPostIds = new Set(blogPosts.map(p => p._id));

  // Find orphaned campaigns
  const orphanedCampaigns = campaigns.filter(
    c => !validPostIds.has(c.post?._ref)
  );

  console.log(
    `⚠️  Orphaned campaigns (pointing to non-existent posts): ${orphanedCampaigns.length}`
  );
  const validCampaigns = campaigns.length - orphanedCampaigns.length;
  console.log(
    `✅ Valid campaigns (pointing to real posts): ${validCampaigns}\n`
  );

  if (orphanedCampaigns.length === 0) {
    console.log('✅ No orphaned campaigns found!');
    return;
  }

  console.log(
    `🗑️  Will delete ${orphanedCampaigns.length} orphaned campaigns\n`
  );

  // Delete in batches
  const batchSize = 100;
  let deletedCount = 0;

  for (let i = 0; i < orphanedCampaigns.length; i += batchSize) {
    const batch = orphanedCampaigns.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(orphanedCampaigns.length / batchSize);

    console.log(
      `🗑️  Deleting batch ${batchNum}/${totalBatches} (${batch.length} campaigns)...`
    );

    const mutations = batch.map(c => ({ delete: { id: c._id } }));

    try {
      await sanity.transaction(mutations).commit();
      deletedCount += batch.length;
      console.log(`   ✅ Deleted ${batch.length} campaigns`);
    } catch (err) {
      console.error(`   ❌ Error deleting batch: ${err.message}`);
    }
  }

  console.log(`\n✅ Successfully deleted ${deletedCount} orphaned campaigns!`);
  console.log(`📈 Remaining campaigns: ${validCampaigns}`);
}

cleanupOrphanedCampaigns().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
