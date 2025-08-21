# Telegram Group Scraper

A TypeScript-based tool to scrape Telegram groups based on keywords.

## Features

- Search for Telegram groups using keywords
- Extract group names, descriptions, and links
- Save results to CSV format
- Error handling and logging
- Command-line argument support

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

```bash
# Clone the repository (if applicable)
# git clone https://github.com/yourusername/tg-scraper.git
# cd tg-scraper

# Install dependencies
npm install
```

## Usage

```bash
# Run with default keyword (Crypto)
npm run start

# Run with a custom keyword
node --experimental-specifier-resolution=node index.js "Bitcoin"
```

## Output

The script will create a `telegram_groups.csv` file in the project directory with the following columns:

- Name: The name of the Telegram group
- Description: The description of the group (if available)
- Link: The Telegram link to join the group

## TODO

- Implement proxy support to avoid rate limiting or banning
- Use a list of proxies and rotate them for each request
- Consider using libraries like `axios` with `https-proxy-agent` for handling requests through proxies

## Troubleshooting

If you encounter any issues:

1. Check the debug screenshot (`debug-screenshot.png`) to see what the page looks like
2. Ensure you have a stable internet connection
3. Try different keywords

## License

ISC
