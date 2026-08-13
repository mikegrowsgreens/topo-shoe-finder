/**
 * Topo Athletic Catalog Auto-Updater
 *
 * Scrapes topoathletic.com to find all current men's shoes,
 * fetches specs from each product page, downloads hero images,
 * and updates catalog.json + images.json.
 *
 * Usage:
 *   npx tsx scripts/update-catalog.ts           # dry run (preview changes)
 *   npx tsx scripts/update-catalog.ts --apply    # write changes to disk
 *
 * Requirements:
 *   npm install -D tsx cheerio node-fetch@3
 */

process.exit(console.error("This script predates the 2026-08 base-model/variant schema redesign. Rewrite before running — it will clobber data/catalog.json with the old schema.") ?? 1);
import * as fs from "fs";
import * as path from "path";
import * as https from "https";

// ——— Config ———
const COLLECTION_URLS = [
  "https://www.topoathletic.com/mens-running-shoes",
  "https://www.topoathletic.com/mens-trail-running-shoes",
  "https://www.topoathletic.com/mens-hiking-shoes",
];

const DATA_DIR = path.resolve(__dirname, "../data");
const PUBLIC_SHOES_DIR = path.resolve(__dirname, "../public/shoes");
const CATALOG_PATH = path.join(DATA_DIR, "catalog.json");
const IMAGES_PATH = path.join(DATA_DIR, "images.json");

// ——— Types ———
interface CatalogShoe {
  id: string;
  name: string;
  category: "road" | "trail";
  stack: string;
  drop: string;
  bestFor: string;
  cushion: "max" | "balanced" | "firmer";
  support: "neutral" | "guidance" | "max";
  terrain: string[];
  weight: string;
  pdpMens: string;
  pdpWomens: string;
  benefits: string[];
  description: string;
}

interface ImageEntry {
  hero: string;
  alt: string;
}

// ——— Helpers ———
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function fetchHTML(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "TopoShoeFinderBot/1.0" } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        fetchHTML(res.headers.location).then(resolve).catch(reject);
        return;
      }
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function downloadImage(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { "User-Agent": "TopoShoeFinderBot/1.0" } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        downloadImage(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      res.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    }).on("error", (err) => {
      file.close();
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

function extractTextBetween(html: string, startMarker: string, endMarker: string): string {
  const startIdx = html.indexOf(startMarker);
  if (startIdx === -1) return "";
  const afterStart = startIdx + startMarker.length;
  const endIdx = html.indexOf(endMarker, afterStart);
  if (endIdx === -1) return "";
  return html.substring(afterStart, endIdx).trim();
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

// ——— Collection page scraper ———
async function scrapeCollectionPage(url: string): Promise<{ name: string; pdpUrl: string; imageUrl: string }[]> {
  const html = await fetchHTML(url);
  const products: { name: string; pdpUrl: string; imageUrl: string }[] = [];

  // Find product links - look for patterns like /mens-{shoe-name} or /womens-{shoe-name}
  const productLinkRegex = /<a[^>]*href="(https:\/\/www\.topoathletic\.com\/(?:mens|M)-[^"]+)"[^>]*>/gi;
  const seen = new Set<string>();
  let match;

  while ((match = productLinkRegex.exec(html)) !== null) {
    const pdpUrl = match[1];
    if (seen.has(pdpUrl)) continue;
    seen.add(pdpUrl);
    products.push({ name: "", pdpUrl, imageUrl: "" });
  }

  return products;
}

// ——— Product page scraper ———
async function scrapeProductPage(url: string): Promise<Partial<CatalogShoe> & { imageUrl: string }> {
  const html = await fetchHTML(url);
  const result: Partial<CatalogShoe> & { imageUrl: string } = { imageUrl: "" };

  // Extract product name from <h1> or <title>
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    result.name = stripTags(h1Match[1]).replace(/^(Men's|Women's)\s+/i, "");
  }

  // Extract hero image
  const ogImageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
  if (ogImageMatch) {
    result.imageUrl = ogImageMatch[1];
  }

  // Extract description
  const ogDescMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i);
  const metaDescMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
  result.description = ogDescMatch?.[1] || metaDescMatch?.[1] || "";

  // Try to find specs from the page
  const specText = html.toLowerCase();

  // Stack height
  const stackMatch = specText.match(/stack\s*(?:height)?[:\s]*(\d+)\s*\/\s*(\d+)\s*mm/i)
    || html.match(/(\d+)\/(\d+)\s*mm/);
  if (stackMatch) {
    result.stack = `${stackMatch[1]}/${stackMatch[2]}mm`;
  }

  // Drop
  const dropMatch = specText.match(/drop[:\s]*(\d+)\s*mm/i);
  if (dropMatch) {
    result.drop = `${dropMatch[1]}mm`;
  }

  // Weight
  const weightMatch = specText.match(/weight[:\s]*([\d.]+)\s*oz/i);
  if (weightMatch) {
    result.weight = `${weightMatch[1]} oz`;
  }

  // Determine category from URL/content
  if (url.includes("trail") || url.includes("hiking") || url.includes("venture") || url.includes("traverse")) {
    result.category = "trail";
  } else {
    result.category = "road";
  }

  // Women's URL - derive from men's URL
  result.pdpMens = url;
  result.pdpWomens = url
    .replace("/mens-", "/womens-")
    .replace("/M-", "/W-");

  return result;
}

