/**
 * scripts/process-images.mjs
 *
 * Traitement des photos brutes pour Lichen — Bois.
 * Lit assets-src/** / *.{png,jpg,jpeg}, redimensionne à 1200 px max,
 * convertit en WebP qualité 80 en conservant la transparence,
 * et écrit dans public/img/ en gardant l'arborescence.
 *
 * Usage : pnpm images
 */

import { createReadStream } from 'node:fs'
import { readdir, mkdir, stat } from 'node:fs/promises'
import { join, relative, dirname, extname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const SRC_DIR = join(ROOT, 'assets-src')
const OUT_DIR = join(ROOT, 'public', 'img')
const MAX_SIZE = 1200
const WEBP_QUALITY = 80
const EXTENSIONS = new Set(['.png', '.jpg', '.jpeg'])

/**
 * Parcourt récursivement un répertoire et retourne tous les fichiers.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function listFiles(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return []
  }

  const files = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await listFiles(full)))
    } else if (entry.isFile() && EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      files.push(full)
    }
  }
  return files
}

/**
 * Traite un fichier image et l'écrit en WebP dans public/img/.
 * @param {string} srcPath Chemin absolu de la source.
 */
async function processImage(srcPath) {
  const relPath = relative(SRC_DIR, srcPath)
  const relDir = dirname(relPath)
  const outDir = join(OUT_DIR, relDir)
  const outName = basename(relPath, extname(relPath)) + '.webp'
  const outPath = join(outDir, outName)

  await mkdir(outDir, { recursive: true })

  await sharp(srcPath)
    .resize({ width: MAX_SIZE, height: MAX_SIZE, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, lossless: false })
    .toFile(outPath)

  const srcStat = await stat(srcPath)
  const outStat = await stat(outPath)
  const ratio = Math.round((outStat.size / srcStat.size) * 100)
  console.log(`  ${relPath} → img/${relDir}/${outName} (${ratio}% de la source)`)
}

async function main() {
  console.log('Traitement des photos (assets-src → public/img)…')
  const files = await listFiles(SRC_DIR)

  if (files.length === 0) {
    console.log('Aucune image trouvée dans assets-src/. Dossier absent ou vide.')
    console.log('Crée le dossier et dépose tes photos (.png, .jpg, .jpeg) pour les traiter.')
    return
  }

  for (const file of files) {
    await processImage(file)
  }

  console.log(`\n${files.length} image(s) traitée(s) et écrites dans public/img/.`)
  console.log('Déclare les chemins dans src/data/essences.ts (champ photos de chaque essence).')
}

main().catch((err) => {
  console.error('Erreur :', err)
  process.exit(1)
})
