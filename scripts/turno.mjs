#!/usr/bin/env node
// Corre un comando pesado (render de Remotion, whisper) esperando su turno: uno a la vez en toda la máquina.
// La PC tiene poca RAM libre; dos renders o un render + whisper a la vez la ahogan.
// Uso: node scripts/turno.mjs <comando> [args...]      ej: node scripts/turno.mjs npx remotion render ...
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error("Uso: node scripts/turno.mjs <comando> [args...]");
  process.exit(1);
}

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const LOCK = path.join(ROOT, "out", ".turno");
const OWNER = path.join(LOCK, "pid");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const vivo = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

const tomar = async () => {
  mkdirSync(path.dirname(LOCK), { recursive: true });
  let avisado = false;
  for (;;) {
    try {
      mkdirSync(LOCK);
      writeFileSync(OWNER, String(process.pid));
      return;
    } catch {
      let pid = NaN;
      try {
        pid = parseInt(readFileSync(OWNER, "utf8"), 10);
      } catch {}
      if (Number.isFinite(pid) && !vivo(pid)) {
        rmSync(LOCK, { recursive: true, force: true });
        continue;
      }
      if (!avisado) {
        console.error(`[turno] esperando: hay otro trabajo pesado corriendo (pid ${pid})`);
        avisado = true;
      }
      await sleep(1500);
    }
  }
};

const soltar = () => {
  try {
    if (parseInt(readFileSync(OWNER, "utf8"), 10) === process.pid) rmSync(LOCK, { recursive: true, force: true });
  } catch {}
};

await tomar();
process.on("exit", soltar);
process.on("SIGINT", () => process.exit(130));
process.on("SIGTERM", () => process.exit(143));

const citar = (a) => (/[\s"&|<>^()]/.test(a) ? `"${a.replace(/"/g, '\\"')}"` : a);
const child = spawn([cmd, ...args].map(citar).join(" "), { stdio: "inherit", shell: true });
child.on("close", (code) => process.exit(code ?? 1));
