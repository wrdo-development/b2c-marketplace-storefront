import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Default in-memory cache for the first deploy — no R2 bucket dependency.
// Swap to r2IncrementalCache once an R2 bucket is provisioned if ISR caching
// across instances becomes needed.
export default defineCloudflareConfig({});
