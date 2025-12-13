/**
 * Export OpenAPI specification from running API server
 *
 * This script fetches the OpenAPI JSON from the running NestJS API
 * and saves it to openapi.json in the api-client package.
 *
 * Prerequisites:
 * - API server must be running (default: http://localhost:5000)
 *
 * Usage:
 *   npm run export-openapi
 *   API_URL=http://localhost:3000 npm run export-openapi
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.API_URL || "http://localhost:4242";
const OPENAPI_ENDPOINT = `${API_URL}/openapi-json`;
const OUTPUT_PATH = path.join(__dirname, "..", "openapi.json");

async function exportOpenApiSpec() {
  console.log("🔍 Fetching OpenAPI specification...");
  console.log(`   Endpoint: ${OPENAPI_ENDPOINT}`);

  try {
    const response = await fetch(OPENAPI_ENDPOINT);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch OpenAPI spec: ${response.status} ${response.statusText}`,
      );
    }

    const spec = await response.json();

    console.log("💾 Writing OpenAPI spec to file...");
    console.log(`   Output: ${OUTPUT_PATH}`);

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(spec, null, 2), "utf-8");

    console.log("✅ OpenAPI specification exported successfully!");
    console.log(`   Version: ${spec.info?.version || "unknown"}`);
    console.log(`   Title: ${spec.info?.title || "unknown"}`);
  } catch (error) {
    console.error("❌ Failed to export OpenAPI specification");

    if (error instanceof Error) {
      if (error.message.includes("fetch")) {
        console.error("\n💡 Make sure the API server is running:");
        console.error("   cd apps/api && npm run dev");
      }
      console.error(`\nError: ${error.message}`);
    }

    process.exit(1);
  }
}

exportOpenApiSpec();
