# MCP Fat Zebra Logging System

This document explains the logging system implemented in the MCP Fat Zebra project.

## Overview

The project uses [Pino](https://getpino.io/) for logging, which is a very fast, low-overhead Node.js logger. The logging system is designed to avoid interfering with the MCP client communication by redirecting all logs to files instead of using console.log statements.

## Logger Configuration

The logger is configured in `src/utils/logger.ts` with the following features:

- All logs are written to `./logs/mcp-fat-zebra.log`
- JSON-formatted logs for easy parsing
- Component-based logging for better organization
- Configurable log levels via environment variables

## Using the Logger

### Basic Usage

```typescript
import { logger } from '../utils/logger.js';

// Simple logging
logger.info('This is an info message');
logger.error('This is an error message');
```

### Component-Specific Logging

```typescript
import { getLogger } from '../utils/logger.js';

// Create a component-specific logger
const logger = getLogger('MyComponent');

// Log with component context
logger.info('This is an info message from MyComponent');
logger.error({ err: new Error('Something went wrong') }, 'Error in MyComponent');
```

### Logging with Context

```typescript
// Log with additional context
logger.info({ user: 'john', action: 'login' }, 'User logged in');

// Log errors with error objects
try {
  // Some code that might throw
} catch (err) {
  logger.error({ err }, 'Operation failed');
}
```

## Environment Variables

The logging system can be configured with the following environment variables:

- `LOG_LEVEL`: Set the minimum log level (default: 'info')
  - Valid values: 'trace', 'debug', 'info', 'warn', 'error', 'fatal'
- `DISABLE_LOGGING`: Set to 'true' to completely disable logging

## Log File Location

Logs are stored in the `./logs` directory at the root of the project. The directory is created automatically if it doesn't exist.

## Best Practices

1. **Use structured logging**: Include relevant objects in your log messages
   ```typescript
   // Good
   logger.info({ userId: '123', action: 'purchase' }, 'User made a purchase');
   
   // Avoid
   logger.info(`User ${userId} made a purchase`);
   ```

2. **Use appropriate log levels**:
   - `trace`: Very detailed information, useful for debugging
   - `debug`: Detailed information on application flow
   - `info`: Notable events in the application (default)
   - `warn`: Warning situations that don't cause errors
   - `error`: Error events that might still allow the application to continue
   - `fatal`: Critical errors that cause the application to terminate

3. **Always log errors with the error object**:
   ```typescript
   try {
     // Some code
   } catch (err) {
     logger.error({ err }, 'Operation failed');
   }
   ```

4. **Use component-specific loggers** for better organization and filtering