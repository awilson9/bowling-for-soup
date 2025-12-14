export type Logger = {
  info: (message: string, details?: Record<string, unknown> | unknown[]) => void;
  warn: (message: string, details?: Record<string, unknown> | unknown[]) => void;
  error: (message: string, error: unknown, details?: Record<string, unknown> | unknown[]) => void;
};
