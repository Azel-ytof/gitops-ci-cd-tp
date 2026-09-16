/**
 * Analyse les en-têtes HTTP de sécurité avec le scanner de Mozilla Observatory (MDN HTTP Observatory).
 *   node tools/observatory.ts [hôte:port] [score minimal]
 * L'hôte doit avoir un domaine : on utilise circuitcourt.localhost, qui désigne votre propre machine.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync, existsSync } from "node:fs";
import path from "node:path";

const host = process.argv[2] ?? "circuitcourt.localhost:3000";
const minimum = Number(process.argv[3] ?? 0);
const pkg = path.join("node_modules", "@mdn", "mdn-http-observatory");
const win = process.platform === "win32";

// Le scanner a besoin de deux listes téléchargées à l'installation (étape parfois bloquée par npm)
if (!existsSync(path.join(pkg, "conf", "hsts-preload.json"))) {
  spawnSync("npm", ["run", "postinstall"], { cwd: pkg, stdio: "inherit", shell: win });
}

const output = execFileSync(
  path.join("node_modules", ".bin", win ? "mdn-http-observatory-scan.cmd" : "mdn-http-observatory-scan"),
  [host],
  {
    encoding: "utf8",
    shell: win,
  },
);
const result = JSON.parse(output);
if (result.error) {
  console.error(`Analyse impossible : ${result.error}`);
  process.exit(1);
}

const { grade, score } = result.scan;
const failures = Object.entries(
  result.tests as Record<string, { pass: boolean; result: string; scoreModifier: number }>,
)
  .filter(([, t]) => !t.pass)
  .map(([name, t]) => `| ${name} | ${t.result} | ${t.scoreModifier} |`);

const report = [
  `### Mozilla Observatory : ${grade} (${score}/100)`,
  "",
  `Hôte analysé : ${host}. Score minimal demandé : ${minimum}.`,
  "",
  "| Test échoué | Résultat | Points |",
  "|---|---|---|",
  ...failures,
  "",
].join("\n");
console.log(report);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, report);

if (score < minimum) {
  console.error(`Score ${score} inférieur au minimum ${minimum}`);
  process.exit(1);
}