// ——— Main ———
async function main() {
  const dryRun = !process.argv.includes("--apply");

  console.log(`\n🏃 Topo Athletic Catalog Updater ${dryRun ? "(DRY RUN)" : "(APPLYING CHANGES)"}\n`);

  // Load existing catalog
  const existingCatalog: CatalogShoe[] = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf-8"));
  const existingImages: Record<string, ImageEntry> = JSON.parse(fs.readFileSync(IMAGES_PATH, "utf-8"));
  const existingIds = new Set(existingCatalog.map((s) => s.id));

  console.log(`📦 Existing catalog: ${existingCatalog.length} shoes\n`);

  // Scrape all collection pages
  const allProducts: { name: string; pdpUrl: string; imageUrl: string }[] = [];
  for (const collectionUrl of COLLECTION_URLS) {
    console.log(`🔍 Scraping ${collectionUrl}...`);
    try {
      const products = await scrapeCollectionPage(collectionUrl);
      console.log(`   Found ${products.length} product links`);
      allProducts.push(...products);
    } catch (err) {
      console.error(`   ❌ Failed: ${err}`);
    }
  }

  // Deduplicate by URL
  const uniqueUrls = Array.from(new Set(allProducts.map((p) => p.pdpUrl)));
  console.log(`\n📋 Total unique product URLs: ${uniqueUrls.length}`);

  // Check each product against existing catalog
  const newProducts: string[] = [];
  const updatedProducts: string[] = [];

  for (const pdpUrl of uniqueUrls) {
    // Derive an approximate ID from the URL
    const urlSlug = pdpUrl
      .replace("https://www.topoathletic.com/", "")
      .replace(/^(mens|womens|M|W)-/i, "");
    const approxId = slugify(urlSlug);

    // Check if we already have this shoe (by URL match)
    const existing = existingCatalog.find(
      (s) => s.pdpMens === pdpUrl || s.pdpWomens === pdpUrl
    );

    if (existing) {
      continue; // Already in catalog
    }

    // Check by approximate ID
    if (existingIds.has(approxId)) {
      continue;
    }

    newProducts.push(pdpUrl);
  }

  if (newProducts.length === 0) {
    console.log("\n✅ Catalog is up to date! No new shoes found.\n");
    return;
  }

  console.log(`\n🆕 Found ${newProducts.length} new product(s) to add:\n`);

  const newShoes: CatalogShoe[] = [];
  const newImages: Record<string, ImageEntry> = {};

  for (const pdpUrl of newProducts) {
    console.log(`  🔎 Scraping ${pdpUrl}...`);
    try {
      const data = await scrapeProductPage(pdpUrl);
      const name = data.name || "Unknown";
      const id = slugify(name);

      console.log(`     → ${name} (${id})`);

      // Build shoe entry with sensible defaults for missing data
      const shoe: CatalogShoe = {
        id,
        name,
        category: data.category || "road",
        stack: data.stack || "—",
        drop: data.drop || "5mm",
        bestFor: data.category === "trail" ? "trail running" : "daily running",
        cushion: "balanced",
        support: "neutral",
        terrain: data.category === "trail" ? ["mixed", "technical"] : ["pavement"],
        weight: data.weight || "—",
        pdpMens: data.pdpMens || pdpUrl,
        pdpWomens: data.pdpWomens || pdpUrl.replace("/mens-", "/womens-"),
        benefits: [],
        description: data.description || `${name} running shoe by Topo Athletic.`,
      };

      newShoes.push(shoe);

      // Download image if available
      if (data.imageUrl) {
        const imgPath = path.join(PUBLIC_SHOES_DIR, `${id}.jpg`);
        if (!fs.existsSync(imgPath)) {
          if (!dryRun) {
            console.log(`     📷 Downloading image...`);
            await downloadImage(data.imageUrl, imgPath);
          } else {
            console.log(`     📷 Would download image to ${imgPath}`);
          }
        }
        newImages[id] = {
          hero: `/shoes/${id}.jpg`,
          alt: `Topo Athletic ${name}`,
        };
      }

      // Rate-limit: wait 1 second between requests
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      console.error(`     ❌ Failed to scrape: ${err}`);
    }
  }

  // Summary
  console.log(`\n📊 Summary:`);
  console.log(`   New shoes to add: ${newShoes.length}`);
  console.log(`   New images: ${Object.keys(newImages).length}`);

  if (dryRun) {
    console.log(`\n⚠️  DRY RUN — no files modified.`);
    console.log(`   Run with --apply to save changes.\n`);

    if (newShoes.length > 0) {
      console.log("   New shoes found:");
      newShoes.forEach((s) => console.log(`     - ${s.name} (${s.id}) [${s.category}]`));
    }
  } else {
    // Update catalog.json
    const updatedCatalog = [...existingCatalog, ...newShoes];
    fs.writeFileSync(CATALOG_PATH, JSON.stringify(updatedCatalog, null, 2) + "\n");
    console.log(`   ✅ Updated ${CATALOG_PATH} (${updatedCatalog.length} shoes total)`);

    // Update images.json
    const updatedImages = { ...existingImages, ...newImages };
    fs.writeFileSync(IMAGES_PATH, JSON.stringify(updatedImages, null, 2) + "\n");
    console.log(`   ✅ Updated ${IMAGES_PATH} (${Object.keys(updatedImages).length} entries total)`);

    console.log(`\n✅ Catalog update complete!\n`);
    console.log(`   ⚠️  Review new entries in catalog.json — you may want to adjust:`);
    console.log(`      - cushion level (max / balanced / firmer)`);
    console.log(`      - support type (neutral / guidance / max)`);
    console.log(`      - bestFor description`);
    console.log(`      - benefits array`);
    console.log(`   Then rebuild and redeploy.\n`);
  }
}

main().catch(console.error);
