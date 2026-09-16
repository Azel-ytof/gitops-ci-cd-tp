/**
 * Lance gitleaks : le binaire s'il est installé, sinon son image Docker.
 *   node tools/gitleaks.ts staged    → les fichiers indexés (hook pre-commit)
 *   node tools/gitleaks.ts history   → tout l'historique Git
 */
import { spawnSync } from "node:child_process";

const VERSION = "v8.30.1";
const what = process.argv[2] ?? "staged";
const args = what === "history" ? ["git", "--verbose", "--redact"] : ["git", "--staged", "--redact"];

const local = spawnSync("gitleaks", ["version"], { stdio: "ignore", shell: process.platform === "win32" });
let res: ReturnType<typeof spawnSync>;
if (local.status === 0) {
  res = spawnSync("gitleaks", [...args, "."], { stdio: "inherit", shell: process.platform === "win32" });
} else {
  // Le dépôt monté dans le conteneur n'appartient pas au même utilisateur : on autorise Git à le lire
  res = spawnSync(
    "docker",
    [
      "run",
      "--rm",
      "-v",
      `${process.cwd()}:/repo`,
      "-e",
      "GIT_CONFIG_COUNT=1",
      "-e",
      "GIT_CONFIG_KEY_0=safe.directory",
      "-e",
      "GIT_CONFIG_VALUE_0=*",
      `ghcr.io/gitleaks/gitleaks:${VERSION}`,
      ...args,
      "/repo",
    ],
    { stdio: "inherit" },
  );
}
if (res.error) {
  console.error("gitleaks introuvable : installez-le (https://github.com/gitleaks/gitleaks) ou lancez Docker Desktop.");
  process.exit(1);
}
process.exit(res.status ?? 1);
