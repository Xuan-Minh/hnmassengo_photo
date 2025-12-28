/**
 * Logger utility for development and production environments
 * Logs only in development mode, silent in production
 */

const isDev = process.env.NODE_ENV === "development";

export const logger = {
  log: (...args) => {
    if (isDev) console.log(...args);
  },
  error: (...args) => {
    // Toujours logger les erreurs, même en production (pour la surveillance)
    console.error(...args);
  },
  warn: (...args) => {
    if (isDev) console.warn(...args);
  },
  info: (...args) => {
    if (isDev) console.info(...args);
  },
  debug: (...args) => {
    if (isDev) console.debug(...args);
  },
};
