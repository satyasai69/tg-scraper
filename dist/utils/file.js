import fs from 'fs';
import { TelegramGroup } from '../types/index.js';
import { config } from '../config/index.js';
import { info, warn, error } from '../utils/logger.js';
/**
 * Save Telegram groups to a CSV file
 * @param groups Array of Telegram groups
 * @returns Promise that resolves when the file is saved
 */
export async function saveToCSV(groups) {
    try {
        if (!groups || groups.length === 0) {
            warn('No groups to save to CSV');
            return;
        }
        // Create CSV content
        const header = 'Name,Description,Link\n';
        const rows = groups.map(group => {
            // Escape quotes and commas in CSV fields
            const name = `"${group.name.replace(/"/g, '""')}"`;
            const desc = `"${group.desc.replace(/"/g, '""')}"`;
            const link = `"${group.link.replace(/"/g, '""')}"`;
            return `${name},${desc},${link}`;
        }).join('\n');
        const csvContent = header + rows;
        // Write to file
        await fs.promises.writeFile(config.output.csvFilename, csvContent, 'utf8');
        info(`CSV file saved to: ${config.output.csvFilename}`);
    }
    catch (err) {
        error('Error saving to CSV:', err);
        throw err;
    }
}
//# sourceMappingURL=file.js.map