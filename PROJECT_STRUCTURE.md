# Project Structure

```
tg-scraper/
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── package.json                 # Node.js dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── README.md                   # Main project documentation
├── API-README.md               # API-specific documentation
│
├── src/                        # Source code directory
│   ├── api/                    # API server related code
│   │   ├── server.ts           # Express server setup
│   │   ├── routes/             # API route handlers
│   │   │   ├── scrape.ts       # Scraping endpoints
│   │   │   └── health.ts       # Health check endpoints
│   │   └── middleware/         # Express middleware
│   │       ├── cors.ts         # CORS configuration
│   │       └── error.ts        # Error handling
│   │
│   ├── bot/                    # Telegram bot related code
│   │   ├── bot.ts              # Bot initialization
│   │   ├── handlers/           # Message handlers
│   │   │   ├── start.ts        # /start command handler
│   │   │   └── keyword.ts      # Keyword message handler
│   │   └── utils/              # Bot utilities
│   │       └── fileManager.ts  # File management for bot
│   │
│   ├── scraper/                # Web scraping logic
│   │   ├── index.ts            # Main scraper entry point
│   │   ├── browser.ts          # Browser management
│   │   ├── parser.ts           # HTML parsing logic
│   │   └── types.ts            # Scraper-specific types
│   │
│   ├── utils/                  # Shared utilities
│   │   ├── logger.ts           # Logging utilities
│   │   ├── file.ts             # File operations
│   │   ├── csv.ts              # CSV generation
│   │   └── validation.ts       # Input validation
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── index.ts            # Main type exports
│   │   ├── api.ts              # API-related types
│   │   ├── bot.ts              # Bot-related types
│   │   └── scraper.ts          # Scraper-related types
│   │
│   ├── config/                 # Configuration files
│   │   ├── index.ts            # Main config exports
│   │   ├── api.ts              # API configuration
│   │   ├── bot.ts              # Bot configuration
│   │   └── scraper.ts          # Scraper configuration
│   │
│   └── cli/                    # Command line interface
│       ├── index.ts            # CLI entry point
│       ├── commands/           # CLI commands
│       │   ├── scrape.ts       # Scrape command
│       │   └── serve.ts        # Serve command
│       └── utils/              # CLI utilities
│           └── args.ts         # Argument parsing
│
├── dist/                       # Compiled JavaScript output
│   ├── api/
│   ├── bot/
│   ├── scraper/
│   ├── utils/
│   ├── types/
│   ├── config/
│   └── cli/
│
├── public/                     # Static web assets
│   ├── index.html              # Web interface
│   ├── css/                    # Stylesheets
│   │   └── styles.css          # Main styles
│   ├── js/                     # Client-side JavaScript
│   │   └── app.js              # Main client script
│   └── assets/                 # Images, icons, etc.
│       └── favicon.ico         # Site favicon
│
├── downloads/                  # Generated CSV files
│   └── .gitkeep               # Keep directory in git
│
├── logs/                       # Application logs
│   ├── app.log                # Application logs
│   ├── error.log              # Error logs
│   └── .gitkeep               # Keep directory in git
│
├── tests/                      # Test files
│   ├── unit/                   # Unit tests
│   │   ├── scraper.test.ts     # Scraper tests
│   │   ├── utils.test.ts       # Utility tests
│   │   └── api.test.ts         # API tests
│   ├── integration/            # Integration tests
│   │   ├── api.test.ts         # API integration tests
│   │   └── bot.test.ts         # Bot integration tests
│   └── fixtures/               # Test data
│       └── sample-data.json    # Sample test data
│
├── docs/                       # Documentation
│   ├── api.md                  # API documentation
│   ├── bot.md                  # Bot documentation
│   ├── deployment.md           # Deployment guide
│   └── development.md          # Development guide
│
└── scripts/                    # Build and deployment scripts
    ├── build.sh                # Build script
    ├── deploy.sh               # Deployment script
    ├── start.sh                # Start script
    └── clean.sh                # Clean build artifacts
```

## Directory Descriptions

### `/src` - Source Code
- **`/api`**: Express.js API server implementation
- **`/bot`**: Telegram bot functionality
- **`/scraper`**: Core web scraping logic
- **`/utils`**: Shared utility functions
- **`/types`**: TypeScript type definitions
- **`/config`**: Application configuration
- **`/cli`**: Command-line interface

### `/dist` - Compiled Output
- Contains compiled JavaScript files from TypeScript source
- Mirrors the structure of `/src`
- Generated by TypeScript compiler

### `/public` - Static Assets
- Web interface files
- CSS, JavaScript, and other static assets
- Served by the Express server

### `/downloads` - Generated Files
- CSV files generated by the scraper
- Temporary storage for user downloads

### `/logs` - Application Logs
- Application and error logs
- Rotated log files

### `/tests` - Test Suite
- Unit and integration tests
- Test fixtures and mock data

### `/docs` - Documentation
- API documentation
- User guides and development docs

### `/scripts` - Automation Scripts
- Build, deployment, and maintenance scripts

## Benefits of This Structure

1. **Clear Separation**: Source code, compiled output, and assets are clearly separated
2. **Scalability**: Easy to add new features and modules
3. **Maintainability**: Related code is grouped together
4. **Testing**: Dedicated test structure with proper organization
5. **Documentation**: Centralized documentation location
6. **Deployment**: Clear build artifacts and deployment scripts