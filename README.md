# MCP Fat Zebra

A Model Context Protocol (MCP) server that provides several useful tools for AI assistants.

## Features

This MCP server provides the following tools:

1. **Example Tool** - A simple example tool that processes messages
2. **Weather Tool** - Get current weather information for a location
3. **Calculator Tool** - Perform basic arithmetic operations
4. **URL Shortener Tool** - Create and resolve shortened URLs

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mcp-fat-zebra.git
cd mcp-fat-zebra

# Install dependencies
npm install

# Build the project
npm run build
```

## Usage

### Starting the Server

```bash
npm start
```

This will start the MCP server on the default port.

### Tool Usage

#### Example Tool

```json
{
  "name": "example_tool",
  "input": {
    "message": "Hello, world!"
  }
}
```

#### Weather Tool

```json
{
  "name": "get_weather",
  "input": {
    "location": "New York"
  }
}
```

#### Calculator Tool

```json
{
  "name": "calculator",
  "input": {
    "operation": "add",
    "a": 5,
    "b": 10
  }
}
```

#### URL Shortener Tool

Shorten a URL:

```json
{
  "name": "url_shortener",
  "input": {
    "action": "shorten",
    "url": "https://example.com/very/long/url/path/that/needs/shortening"
  }
}
```

Resolve a shortened URL:

```json
{
  "name": "url_shortener",
  "input": {
    "action": "resolve",
    "shortCode": "abc123"
  }
}
```

## Development

Add new tools by creating TypeScript files in the `src/tools` directory that export a class extending `MCPTool`.

```bash
# Add a new tool using the MCP CLI
npx mcp add tool MyNewTool
```

## License

MIT
