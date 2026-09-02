import { API_URL } from "../config/environment";

export function resolveApiAssetUrl(assetPath: string): string {
  if (!assetPath.startsWith("/api/assets/")) {
    throw new Error(`Invalid API asset path: ${assetPath}`);
  }

  return new URL(assetPath, new URL(API_URL).origin).toString();
}
