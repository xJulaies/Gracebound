import { settings } from "../config/settings";
import { connectMongoDB, disconnectMongoDB } from "../db";
import { auditIconCoverage } from "../infrastructure/icons/auditIconCoverage";

async function runIconAudit() {
  await connectMongoDB();
  try {
    const report = await auditIconCoverage(settings.SUPPORTED_GAME_VERSION);
    console.log(`Catalog icon IDs: ${report.catalogIconIds}`);
    console.log(`Stored icon IDs: ${report.storedIconIds}`);

    if (report.missingIconIds.length > 0) {
      throw new Error(`Missing icon IDs: ${report.missingIconIds.join(", ")}`);
    }

    if (report.orphanedIconIds.length > 0) {
      console.warn(`Orphaned icon IDs: ${report.orphanedIconIds.join(", ")}`);
    }

    console.log("Icon coverage is complete");
  } finally {
    await disconnectMongoDB();
  }
}

void runIconAudit().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error(`Icon asset audit failed: ${message}`);
  process.exitCode = 1;
});
