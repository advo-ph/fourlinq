type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const MIN_LEVEL = (process.env.LOG_LEVEL || 'info') as LogLevel;

function emit(level: LogLevel, prefix: string, message: string, data?: unknown): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[MIN_LEVEL]) return;
  const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] [${prefix}] ${message}`;
  const sink = level === 'error' ? console.error : console.log;
  if (data !== undefined) sink(line, data);
  else sink(line);
}

export interface Logger {
  debug: (msg: string, data?: unknown) => void;
  info: (msg: string, data?: unknown) => void;
  warn: (msg: string, data?: unknown) => void;
  error: (msg: string, data?: unknown) => void;
}

export function createLogger(prefix: string): Logger {
  return {
    debug: (msg, data) => emit('debug', prefix, msg, data),
    info:  (msg, data) => emit('info',  prefix, msg, data),
    warn:  (msg, data) => emit('warn',  prefix, msg, data),
    error: (msg, data) => emit('error', prefix, msg, data),
  };
}
