# Telegram Channel Scraper API & Bot

This project provides both a REST API and a Telegram bot for scraping Telegram channels based on keywords.

## Features

- 🌐 **REST API**: HTTP endpoints for scraping and downloading CSV files
- 🤖 **Telegram Bot**: Interactive bot that accepts keywords and sends CSV files
- 📊 **CSV Export**: Structured data export with channel information
- 🔍 **Advanced Scraping**: Multi-page scraping with detailed channel data

## Setup

### 1. Install Dependencies

```
node dist/index.js --help
node dist/index.js scrape "crypto" --pages 3 --output results.csv
node dist/index.js api --port 6000
node dist/index.js bot
```

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Telegram bot token
# Get your bot token from @BotFather on Telegram
```

### 3. Create Telegram Bot

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the bot token to your `.env` file

### 4. Start the Server

```bash
# Development mode (with TypeScript compilation)
npm run api:dev

# Production mode
npm run api
```

## API Endpoints

### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "OK",
  "message": "Telegram Scraper API is running"
}
```

### Scrape Channels
```http
POST /scrape
Content-Type: application/json

{
  "keyword": "crypto",
  "maxPages": 10
}
```

Response:
```json
{
  "success": true,
  "message": "Found 25 channels",
  "data": [
    {
      "username": "cryptonews",
      "name": "Crypto News",
      "desc": "Latest cryptocurrency news and updates",
      "link": "tg://resolve?domain=cryptonews"
    }
  ],
  "downloadUrl": "/downloads/telegram_channels_crypto_2024-01-01T12-00-00-000Z.csv",
  "filename": "telegram_channels_crypto_2024-01-01T12-00-00-000Z.csv"
}
```

### Download CSV
```http
GET /download/:filename
```

Downloads the CSV file directly.

## Telegram Bot Usage

### Commands

- `/start` - Welcome message and instructions
- `/help` - Show help information

### How to Use

1. Start a chat with your bot
2. Send `/start` to see the welcome message
3. Send any keyword (e.g., "crypto", "news", "tech")
4. Wait for the bot to scrape channels
5. Receive a CSV file with the results

### Example Conversation

```
User: /start
Bot: 🤖 Welcome to Telegram Channel Scraper Bot!
     Send me a keyword and I'll scrape Telegram channels for you.

User: crypto
Bot: 🔍 Searching for channels with keyword: "crypto"
     This may take a few minutes...
     
     ✅ Found 25 channels for "crypto"
     Sending CSV file...
     
     [CSV file attachment]
     📊 Telegram channels for "crypto"
     Total channels: 25
```

## CSV File Format

The generated CSV files contain the following columns:

| Column | Description |
|--------|-------------|
| Username | Channel username (without @) |
| Name | Full channel name |
| Description | Channel description |
| Link | Telegram deep link (tg://resolve?domain=...) |

## Configuration

### Environment Variables

- `BOT_TOKEN`: Your Telegram bot token (required)
- `PORT`: Server port (default: 6000)
- `MAX_PAGES`: Maximum pages to scrape (default: 10)
- `TIMEOUT`: Request timeout in milliseconds (default: 60000)

### Scraping Limits

- **API**: Up to 500 pages (configurable via `maxPages` parameter)
- **Bot**: Limited to 5 pages for faster response times
- **Timeout**: 60 seconds per page request

## Error Handling

### API Errors

- `400 Bad Request`: Missing or invalid keyword
- `404 Not Found`: CSV file not found
- `500 Internal Server Error`: Scraping or server error

### Bot Error Messages

- No channels found for keyword
- Processing errors with retry suggestions
- Network timeout errors

## File Management

- CSV files are stored in the `downloads/` directory
- Bot files are automatically deleted after 1 minute
- API files persist until manually deleted

## Development

### Project Structure

```
├── api-server.ts          # Main API server and bot code
├── index.ts              # Original scraper script
├── package.json          # Dependencies and scripts
├── .env.example          # Environment configuration template
├── downloads/            # Generated CSV files
└── API-README.md         # This documentation
```

### Adding Features

1. **New API Endpoints**: Add routes in `api-server.ts`
2. **Bot Commands**: Add handlers in the bot section
3. **Scraping Logic**: Modify the `scrapeTelegramGroups` function
4. **Export Formats**: Add new export functions alongside `saveToCSV`

## Troubleshooting

### Common Issues

1. **Bot not responding**
   - Check if BOT_TOKEN is correctly set
   - Verify the bot is not already running elsewhere
   - Check bot permissions with @BotFather

2. **Scraping errors**
   - Website structure may have changed
   - Network connectivity issues
   - Rate limiting from target website

3. **File download issues**
   - Check if downloads directory exists
   - Verify file permissions
   - Ensure sufficient disk space

### Logs

The server provides detailed console logs for:
- Scraping progress
- Bot interactions
- API requests
- Error messages

## Security Notes

- Keep your bot token secure and never commit it to version control
- The API has no authentication - add security measures for production use
- Consider rate limiting for public deployments
- Regularly clean up old CSV files to save disk space

## License

This project is for educational purposes. Please respect the terms of service of the websites being scraped.