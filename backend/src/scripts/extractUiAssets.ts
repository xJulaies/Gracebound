import path from "node:path";
import { extractUiAssets } from "../infrastructure/uiAssets/extractUiAssets";

async function run() {
  const rawDirectory = requiredArgument("--raw");
  const outputDirectory = requiredArgument("--output");
  const report = await extractUiAssets({
    layoutDirectory: path.join(rawDirectory, "01_common-sblytbnd-dcx"),
    textureDirectory: path.join(rawDirectory, "01_common-tpf-dcx"),
    outputDirectory,
    texconvPath: requiredArgument("--texconv"),
  });
  console.log(`Extracted UI assets: ${report.extracted}`);
  console.log(`WebP storage: ${(report.totalBytes / 1024).toFixed(1)} KiB`);
}

function requiredArgument(name: string): string {
  const index = process.argv.indexOf(name);
  const value = process.argv[index + 1];
  if (index === -1 || !value || value.startsWith("--")) {
    throw new Error(`Missing required argument ${name}`);
  }
  return path.resolve(value);
}

void run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`UI asset extraction failed: ${message}`);
  process.exitCode = 1;
});
