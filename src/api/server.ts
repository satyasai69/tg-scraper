import express from "express";
import TelegramBot from "node-telegram-bot-api";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// __dirname is available in CommonJS

const app = express();
const PORT = process.env.PORT || 6000;
const BOT_TOKEN = process.env.BOT_TOKEN || "";

// Middleware
app.use(cors());
app.use(express.json());
app.use("/downloads", express.static(path.join(__dirname, "downloads")));

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

// Telegram Bot Setup
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

interface TelegramChannel {
  username: string;
  name: string;
  desc: string;
  link: string;
}

// Scraping function (extracted from original code)
async function scrapeTelegramGroups(
  keyword: string,
  maxPages: number = 10
): Promise<TelegramChannel[]> {
  let browser;

  try {
    console.log("🚀 Launching browser...");
    browser = await puppeteer.launch({
      headless: "new",
      timeout: 60000, // 60 second timeout for browser launch
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor,TranslateUI",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-extensions",
        "--disable-plugins",
        "--disable-default-apps",
        "--disable-hang-monitor",
        "--disable-prompt-on-repost",
        "--disable-sync",
        "--disable-translate",
        "--metrics-recording-only",
        "--no-default-browser-check",
        "--safebrowsing-disable-auto-update",
        "--enable-automation",
        "--password-store=basic",
        "--use-mock-keychain",
        "--disable-background-networking",
        "--disable-client-side-phishing-detection",
        "--disable-ipc-flooding-protection",
        "--disable-popup-blocking",
        "--force-color-profile=srgb",
        "--memory-pressure-off",
        "--max_old_space_size=4096"
      ],
    });
    console.log("✅ Browser launched successfully");

    // Add retry logic for page creation
    let page: any;
    let retries = 3;
    while (retries > 0) {
      try {
        page = await browser.newPage();
        console.log("✅ Page created successfully");
        break;
      } catch (error) {
        retries--;
        console.log(`⚠️ Failed to create page, retries left: ${retries}`);
        if (retries === 0) {
          throw new Error(`Failed to create page after multiple attempts: ${error}`);
        }
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!page) {
      throw new Error("Failed to create browser page");
    }
    const results: TelegramChannel[] = [];
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
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
          (anchors: any[]) =>
            anchors.map((a: any) => (a as HTMLAnchorElement).href)
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
              if (m) username = m[1] || "";

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
    }
    return results;
  } catch (error) {
    console.error("❌ Browser launch failed:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to launch browser: ${errorMessage}`);
  } finally {
    if (browser) {
      await browser.close();
      console.log("Browser closed");
    }
  }
}

// Function to save data as CSV
async function saveToCSV(
  data: TelegramChannel[],
  filename: string
): Promise<string> {
  try {
    const filePath = path.join(downloadsDir, filename);
    const header = "Username,Name,Description,Link\n";
    const rows = data
      .map(
        (channel) =>
          `"${channel.username.replace(/"/g, '""')}","${channel.name.replace(
            /"/g,
            '""'
          )}","${channel.desc.replace(/"/g, '""')}","${channel.link.replace(
            /"/g,
            '""'
          )}"`
      )
      .join("\n");

    fs.writeFileSync(filePath, header + rows, "utf-8");
    console.log(`✅ Saved ${data.length} channels to ${filePath}`);
    return filePath;
  } catch (error) {
    console.error("Error saving to CSV:", error);
    throw error;
  }
}

// API Routes

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Telegram Scraper API is running" });
});

// Scrape endpoint
app.post("/scrape", async (req, res) => {
  try {
    const { keyword, maxPages = 10 } = req.body;

    if (!keyword) {
      return res.status(400).json({ error: "Keyword is required" });
    }

    console.log(`🚀 Starting scrape for keyword: ${keyword}`);

    const channels = await scrapeTelegramGroups(keyword, maxPages);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `telegram_channels_${keyword}_${timestamp}.csv`;

    const filePath = await saveToCSV(channels, filename);
    const downloadUrl = `/downloads/${filename}`;

    res.json({
      success: true,
      message: `Found ${channels.length} channels`,
      data: channels,
      downloadUrl: downloadUrl,
      filename: filename,
    });
  } catch (error) {
    console.error("Scraping error:", error);
    res.status(500).json({ error: "Internal server error during scraping" });
  }
});

// Download CSV endpoint
app.get("/download/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(downloadsDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).json({ error: "Error downloading file" });
    }
  });
});

// Telegram Bot Handlers

// Start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🤖 Welcome to Telegram Channel Scraper Bot!

Send me a keyword and I'll scrape Telegram channels for you.

Commands:
/start - Show this message
/help - Show help

Just send any text as a keyword to start scraping!
  `;

  bot.sendMessage(chatId, welcomeMessage);
});

// Help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const helpMessage = `
📖 How to use this bot:

1. Send me any keyword (e.g., "crypto", "news", "tech")
2. I'll scrape Telegram channels related to that keyword
3. You'll receive a CSV file with the results

Example: Just type "crypto" and send it!
  `;

  bot.sendMessage(chatId, helpMessage);
});

// Handle text messages (keywords)
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Ignore commands
  if (!text || text.startsWith("/")) {
    return;
  }

  try {
    // Send initial message
    const processingMsg = await bot.sendMessage(
      chatId,
      `🔍 Searching for channels with keyword: "${text}"\n\nThis may take a few minutes...`
    );

    // Start scraping
    const channels = await scrapeTelegramGroups(text, 5); // Limit to 5 pages for bot

    if (channels.length === 0) {
      await bot.editMessageText(
        `❌ No channels found for keyword: "${text}"\n\nTry a different keyword!`,
        {
          chat_id: chatId,
          message_id: processingMsg.message_id,
        }
      );
      return;
    }

    // Save to CSV
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `telegram_channels_${text}_${timestamp}.csv`;
    const filePath = await saveToCSV(channels, filename);

    // Update message
    await bot.editMessageText(
      `✅ Found ${channels.length} channels for "${text}"\n\nSending CSV file...`,
      {
        chat_id: chatId,
        message_id: processingMsg.message_id,
      }
    );

    // Send CSV file
    await bot.sendDocument(chatId, filePath, {
      caption: `📊 Telegram channels for "${text}"\n\nTotal channels: ${channels.length}`,
    });

    // Clean up file after sending
    setTimeout(() => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }, 60000); // Delete after 1 minute
  } catch (error) {
    console.error("Bot error:", error);
    await bot.sendMessage(
      chatId,
      `❌ Error occurred while processing "${text}"\n\nPlease try again later.`
    );
  }
});

// Error handling for bot
bot.on("error", (error) => {
  console.error("Telegram Bot Error:", error);
});

/**
 * Start the API server
 * @param port The port to run the server on
 */
export async function startApiServer(port: number = 6000): Promise<void> {
  return new Promise((resolve) => {
    app.listen(port, () => {
      console.log(`🚀 API Server running on port ${port}`);
      console.log(`🤖 Telegram Bot is active`);
      console.log(`📊 Health check: http://localhost:${port}/health`);
      resolve();
    });
  });
}

/**
 * Default export for the server function
 */
export default startApiServer;

// If this file is run directly, start the server
if (process.argv[1] && process.argv[1].endsWith("server.js")) {
  const PORT = process.env.PORT || 6000;
  startApiServer(Number(PORT));
}
