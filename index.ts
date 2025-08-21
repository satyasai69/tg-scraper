import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

async function scrapeTelegramGroups(keyword: string) {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  try {
    
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    const url = `https://en.tgramsearch.com/?s=${encodeURIComponent(keyword)}`;
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    console.log(`Navigated to ${url}`);

    const results: { name: string; desc: string; link: string }[] = [];

   
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);

    
    await page.screenshot({ path: 'debug-screenshot.png' });
    console.log('Saved debug screenshot');
    
    
    const bodyHTML = await page.evaluate(() => document.body.innerHTML);
    console.log('Page HTML length:', bodyHTML.length);
    
    
    const allLinks = await page.$$eval('a', links => links.length);
    console.log('Number of links on page:', allLinks);
    
   
    try {
      console.log('Looking for channel items...');
      
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
       
        const groups = await page.$$eval(
          foundSelector,
          (items: Element[], kw: string) => {
            return items
              .map((el) => {
                
                const name = el.textContent?.trim() || 'No name';
                const desc = 'Description not available';
                
                
                const links = Array.from(el.querySelectorAll('a'));
                const telegramLink = links.find(a => a.href && a.href.includes('t.me'));
                const link = telegramLink ? telegramLink.href : 'No link';
                
                return { name, desc, link };
              });
          },
          keyword
        );
        
        console.log(`Found ${groups.length} potential groups`);
        if (groups.length > 0) {
          results.push(...groups);
        }
      } else {
        console.log('Could not find any matching elements on the page');
        
        
        const telegramLinks = await page.$$eval(
          'a[href*="t.me"]',
          (links) => {
            return links.map(link => {
              const href = link.href;
              const name = link.textContent?.trim() || 'Unknown';
              return { name, desc: 'No description', link: href };
            });
          }
        );
        
        console.log(`Found ${telegramLinks.length} Telegram links as fallback`);
        if (telegramLinks.length > 0) {
          results.push(...telegramLinks);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error finding elements:', error);
      return results;
    }
  } catch (error) {
    console.error('Error during scraping:', error);
    return [];
  } finally {
    await browser.close();
    console.log('Browser closed');
  }
}

async function saveToCSV(data: { name: string; desc: string; link: string }[]) {
  if (data.length === 0) {
    console.log('No data to save to CSV');
    return;
  }
  
  try {
    const filePath = path.join(process.cwd(), "telegram_groups.csv");
    const header = "Name,Description,Link\n";
    const rows = data
      .map(
        (g) =>
          `"${g.name.replace(/"/g, '""')}","${g.desc.replace(/"/g, '""')}",${g.link}`
      )
      .join("\n");

    fs.writeFileSync(filePath, header + rows, "utf-8");
    console.log(`✅ Saved ${data.length} groups to ${filePath}`);
  } catch (error) {
    console.error('Error saving to CSV:', error);
  }
}

(async () => {
  try {
    
    const keyword = process.argv[2] || "Crypto";
    console.log(`Starting scraper for keyword: ${keyword}`);
    
    const groups = await scrapeTelegramGroups(keyword);
    console.log(`Found a total of ${groups.length} groups`);
    
    await saveToCSV(groups);
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
})();
