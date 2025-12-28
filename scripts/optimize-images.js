const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');

// Dossiers à optimiser
const directories = [
  'public/home',
  'public/loading',
  'public/icons'
];

async function optimizeImage(inputPath, outputPath) {
  const ext = path.extname(inputPath).toLowerCase();
  const filename = path.basename(inputPath, ext);

  try {
    if (ext === '.webp') {
      // Pour WebP existant, créer une version optimisée avec suffixe
      const optimizedPath = path.join(path.dirname(outputPath), `${filename}-optimized.webp`);
      await sharp(inputPath)
        .webp({ quality: 85, effort: 6 }) // effort: 6 pour meilleure compression
        .toFile(optimizedPath);

      // Remplacer l'original si la nouvelle version est plus petite
      const originalStats = fs.statSync(inputPath);
      const optimizedStats = fs.statSync(optimizedPath);

      if (optimizedStats.size < originalStats.size) {
        fs.renameSync(optimizedPath, inputPath);
        console.log(`✅ ${inputPath} optimisé: ${originalStats.size} → ${optimizedStats.size} bytes`);
      } else {
        fs.unlinkSync(optimizedPath); // Supprimer si pas plus petit
        console.log(`⏭️ ${inputPath} déjà optimisé`);
      }
    } else if (ext === '.jpg' || ext === '.jpeg') {
      // Convertir JPG en WebP
      const webpPath = path.join(path.dirname(outputPath), `${filename}.webp`);
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(webpPath);
      console.log(`✅ ${inputPath} → ${webpPath}`);
    } else if (ext === '.png') {
      // Convertir PNG en WebP
      const webpPath = path.join(path.dirname(outputPath), `${filename}.webp`);
      await sharp(inputPath)
        .webp({ quality: 90 })
        .toFile(webpPath);
      console.log(`✅ ${inputPath} → ${webpPath}`);
    }
  } catch (error) {
    console.error(`❌ Erreur avec ${inputPath}:`, error.message);
  }
}

async function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`📁 Dossier ${dirPath} n'existe pas, ignoré`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  const imageFiles = files.filter(file =>
    /\.(jpg|jpeg|png|webp)$/i.test(file)
  );

  console.log(`\n🔄 Traitement de ${imageFiles.length} images dans ${dirPath}`);

  for (const file of imageFiles) {
    const inputPath = path.join(dirPath, file);
    const outputPath = path.join(dirPath, file);

    // Obtenir les stats du fichier original
    const stats = fs.statSync(inputPath);
    const originalSize = stats.size;

    await optimizeImage(inputPath, outputPath);

    // Vérifier la nouvelle taille si le fichier existe
    if (fs.existsSync(outputPath)) {
      const newStats = fs.statSync(outputPath);
      const newSize = newStats.size;
      const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);
      console.log(`📊 ${file}: ${originalSize} → ${newSize} bytes (${reduction}% de réduction)`);
    }
  }
}

async function main() {
  console.log('🚀 Début de l\'optimisation des images...\n');

  for (const dir of directories) {
    await processDirectory(dir);
  }

  console.log('\n✨ Optimisation terminée !');
  console.log('\n💡 Toutes les nouvelles images seront automatiquement optimisées par Next.js');
  console.log('💡 Utilisez le composant Next.js <Image> pour bénéficier de l\'optimisation automatique');
}

main().catch(console.error);