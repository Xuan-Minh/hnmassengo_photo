import { NextResponse } from 'next/server';
import { getSanityWriteClient } from '../../../../lib/sanity.server';

export const runtime = 'nodejs';

export async function POST(request) {
  // Simple token auth (add to .env: ADMIN_TOKEN=your-secret-token)
  const adminToken = request.headers.get('authorization')?.replace('Bearer ', '');
  const expectedToken = process.env.ADMIN_TOKEN;

  if (!expectedToken || adminToken !== expectedToken) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const sanity = getSanityWriteClient();

    // Get all campaigns grouped by post
    const campaigns = await sanity.fetch(
      `*[_type == "newsletterCampaign"] {
        _id,
        _createdAt,
        post {
          _ref
        }
      } | sort(_createdAt asc)`
    );

    const campaignsByPost = {};
    campaigns.forEach(campaign => {
      const postRef = campaign.post?._ref;
      if (!postRef) return;
      if (!campaignsByPost[postRef]) {
        campaignsByPost[postRef] = [];
      }
      campaignsByPost[postRef].push(campaign);
    });

    // Find duplicates (keep first, delete rest)
    const toDelete = [];
    for (const postRef in campaignsByPost) {
      const postCampaigns = campaignsByPost[postRef];
      if (postCampaigns.length > 1) {
        // Keep first, delete rest
        const keep = postCampaigns[0];
        const removals = postCampaigns.slice(1);
        toDelete.push(...removals.map(c => c._id));
      }
    }

    if (toDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No duplicates found',
        deleted: 0,
      });
    }

    // Delete duplicates
    const mutations = toDelete.map(id => ({
      delete: { _id: id },
    }));

    await sanity.transaction().patch(...mutations);

    return NextResponse.json({
      success: true,
      message: `Deleted ${toDelete.length} duplicate campaigns`,
      deleted: toDelete.length,
      campaignIds: toDelete,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
