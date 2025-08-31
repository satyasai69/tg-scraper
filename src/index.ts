#!/usr/bin/env node

/**
 * Main entry point for the Telegram Channel Scraper
 * Handles different modes: CLI, API Server, and Bot
 */

import { program } from 'commander';
import { logger } from './utils/logger';

import { startApiServer } from './api/server';
import { startBot } from './bot/bot';
import { runCli } from './cli/main';

program
  .name('tg-scraper')
  .description('Telegram Channel Scraper - CLI, API, and Bot')
  .version('1.0.0');

program
  .command('scrape')
  .description('Run the scraper in CLI mode')
  .argument('<keyword>', 'keyword to search for')
  .option('-p, --pages <number>', 'maximum pages to scrape', '5')
  .option('-o, --output <file>', 'output CSV file path')
  .action(async (keyword: string, options: any) => {
    try {
      await runCli(keyword, {
        maxPages: parseInt(options.pages),
        outputFile: options.output
      });
    } catch (error) {
      logger.error('CLI scraping failed:', error);
      process.exit(1);
    }
  });

program
  .command('api')
  .description('Start the API server')
  .option('-p, --port <number>', 'server port', '5000')
  .action(async (options: any) => {
    try {
      await startApiServer(parseInt(options.port));
    } catch (error) {
      logger.error('API server failed to start:', error);
      process.exit(1);
    }
  });

program
  .command('bot')
  .description('Start the Telegram bot')
  .action(async () => {
    try {
      await startBot();
    } catch (error) {
      logger.error('Bot failed to start:', error);
      process.exit(1);
    }
  });

program
  .command('serve')
  .description('Start both API server and Telegram bot')
  .option('-p, --port <number>', 'server port', '5000')
  .action(async (options: any) => {
    try {
      // Start both API server and bot
      await Promise.all([
        startApiServer(parseInt(options.port)),
        startBot()
      ]);
    } catch (error) {
      logger.error('Failed to start services:', error);
      process.exit(1);
    }
  });

// If no command is provided, show help
if (process.argv.length <= 2) {
  program.help();
}

program.parse();