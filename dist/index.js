import { scrapeTelegramGroups } from "./scraper/index.js";
import { saveToCSV } from "./utils/file.js";
import { extractLinksToJSON } from "./utils/json-exporter.js";
import { config } from "./config/index.js";
import { parseArgs, showHelp } from "./cli/index.js";
import { setLogLevel, LogLevel, info, error } from "./utils/logger.js";
/**
 * Main application entry point
 */
async function main() {
    try {
        // Set log level
        setLogLevel(LogLevel.INFO);
        // Check for help flag
        if (process.argv.includes('--help') || process.argv.includes('-h')) {
            showHelp();
            return;
        }
        // Parse command line arguments
        const options = parseArgs();
        info(`Starting scraper for keyword: ${options.keyword}`);
        // Override output file if specified
        if (options.outputFile) {
            config.output.csvFilename = options.outputFile;
        }
        // Override JSON output file if specified
        const jsonOutputFile = options.jsonOutput || config.output.jsonFilename;
        const groups = await scrapeTelegramGroups(options.keyword);
        info(`Found a total of ${groups.length} groups`);
        // Save to CSV
        await saveToCSV(groups);
        // Extract links and save to JSON
        await extractLinksToJSON(jsonOutputFile);
    }
    catch (err) {
        error('Error in main process:', err);
        process.exit(1);
    }
}
// Execute the main function
main();
//# sourceMappingURL=index.js.map