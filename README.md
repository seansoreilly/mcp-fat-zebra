# MCP Fat Zebra Integration

This project provides a Mission Control Protocol (MCP) integration for Fat Zebra payment processing, implemented as a TypeScript/Node.js service.

## Project Overview

- TypeScript-based MCP server implementation with Fat Zebra API integration
- Comprehensive API tools for Fat Zebra payment processing

## Prerequisites

- Node.js >= 22.0.0
- npm >= 11.3.0
- Fat Zebra API credentials

## Installation

### Node.js Dependencies

```bash
npm install
```

## Project Structure

```
.
├── src/                     # TypeScript source code
│   ├── index.ts             # Main entry point
│   ├── tools/               # MCP tool implementations for Fat Zebra API
│   │   ├── payment/         # Payment processing tools
│   │   ├── customer/        # Customer management tools
│   │   ├── transaction/     # Transaction tools
│   │   ├── webhook/         # Webhook handlers
│   │   └── batch/           # Batch operation tools
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   └── resources/           # MCP resources (e.g., documentation)
├── docs/                    # Markdown documentation
├── dist/                    # Compiled TypeScript output
├── tests/                   # Test files
├── logs/                    # Application logs
├── fixes/                   # Hotfixes and patches
└── testing/                 # Additional test resources
```

## Development

### Building the Project

```bash
npm run build   # Build TypeScript code
npm run watch   # Watch mode for development
```

### Running Locally

```bash
npm start       # Standard start
npm run start:win  # Windows-specific start script
```

## Testing

The project includes Jest tests for the TypeScript components:

```bash
npm test
```

## Fat Zebra Integration Features

The MCP server provides tools for various Fat Zebra API operations:

- Payment processing
- Card tokenization and storage
- Customer management
- Transaction reporting
- Webhook handling
- Batch operations
- Direct debit processing
- 3D Secure integration

## Environment Configuration

Create a `.env` file with the following variables:

```
FAT_ZEBRA_API_URL=https://gateway.pmnts-sandbox.io/v1.0
FAT_ZEBRA_API_KEY=your_api_key_here
FAT_ZEBRA_MERCHANT_ID=your_merchant_id
FAT_ZEBRA_USERNAME=your_username
FAT_ZEBRA_TOKEN=your_token
NODE_ENV=development
```

## Troubleshooting

If you encounter issues:

1. Check the logs in the `logs` directory
2. Verify your Fat Zebra API credentials
3. Ensure ports are not in use by other applications

## Windows Path Issues

If you encounter path resolution issues on Windows, use the Windows-specific start script:

```
npm run start:win
```

## Documentation

See the `docs` directory for detailed documentation on:

- API endpoints
- Testing procedures
- Security considerations
- Payment workflows
- Webhooks configuration

## License

See the LICENSE file for details.
