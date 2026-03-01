#!/usr/bin/env node

// Chargement manuel du .env.local AVANT tout import lié à Sanity
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

import { getSanityWriteClient } from '../lib/sanity.server.js';

/**
 * Script pour ré-attribuer les valeurs order séquentielles aux images loadingImageDesktop et loadingImageMobile dans Sanity.
 */

async function reindexLoadingImages() {
  const sanity = getSanityWriteClient();

  // Récupère toutes les images desktop
  const desktopImages =
    await sanity.fetch(`*[_type == "loadingImageDesktop"] | order(order asc) {
    _id,
    order
  }`);
  // Récupère toutes les images mobile
  const mobileImages =
    await sanity.fetch(`*[_type == "loadingImageMobile"] | order(order asc) {
    _id,
    order
  }`);

  // Ré-attribution séquentielle
  const desktopUpdates = desktopImages.map((img, idx) => ({
    patch: {
      id: img._id,
      set: { order: idx + 1 },
    },
  }));
  const mobileUpdates = mobileImages.map((img, idx) => ({
    patch: {
      id: img._id,
      set: { order: idx + 1 },
    },
  }));

  // Applique les patchs
  const allUpdates = [...desktopUpdates, ...mobileUpdates];
  if (allUpdates.length === 0) {
    console.log('Aucune image à mettre à jour.');
    return;
  }

  try {
    await sanity.transaction(allUpdates).commit();
    console.log(
      `✅ Mise à jour terminée : ${allUpdates.length} images ré-indexées.`
    );
  } catch (err) {
    console.error('❌ Erreur lors de la mise à jour :', err.message);
  }
}

reindexLoadingImages();
