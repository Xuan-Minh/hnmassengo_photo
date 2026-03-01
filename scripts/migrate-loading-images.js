#!/usr/bin/env node

/**
 * Migration script: Transform loadingImage documents into
 * loadingImageDesktop or loadingImageMobile based on portraitOnly field.
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

async function migrateLoadingImages() {
  const sanity = getSanityWriteClient();

  console.log('🔍 Fetching old loadingImage documents...');
  const oldImages = await sanity.fetch(`
    *[_type == "loadingImage"] {
      _id,
      image,
      alt,
      order,
      portraitOnly
    }
  `);
  console.log(`📊 Found ${oldImages.length} images to migrate\n`);

  if (oldImages.length === 0) {
    console.log('✅ No loadingImage documents found. Nothing to migrate!');
    return;
  }

  console.log('📦 Migrating images...');

  let desktopCount = 0;
  let mobileCount = 0;
  let migratedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < oldImages.length; i++) {
    const image = oldImages[i];
    const newType = image.portraitOnly
      ? 'loadingImageMobile'
      : 'loadingImageDesktop';
    const typeLabel = image.portraitOnly ? 'mobile' : 'desktop';

    try {
      await sanity
        .transaction([
          {
            createOrReplace: {
              _id: `${image._id}-migrated`,
              _type: newType,
              image: image.image,
              alt: image.alt,
              order: image.order,
            },
          },
          {
            delete: { id: image._id },
          },
        ])
        .commit();

      if (image.portraitOnly) {
        mobileCount++;
      } else {
        desktopCount++;
      }
      migratedCount++;

      console.log(
        `   ✅ Migrated image ${i + 1}/${oldImages.length} (${typeLabel})`
      );
    } catch (err) {
      errorCount++;
      console.error(
        `   ❌ Error migrating image ${i + 1}/${oldImages.length} (${image._id}): ${err.message}`
      );
    }
  }

  console.log('\n✅ Migration completed!');
  console.log(`📈 Created ${desktopCount} desktop images`);
  console.log(`📈 Created ${mobileCount} mobile images`);
  console.log(`🗑️  Deleted ${migratedCount} old loadingImage documents`);

  if (errorCount > 0) {
    console.log(`\n⚠️  ${errorCount} image(s) failed to migrate`);
  }
}

migrateLoadingImages().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
