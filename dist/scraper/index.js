import puppeteer from 'puppeteer';
import { TelegramGroup } from '../types/index.js';
import { config } from '../config/index.js';
import { debug, info, error } from '../utils/logger.js';
/**
 * Scrape Telegram groups based on a keyword
 * @param keyword Search keyword
 * @returns Array of Telegram groups
 */
export async function scrapeTelegramGroups(keyword) {
    info(`Scraping Telegram groups for keyword: ${keyword}`);
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    try {
        // Set user agent
        await page.setUserAgent(config.scraper.userAgent);
        // Navigate to the search page
        const url = `${config.scraper.baseUrl}search/?q=${encodeURIComponent(keyword)}`;
        info(`Navigating to: ${url}`);
        await page.goto(url, { timeout: config.scraper.navigationTimeout });
        // Take a screenshot for debugging
        await page.screenshot({ path: config.output.screenshotFilename });
        debug(`Debug screenshot saved to: ${config.output.screenshotFilename}`);
        // Extract group information
        const groups = [];
        // Try multiple selectors for group cards
        for (const cardSelector of config.scraper.selectors.groupCards) {
            const cards = await page.$$(cardSelector);
            if (cards.length > 0) {
                info(`Found ${cards.length} groups using selector: ${cardSelector}`);
                for (const card of cards) {
                    const group = { name: '', desc: '', link: '' };
                    // Try multiple selectors for group name
                    for (const nameSelector of config.scraper.selectors.groupName) {
                        const nameElement = await card.$(nameSelector);
                        if (nameElement) {
                            group.name = await page.evaluate(el => el.textContent?.trim() || '', nameElement);
                            break;
                        }
                    }
                    // Try multiple selectors for group description
                    for (const descSelector of config.scraper.selectors.groupDesc) {
                        const descElement = await card.$(descSelector);
                        if (descElement) {
                            group.desc = await page.evaluate(el => el.textContent?.trim() || '', descElement);
                            break;
                        }
                    }
                    // Try multiple selectors for group link
                    for (const linkSelector of config.scraper.selectors.groupLink) {
                        const linkElement = await card.$(linkSelector);
                        if (linkElement) {
                            group.link = await page.evaluate(el => el.getAttribute('href') || '', linkElement);
                            break;
                        }
                    }
                    groups.push(group);
                }
                // If we found groups with this selector, no need to try others
                break;
            }
        }
        // Fallback: If no groups found with selectors, try to extract t.me links
        if (groups.length === 0) {
            info('No groups found with selectors, trying to extract t.me links...');
            const links = await page.evaluate(() => {
                const allLinks = Array.from(document.querySelectorAll('a'));
                return allLinks
                    .filter(link => link.href && link.href.includes('t.me/'))
                    .map(link => ({
                    name: link.textContent?.trim() || 'Unknown Group',
                    desc: '',
                    link: link.href
                }));
            });
            if (links.length > 0) {
                info(`Found ${links.length} Telegram links`);
                groups.push(...links);
            }
        }
        info(`Scraping completed. Found ${groups.length} groups.`);
        return groups;
    }
    catch (err) {
        error('Error during scraping:', err);
        return [];
    }
    finally {
        await browser.close();
    }
}
//# sourceMappingURL=index.js.map