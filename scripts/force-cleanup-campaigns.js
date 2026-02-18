#!/usr/bin/env node

/**
 * Force cleanup: Remove references first, then delete orphaned campaigns
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

async function forceCleanupCampaigns() {
  const sanity = getSanityWriteClient();

  console.log('🔍 Fetching all newsletter campaigns...');
  const campaigns = await sanity.fetch(
    `*[_type == "newsletterCampaign"] {
      _id,
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

  console.log(`⚠️  Orphaned campaigns: ${orphanedCampaigns.length}`);
  const validCampaigns = campaigns.length - orphanedCampaigns.length;
  console.log(`✅ Valid campaigns: ${validCampaigns}\n`);

  if (orphanedCampaigns.length === 0) {
    console.log('✅ No orphaned campaigns found!');
    return;
  }

  // Step 1: Remove references in orphaned campaigns
  console.log(`\n📝 Step 1: Clearing references in orphaned campaigns...`);
  const batchSize = 50;
  let clearedCount = 0;

  for (let i = 0; i < orphanedCampaigns.length; i += batchSize) {
    const batch = orphanedCampaigns.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(orphanedCampaigns.length / batchSize);

    console.log(
      `   Batch ${batchNum}/${totalBatches}: Clearing references from ${batch.length} campaigns...`
    );

    const mutations = batch.map(c => ({
      patch: {
        id: c._id,
        unset: ['post'], // Remove the reference
      },
    }));

    try {
      await sanity.transaction(mutations).commit();
      clearedCount += batch.length;
      console.log(`   ✅ Cleared ${batch.length} references`);
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
    }
  }

  console.log(`\n✅ Cleared references from ${clearedCount} campaigns\n`);

  // Step 2: Delete the orphaned campaigns
  console.log(
    `🗑️  Step 2: Deleting ${orphanedCampaigns.length} orphaned campaigns...`
  );
  let deletedCount = 0;

  for (let i = 0; i < orphanedCampaigns.length; i += batchSize) {
    const batch = orphanedCampaigns.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(orphanedCampaigns.length / batchSize);

    console.log(
      `   Batch ${batchNum}/${totalBatches}: Deleting ${batch.length} campaigns...`
    );

    const mutations = batch.map(c => ({ delete: { id: c._id } }));

    try {
      await sanity.transaction(mutations).commit();
      deletedCount += batch.length;
      console.log(`   ✅ Deleted ${batch.length} campaigns`);
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
    }
  }

  console.log(`\n✅ Successfully deleted ${deletedCount} orphaned campaigns!`);
  console.log(`📈 Remaining campaigns: ${validCampaigns}`);
}

forceCleanupCampaigns().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
