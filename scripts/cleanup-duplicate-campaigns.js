#!/usr/bin/env node

/**
 * Cleanup script: Removes duplicate newsletter campaigns
 * Keeps only the oldest campaign per post, deletes all others
 *
 * Usage: node scripts/cleanup-duplicate-campaigns.js
 */

import { getSanityWriteClient } from '../lib/sanity.server.js';

async function cleanupDuplicateCampaigns() {
  const sanity = getSanityWriteClient();

  console.log('🔍 Fetching all newsletter campaigns...');

  const campaigns = await sanity.fetch(
    `*[_type == "newsletterCampaign"] | order(_createdAt asc) {
      _id,
      _createdAt,
      status,
      post {
        _ref
      }
    }`
  );

  console.log(`📊 Found ${campaigns.length} campaigns total\n`);

  // Group by post
  const campaignsByPost = {};
  campaigns.forEach(campaign => {
    const postRef = campaign.post?._ref;
    if (!postRef) return;
    if (!campaignsByPost[postRef]) {
      campaignsByPost[postRef] = [];
    }
    campaignsByPost[postRef].push(campaign);
  });

  // Find and delete duplicates
  let toDelete = [];
  for (const postRef in campaignsByPost) {
    const postCampaigns = campaignsByPost[postRef];
    if (postCampaigns.length > 1) {
      console.log(
        `⚠️  Post ${postRef}: ${postCampaigns.length} campaigns (keeping oldest)`
      );
      // Keep first (oldest), delete rest
      toDelete.push(...postCampaigns.slice(1).map(c => c._id));
    }
  }

  if (toDelete.length === 0) {
    console.log('✅ No duplicates found!');
    return;
  }

  console.log(`\n🗑️  Will delete ${toDelete.length} duplicate campaigns\n`);

  // Delete in batches
  const batchSize = 100;
  for (let i = 0; i < toDelete.length; i += batchSize) {
    const batch = toDelete.slice(i, i + batchSize);
    console.log(
      `Deleting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(toDelete.length / batchSize)} (${batch.length} items)...`
    );

    const mutations = batch.map(id => ({ delete: { id } }));
    await sanity.transaction(mutations).commit();
  }

  console.log(
    `\n✅ Successfully deleted ${toDelete.length} duplicate campaigns!`
  );
  console.log(`📈 Kept ${campaigns.length - toDelete.length} campaigns`);
}

cleanupDuplicateCampaigns().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
