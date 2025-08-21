/**
 * Log levels
 */
export declare enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4
}
/**
 * Set the current log level
 * @param level The log level to set
 */
export declare function setLogLevel(level: LogLevel): void;
/**
 * Get the current log level
 * @returns The current log level
 */
export declare function getLogLevel(): LogLevel;
/**
 * Log a debug message
 * @param message The message to log
 * @param args Additional arguments
 */
export declare function debug(message: string, ...args: any[]): void;
/**
 * Log an info message
 * @param message The message to log
 * @param args Additional arguments
 */
export declare function info(message: string, ...args: any[]): void;
/**
 * Log a warning message
 * @param message The message to log
 * @param args Additional arguments
 */
export declare function warn(message: string, ...args: any[]): void;
/**
 * Log an error message
 * @param message The message to log
 * @param args Additional arguments
 */
export declare function error(message: string, ...args: any[]): void;
//# sourceMappingURL=logger.d.ts.map