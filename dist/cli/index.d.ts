/**
 * Command line interface options
 */
export interface CliOptions {
    keyword: string;
    outputFile?: string;
    jsonOutput?: string;
}
/**
 * Parse command line arguments
 * @returns Parsed CLI options
 */
export declare function parseArgs(): CliOptions;
/**
 * Display help information
 */
export declare function showHelp(): void;
//# sourceMappingURL=index.d.ts.map