import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
async function scrapeTelegramGroups(keyword) {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    try {
        // Set a user agent to avoid detection
        await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        const url = `https://en.tgramsearch.com/?s=${encodeURIComponent(keyword)}`;
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
        console.log(`Navigated to ${url}`);
        const results = [];
        // Check if the page has loaded properly
        const pageTitle = await page.title();
        console.log(`Page title: ${pageTitle}`);
        // Take a screenshot to debug
        await page.screenshot({ path: 'debug-screenshot.png' });
        console.log('Saved debug screenshot');
        // Check the page HTML to see what's actually there
        const bodyHTML = await page.evaluate(() => document.body.innerHTML);
        console.log('Page HTML length:', bodyHTML.length);
        // Try to find any elements on the page
        const allLinks = await page.$$eval('a', links => links.length);
        console.log('Number of links on page:', allLinks);
        // Try alternative selectors
        try {
            console.log('Looking for channel items...');
            // Try different selectors that might contain the results
            const selectors = [
                '.channel-item', '.item', '.result', '.search-result',
                'div[class*="channel"]', 'div[class*="result"]'
            ];
            let foundSelector = null;
            for (const selector of selectors) {
                console.log(`Trying selector: ${selector}`);
                const elements = await page.$$(selector);
                if (elements.length > 0) {
                    console.log(`Found ${elements.length} elements with selector: ${selector}`);
                    foundSelector = selector;
                    break;
                }
            }
            if (foundSelector) {
                // Process the found elements
                const groups = await page.$$eval(foundSelector, (items, kw) => {
                    return items
                        .map((el) => {
                        // Try to extract information from the element
                        const name = el.textContent?.trim() || 'No name';
                        const desc = 'Description not available';
                        // Try to find any link that might be a Telegram link
                        const links = Array.from(el.querySelectorAll('a'));
                        const telegramLink = links.find(a => a.href && a.href.includes('t.me'));
                        const link = telegramLink ? telegramLink.href : 'No link';
                        return { name, desc, link };
                    });
                }, keyword);
                console.log(`Found ${groups.length} potential groups`);
                if (groups.length > 0) {
                    results.push(...groups);
                }
            }
            else {
                console.log('Could not find any matching elements on the page');
                // As a fallback, try to extract any t.me links from the page
                const telegramLinks = await page.$$eval('a[href*="t.me"]', (links) => {
                    return links.map(link => {
                        const href = link.href;
                        const name = link.textContent?.trim() || 'Unknown';
                        return { name, desc: 'No description', link: href };
                    });
                });
                console.log(`Found ${telegramLinks.length} Telegram links as fallback`);
                if (telegramLinks.length > 0) {
                    results.push(...telegramLinks);
                }
            }
            return results;
        }
        catch (error) {
            console.error('Error finding elements:', error);
            return results;
        }
    }
    catch (error) {
        console.error('Error during scraping:', error);
        return [];
    }
    finally {
        await browser.close();
        console.log('Browser closed');
    }
}
async function saveToCSV(data) {
    if (data.length === 0) {
        console.log('No data to save to CSV');
        return;
    }
    try {
        const filePath = path.join(process.cwd(), "telegram_groups.csv");
        const header = "Name,Description,Link\n";
        const rows = data
            .map((g) => `"${g.name.replace(/"/g, '""')}","${g.desc.replace(/"/g, '""')}",${g.link}`)
            .join("\n");
        fs.writeFileSync(filePath, header + rows, "utf-8");
        console.log(`✅ Saved ${data.length} groups to ${filePath}`);
    }
    catch (error) {
        console.error('Error saving to CSV:', error);
    }
}
(async () => {
    try {
        // Get keyword from command line arguments or use default
        const keyword = process.argv[2] || "Crypto";
        console.log(`Starting scraper for keyword: ${keyword}`);
        const groups = await scrapeTelegramGroups(keyword);
        console.log(`Found a total of ${groups.length} groups`);
        await saveToCSV(groups);
    }
    catch (error) {
        console.error('Error in main process:', error);
        process.exit(1);
    }
})();
//# sourceMappingURL=index.js.map