/**
 * Mesure le poids de ce que le pipeline produit et livre.
 *   node tools/weight.ts [image Docker] [poids maximal de l'image, en Mo]
 * Écrit un tableau dans le résumé du job GitHub Actions (et dans la console).
 * Avec un poids maximal, la commande échoue si l'image est plus lourde : c'est un budget.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

function size(p: string): number {
  if (!existsSync(p)) return 0;
  const s = statSync(p);
  if (!s.isDirectory()) return s.size;
  return readdirSync(p).reduce((total, name) => total + size(path.join(p, name)), 0);
}

function readable(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(2)} Go`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} Mo`;
  return `${(bytes / 1e3).toFixed(0)} ko`;
}

const rows: [string, number][] = [
  ["Code compilé (dist/)", size("dist")],
  ["Fichiers du site (public/)", size("public")],
  ["dont images (public/images/)", size(path.join("public", "images"))],
  ["Dépendances (node_modules/)", size("node_modules")],
];

const [image, maxMb] = process.argv.slice(2);
let imageBytes = 0;
if (image) {
  imageBytes = Number(
    execFileSync("docker", ["image", "inspect", image, "--format", "{{.Size}}"], { encoding: "utf8" }).trim(),
  );
  rows.push([`Image Docker ${image}`, imageBytes]);
}

const report = [
  "### Poids des artefacts",
  "",
  "| Élément | Poids |",
  "|---|---:|",
  ...rows.map(([name, bytes]) => `| ${name} | ${readable(bytes)} |`),
  "",
].join("\n");
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);

if (image && maxMb && imageBytes > Number(maxMb) * 1e6) {
  console.error(`❌ Budget dépassé : l'image pèse ${readable(imageBytes)}, le maximum est de ${maxMb} Mo.`);
  process.exit(1);
}
if (image && maxMb) console.log(`✅ Budget tenu : ${readable(imageBytes)} pour ${maxMb} Mo au maximum.`);
