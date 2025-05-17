import * as fs from 'fs';
import * as path from 'path';

// Simple logger that doesn't interfere with MCP client
class SimpleLogger {
  private logFilePath: string;
  private enabled: boolean;
  private component: string;

  constructor(component: string = '') {
    // Create logs directory if it doesn't exist
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    this.logFilePath = path.join(logDir, 'mcp-fat-zebra.log');
    this.enabled = process.env.DISABLE_LOGGING !== 'true';
    this.component = component;
    
    // Initialize log file if this is the main logger (not a component logger)
    if (this.enabled && !component) {
      try {
        fs.writeFileSync(this.logFilePath, `=== Log started at ${new Date().toISOString()} ===\n`);
      } catch (err) {
        // If we can't write to the log file, disable logging
        this.enabled = false;
      }
    }
  }

  private formatMessage(level: string, objOrMessage: any, message?: string): string {
    const timestamp = new Date().toISOString();
    let formattedMessage = `[${timestamp}] [${level}]`;
    
    if (this.component) {
      formattedMessage += ` [${this.component}]`;
    }
    
    // Helper to handle circular references in JSON.stringify
    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key: string, value: any) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return "[Circular]";
          }
          seen.add(value);
        }
        return value;
      };
    };

    // Handle both object and string first parameters
    if (typeof objOrMessage === 'string') {
      formattedMessage += ` ${objOrMessage}`;
    } else if (message) {
      // If first param is an object and we have a message
      formattedMessage += ` ${message}`;
      
      // Format the object data
      try {
        const objStr = JSON.stringify(objOrMessage, getCircularReplacer());
        if (objStr !== '{}' || Object.keys(objOrMessage).length > 0) { // Also check if original object was not empty
          formattedMessage += ` - ${objStr}`;
        }
      } catch (e: any) { // Added type for e
        formattedMessage += ` - [Unserializable Object: ${e.message}]`; // More informative error
      }
    }
    
    return formattedMessage;
  }

  private writeToLog(message: string): void {
    if (!this.enabled) return;
    
    try {
      fs.appendFileSync(this.logFilePath, message + '\n');
    } catch (err) {
      // Silent fail - don't interfere with MCP client
    }
  }

  // Support both (object, message) and (message) formats
  info(objOrMessage: any, message?: string): void {
    this.writeToLog(this.formatMessage('INFO', objOrMessage, message));
  }

  warn(objOrMessage: any, message?: string): void {
    this.writeToLog(this.formatMessage('WARN', objOrMessage, message));
  }

  error(objOrMessage: any, message?: string): void {
    this.writeToLog(this.formatMessage('ERROR', objOrMessage, message));
  }

  debug(objOrMessage: any, message?: string): void {
    if (process.env.LOG_LEVEL === 'debug') {
      this.writeToLog(this.formatMessage('DEBUG', objOrMessage, message));
    }
  }

  child(component: string): SimpleLogger {
    return new SimpleLogger(component);
  }
}

// Create a singleton instance
export const logger = new SimpleLogger();

// Helper function to create component-specific loggers
export function getLogger(component: string) {
  return logger.child(component);
}

// Log a startup message
logger.info('Logger initialized');