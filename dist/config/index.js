/**
 * Application configuration
 */
export const config = {
    scraper: {
        defaultKeyword: "Crypto",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        baseUrl: "https://tgramsearch.com/",
        navigationTimeout: 30000,
        selectors: {
            groupCards: [
                ".card-body",
                ".card",
                ".group-card"
            ],
            groupName: [
                "h5",
                ".card-title",
                ".group-name"
            ],
            groupDesc: [
                "p",
                ".card-text",
                ".group-description"
            ],
            groupLink: [
                "a",
                ".btn-primary",
                ".group-link"
            ]
        }
    },
    output: {
        csvFilename: "telegram_groups.csv",
        jsonFilename: "telegram_links.json",
        screenshotFilename: "debug_screenshot.png"
    }
};
//# sourceMappingURL=index.js.map