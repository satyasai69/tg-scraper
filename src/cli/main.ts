import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

async function scrapeTelegramGroups(keyword: string) {
  const browser = await puppeteer.launch({
    headless: "new",
    timeout: 60000,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--disable-web-security",
      "--disable-features=VizDisplayCompositor",
      "--disable-extensions",
      "--disable-plugins",
      "--disable-default-apps",
      "--single-process",
      "--enable-automation",
      "--password-store=basic",
      "--use-mock-keychain"
    ],
  });
  const page = await browser.newPage();

  const results: {
    username: string;
    name: string;
    desc: string;
    link: string;
  }[] = [];

  try {
    for (let pageNum = 1; pageNum <= 500; pageNum++) {
      const url = `https://en.tgramsearch.com/search?query=${encodeURIComponent(
        keyword
      )}&page=${pageNum}`;
      console.log(`🔎 Scraping page ${pageNum}: ${url}`);

      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

        const currentUrl = page.url();
        const match = currentUrl.match(/page=(\d+)/);
        if (match) {
          if (match[1]) {
            const realPage = parseInt(match[1], 10);
            if (realPage < pageNum) {
              console.log(
                `⚠️ Tried to open page ${pageNum}, but got redirected to page ${realPage}. Stopping.`
              );
              break;
            }
          }
        }

        const joinLinks = await page.$$eval(
          ".tg-channel-wrapper.is-list a[href*='/join/']",
          (anchors: any[]) => anchors.map((a: any) => (a as HTMLAnchorElement).href)
        );

        if (joinLinks.length === 0) {
          console.log(`⚠️ No results found on page ${pageNum}, stopping.`);
          break;
        }

        console.log(
          `➡️ Found ${joinLinks.length} join links on page ${pageNum}`
        );

        for (const joinUrl of joinLinks) {
          console.log(`   Visiting join page: ${joinUrl}`);
          try {
            await page.goto(joinUrl, {
              waitUntil: "networkidle2",
              timeout: 60000,
            });

            const channel = await page.evaluate(() => {
              const name =
                document
                  .querySelector("h1.tg-channel-header")
                  ?.textContent?.trim() || "No name";
              const desc =
                document
                  .querySelector(".tg-channel-description")
                  ?.textContent?.trim() || "No description";
              const linkEl = document.querySelector(
                "a[href^='tg://resolve?domain=']"
              );
              const link = linkEl ? linkEl.getAttribute("href") || "" : "";

              let username = "";
              const m = link.match(/domain=([^&]+)/);
              if (m) username = m[1] || ""; // Ensure username is a string

              return { username, name, desc, link };
            });

            if (channel.link) {
              results.push(channel);
              console.log(`   ✅ Found: ${channel.username}`);
            }
          } catch (err) {
            console.log(`   ❌ Failed to open join page: ${joinUrl}`);
          }
        }
      } catch (err) {
        console.log(`❌ Failed to load page ${pageNum}, stopping scraper.`);
        break;
      }

      if (pageNum % 10 === 0) {
        await saveToJSON(results, "telegram_channels_checkpoint.json");
        console.log(`💾 Checkpoint saved at page ${pageNum}`);
      }
    }
  } finally {
    await browser.close();
    console.log("Browser closed");
  }

  return results;
}

async function saveToJSON(data: any[], filename = "telegram_channels.json") {
  try {
    const filePath = path.join(process.cwd(), filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`✅ Saved ${data.length} channels to ${filePath}`);
  } catch (error) {
    console.error("Error saving to JSON:", error);
  }
}

import { logger } from '../utils/logger';

/**
 * Run the CLI scraper
 * @param keyword The keyword to search for
 * @param options CLI options
 */
export async function runCli(keyword: string, options: { maxPages?: number; outputFile?: string }) {
  logger.info(`Starting CLI scraper for keyword: ${keyword}`);
  logger.info(`Options:`, options);
  
  // TODO: Implement actual scraping logic
  // This is a placeholder for the CLI functionality
  console.log('CLI scraping functionality will be implemented here');
}

/**
 * Default export for the CLI function
 */
export default runCli;

(async () => {
  try {
    const keyword = process.argv[2] || "crypto";
    console.log(`🚀 Starting scraper for keyword: ${keyword}`);

    const groups = await scrapeTelegramGroups(keyword);
    console.log(`🎉 Found a total of ${groups.length} channels`);

    await saveToJSON(groups);
  } catch (error) {
    console.error("Error in main process:", error);
    process.exit(1);
  }
})();
