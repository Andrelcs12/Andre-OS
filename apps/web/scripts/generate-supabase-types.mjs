import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";

const child = spawn(
  "npx",
  ["supabase", "gen", "types", "typescript", "--linked"],
  {
    cwd: process.cwd(),
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"],
  },
);

let output = "";
let errors = "";
child.stdout.on("data", (chunk) => {
  output += chunk;
});
child.stderr.on("data", (chunk) => {
  errors += chunk;
});

const exitCode = await new Promise((resolve, reject) => {
  child.on("error", reject);
  child.on("close", resolve);
});

if (exitCode !== 0 || !output.includes("export type Database")) {
  if (output.includes("ProjectNotLinkedError")) {
    throw new Error(
      "Projeto Supabase não vinculado. Vincule-o antes de executar npm run db:types.",
    );
  }
  throw new Error(
    errors ||
      output ||
      "Não foi possível gerar os tipos do Supabase. Vincule o projeto antes de executar db:types.",
  );
}

await writeFile(
  new URL("../src/types/database.generated.ts", import.meta.url),
  output,
);
console.log("Tipos do banco gerados em src/types/database.generated.ts.");
