import { registerHooks } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function resolveExistingFile(basePath) {
  for (const candidate of [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.mjs`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
  ]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return pathToFileURL(candidate).href;
    }
  }
  return null;
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "next/server" || specifier === "next/headers" || specifier === "next/navigation") {
      return nextResolve(`${specifier}.js`, context);
    }
    if (specifier.startsWith("@/")) {
      const resolved = resolveExistingFile(path.join(projectRoot, "src", specifier.slice(2)));
      if (resolved) return { shortCircuit: true, url: resolved };
    }
    if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      const resolved = resolveExistingFile(path.resolve(parentDir, specifier));
      if (resolved) return { shortCircuit: true, url: resolved };
    }
    return nextResolve(specifier, context);
  },
});
