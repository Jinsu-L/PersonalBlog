export function formatDate(date: any, local: any) {
  const d = new Date(date)
  const options: any = { year: 'numeric', month: 'short', day: 'numeric' }
  const res = d.toLocaleDateString(local, options)
  return res
}

// Export logger utilities
export { Logger, LogLevel, createLogger, logger, tocLogger, perfLogger } from './logger'
export type { LoggerConfig } from './logger'
