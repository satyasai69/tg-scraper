/**
 * Log levels
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["NONE"] = 4] = "NONE";
})(LogLevel || (LogLevel = {}));
// Current log level
let currentLogLevel = LogLevel.INFO;
/**
 * Set the current log level
 * @param level The log level to set
 */
export function setLogLevel(level) {
    currentLogLevel = level;
}
/**
 * Get the current log level
 * @returns The current log level
 */
export function getLogLevel() {
    return currentLogLevel;
}
/**
 * Log a debug message
 * @param message The message to log
 * @param args Additional arguments
 */
export function debug(message, ...args) {
    if (currentLogLevel <= LogLevel.DEBUG) {
        console.debug(`[DEBUG] ${message}`, ...args);
    }
}
/**
 * Log an info message
 * @param message The message to log
 * @param args Additional arguments
 */
export function info(message, ...args) {
    if (currentLogLevel <= LogLevel.INFO) {
        console.info(`[INFO] ${message}`, ...args);
    }
}
/**
 * Log a warning message
 * @param message The message to log
 * @param args Additional arguments
 */
export function warn(message, ...args) {
    if (currentLogLevel <= LogLevel.WARN) {
        console.warn(`[WARN] ${message}`, ...args);
    }
}
/**
 * Log an error message
 * @param message The message to log
 * @param args Additional arguments
 */
export function error(message, ...args) {
    if (currentLogLevel <= LogLevel.ERROR) {
        console.error(`[ERROR] ${message}`, ...args);
    }
}
//# sourceMappingURL=logger.js.map