import pino from 'pino';
import * as fs from 'fs';
import * as path from 'path';

// Create a custom destination that writes to both console and file
class FileAndConsoleDestination {
  private logFilePath: string;

  constructor(logFilePath: string) {
    this.logFilePath = logFilePath;
    // Create or clear the log file
    fs.writeFileSync(this.logFilePath, '');
    console.log(`Log file created at: ${this.logFilePath}`);
  }

  write(msg: string): void {
    // Write to console
    process.stdout.write(msg);
    
    // Write to file
    try {
      fs.appendFileSync(this.logFilePath, msg);
    } catch (err) {
      console.error(`Failed to write to log file: ${err}`);
    }
  }
}

// Log file path - using logs directory in project root for better permissions
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFilePath = path.join(logDir, 'mcp-fat-zebra.log');

// Create our custom destination
const destination = new FileAndConsoleDestination(logFilePath);

// Create the logger instance
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  base: {
    pid: process.pid,
    app: 'mcp-fat-zebra'
  }
}, destination);

// Log a startup message to verify logging is working
logger.info(`Logger initialized. Writing logs to: ${logFilePath}`);

// Helper function to create component-specific loggers
export function getLogger(component: string) {
  return logger.child({ component });
}