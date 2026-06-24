/**
 * Centralized logger for the application.
 * In a real production environment, this could hook into Sentry, LogRocket, or Datadog.
 */

const LOG_LEVELS = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
};

class Logger {
  constructor() {
    this.isProduction = import.meta.env.PROD;
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, data };

    if (!this.isProduction) {
      // In development, log to console
      switch (level) {
        case LOG_LEVELS.INFO:
          console.log(`[INFO] ${timestamp}: ${message}`, data || '');
          break;
        case LOG_LEVELS.WARN:
          console.warn(`[WARN] ${timestamp}: ${message}`, data || '');
          break;
        case LOG_LEVELS.ERROR:
          console.error(`[ERROR] ${timestamp}: ${message}`, data || '');
          break;
        default:
          console.log(`[${level}] ${timestamp}: ${message}`, data || '');
      }
    } else {
      // In production, we still log errors to console for now, 
      // but this is where we'd send data to an external monitoring service.
      if (level === LOG_LEVELS.ERROR || level === LOG_LEVELS.WARN) {
        console.error(`[${level}] ${message}`, data || '');
      }
    }
  }

  info(message, data) {
    this.log(LOG_LEVELS.INFO, message, data);
  }

  warn(message, data) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  error(message, errorOrData) {
    let data = errorOrData;
    if (errorOrData instanceof Error) {
      data = {
        message: errorOrData.message,
        stack: errorOrData.stack,
        name: errorOrData.name
      };
    }
    this.log(LOG_LEVELS.ERROR, message, data);
  }
}

export const logger = new Logger();
