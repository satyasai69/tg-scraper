import fs from 'fs';
import path from 'path';
import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { config } from '../config/index.js';
import { TelegramGroup } from '../types/index.js';
import { info, error } from './logger.js';
/**
 * Extracts Telegram links from CSV file and saves them to a JSON file
 * @param jsonFilePath - Path to save the JSON file (optional)
 */
export async function extractLinksToJSON(jsonFilePath) {
    const csvFilePath = path.join(process.cwd(), config.output.csvFilename);
    const outputPath = jsonFilePath || path.join(process.cwd(), 'telegram_links.json');
    try {
        // Check if CSV file exists
        if (!fs.existsSync(csvFilePath)) {
            error(`CSV file not found at ${csvFilePath}`);
            return;
        }
        const links = [];
        const fileStream = createReadStream(csvFilePath);
        const rl = createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        // Skip header line
        let isFirstLine = true;
        // Process each line
        for await (const line of rl) {
            if (isFirstLine) {
                isFirstLine = false;
                continue;
            }
            // Parse CSV line (handling potential commas in quoted fields)
            const parts = parseCSVLine(line);
            // Extract link (should be the third column)
            if (parts.length >= 3 && parts[2] && parts[2] !== 'No link') {
                links.push(parts[2]);
            }
        }
        // Create JSON object
        const jsonData = { links };
        // Write to JSON file
        fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
        info(`Extracted ${links.length} Telegram links to ${outputPath}`);
    }
    catch (err) {
        error('Error extracting links to JSON:', err);
    }
}
/**
 * Parse a CSV line, handling quoted fields that may contain commas
 * @param line - CSV line to parse
 * @returns Array of field values
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            // Toggle quote state
            inQuotes = !inQuotes;
        }
        else if (char === ',' && !inQuotes) {
            // End of field
            result.push(current);
            current = '';
        }
        else {
            // Add character to current field
            current += char;
        }
    }
    // Add the last field
    result.push(current);
    return result;
}
//# sourceMappingURL=json-exporter.js.map