/**
 * 환경별 로깅 유틸리티
 * 
 * 개발/프로덕션 환경에 따라 적절한 로깅을 제공하는 유틸리티 클래스입니다.
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  prefix?: string
}

export class Logger {
  private config: LoggerConfig

  constructor(config: LoggerConfig) {
    this.config = config
  }

  error(message: string, ...args: any[]): void {
    if (this.config.enabled) {
      const prefixedMessage = this.addPrefix(message)
      console.error(prefixedMessage, ...args)
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.config.enabled && this.shouldLog(LogLevel.WARN)) {
      const prefixedMessage = this.addPrefix(message)
      console.warn(prefixedMessage, ...args)
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.config.enabled && this.shouldLog(LogLevel.INFO)) {
      const prefixedMessage = this.addPrefix(message)
      console.info(prefixedMessage, ...args)
    }
  }

  /**
   * Log debug messages - only in development with debug level
   */
  debug(message: string, ...args: any[]): void {
    if (this.config.enabled && this.shouldLog(LogLevel.DEBUG)) {
      const prefixedMessage = this.addPrefix(message)
      console.debug(prefixedMessage, ...args)
    }
  }

  /**
   * Update logger configuration
   */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Check if current log level should be logged
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG]
    const currentLevelIndex = levels.indexOf(this.config.level)
    const requestedLevelIndex = levels.indexOf(level)
    
    return requestedLevelIndex <= currentLevelIndex
  }

  /**
   * Add prefix to log message if configured
   */
  private addPrefix(message: string): string {
    return this.config.prefix ? `[${this.config.prefix}] ${message}` : message
  }
}
/**

 * Create logger configuration based on environment
 */
function createLoggerConfig(prefix?: string): LoggerConfig {
  const isProduction = process.env.NODE_ENV === 'production'
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isDebugMode = process.env.NEXT_PUBLIC_DEBUG === 'true'

  // Production: Only errors, no logging by default
  if (isProduction) {
    return {
      enabled: false, // Disabled in production for performance
      level: LogLevel.ERROR,
      prefix
    }
  }

  // Development: Info level by default, debug if enabled
  if (isDevelopment) {
    return {
      enabled: true,
      level: isDebugMode ? LogLevel.DEBUG : LogLevel.INFO,
      prefix
    }
  }

  // Default fallback
  return {
    enabled: true,
    level: LogLevel.INFO,
    prefix
  }
}

/**
 * Create a logger instance with environment-specific configuration
 */
export function createLogger(prefix?: string): Logger {
  const config = createLoggerConfig(prefix)
  return new Logger(config)
}

/**
 * Default logger instance for general use
 */
export const logger = createLogger('APP')

/**
 * TOC-specific logger instance
 */
export const tocLogger = createLogger('TOC')

/**
 * Performance logger for measuring execution times
 */
export const perfLogger = createLogger('PERF')