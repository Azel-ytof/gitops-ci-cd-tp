/**
 * Convertit les images PNG de public/images en WebP, à la taille où elles sont affichées.
 *   node tools/images.ts [width en pixels] [qualité de 1 à 100]
 * Les PNG d'origine sont conservés : à vous de mettre à jour les références, puis de les supprimer.
 */
import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const width = Number(process.argv[2] ?? 480);
const quality = Number(process.argv[3] ?? 70);
const folder = path.join("public", "images");

let before = 0;
let after = 0;
for (const name of readdirSync(folder).filter((n) => n.endsWith(".png"))) {
  const source = path.join(folder, name);
  const target = source.replace(/\.png$/, ".webp");
  await sharp(source).resize({ width }).webp({ quality }).toFile(target);
  const [a, b] = [statSync(source).size, statSync(target).size];
  before += a;
  after += b;
  console.log(`${name} : ${(a / 1e3).toFixed(0)} ko → ${path.basename(target)} : ${(b / 1e3).toFixed(0)} ko`);
}
console.log(`Total : ${(before / 1e6).toFixed(2)} Mo → ${(after / 1e6).toFixed(2)} Mo`);
