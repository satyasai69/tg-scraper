/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

// Current log level
let currentLogLevel = LogLevel.INFO;

/**
 * Set the current log level
 * @param level The log level to set
 */
export function setLogLevel(level: LogLevel): void {
  currentLogLevel = level;
}

/**
 * Get the current log level
 * @returns The current log level
 */
export function getLogLevel(): LogLevel {
  return currentLogLevel;
}

/**
 * Log a debug message
 * @param message The message to log
 * @param args Additional arguments
 */
export function debug(message: string, ...args: any[]): void {
  if (currentLogLevel <= LogLevel.DEBUG) {
    console.debug(`[DEBUG] ${message}`, ...args);
  }
}

/**
 * Log an info message
 * @param message The message to log
 * @param args Additional arguments
 */
export function info(message: string, ...args: any[]): void {
  if (currentLogLevel <= LogLevel.INFO) {
    console.info(`[INFO] ${message}`, ...args);
  }
}

/**
 * Log a warning message
 * @param message The message to log
 * @param args Additional arguments
 */
export function warn(message: string, ...args: any[]): void {
  if (currentLogLevel <= LogLevel.WARN) {
    console.warn(`[WARN] ${message}`, ...args);
  }
}

/**
 * Log an error message
 * @param message The message to log
 * @param args Additional arguments
 */
export function error(message: string, ...args: any[]): void {
  if (currentLogLevel <= LogLevel.ERROR) {
    console.error(`[ERROR] ${message}`, ...args);
  }
}

/**
 * Logger object with all logging methods
 */
export const logger = {
  setLogLevel,
  getLogLevel,
  debug,
  info,
  warn,
  error,
  LogLevel
};

/**
 * Default export
 */
export default logger;