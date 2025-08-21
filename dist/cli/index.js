import { config } from "../config/index.js";
/**
 * Parse command line arguments
 * @returns Parsed CLI options
 */
export function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        keyword: config.scraper.defaultKeyword
    };
    // Simple argument parsing
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--keyword' || arg === '-k') {
            options.keyword = args[++i] || config.scraper.defaultKeyword;
        }
        else if (arg === '--output' || arg === '-o') {
            options.outputFile = args[++i];
        }
        else if (arg === '--json' || arg === '-j') {
            options.jsonOutput = args[++i];
        }
        else if (!arg.startsWith('-') && !options.keyword) {
            // If no flag is provided, assume the first argument is the keyword
            options.keyword = arg;
        }
    }
    return options;
}
/**
 * Display help information
 */
export function showHelp() {
    console.log(`
Telegram Group Scraper

Usage:
  npm start [options] [keyword]

Options:
  -k, --keyword <keyword>  Search keyword (default: ${config.scraper.defaultKeyword})
  -o, --output <file>      Output CSV file (default: ${config.output.csvFilename})
  -j, --json <file>        Output JSON file with links (default: telegram_links.json)
  -h, --help               Show this help message
`);
}
//# sourceMappingURL=index.js.map