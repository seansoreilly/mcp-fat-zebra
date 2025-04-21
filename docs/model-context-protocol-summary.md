# Model Context Protocol (MCP) – Summary

## What is MCP?

The Model Context Protocol (MCP) is an open protocol that standardizes how applications provide context and tools to large language models (LLMs). MCP acts as a universal interface, enabling seamless integration between LLM-powered applications and a wide variety of data sources, tools, and workflows. It is often compared to a "USB-C port for AI applications," providing a consistent way to connect models to external resources.

## Architecture

MCP follows a client-server architecture with three main roles:

- **Hosts**: LLM applications (e.g., IDEs, chat interfaces) that initiate connections and want to access data or tools.
- **Clients**: Protocol connectors within the host application, maintaining 1:1 connections with servers.
- **Servers**: Lightweight programs or services that expose specific capabilities (data, tools, etc.) through the MCP standard.

MCP uses JSON-RPC 2.0 messages for communication, supporting stateful connections and capability negotiation between clients and servers.

## Key Features

- **Resources**: Expose data and content (e.g., files, databases) to LLMs.
- **Prompts**: Provide templated messages and workflows for user or model interaction.
- **Tools**: Allow LLMs to execute functions or actions via the server.
- **Sampling**: (Client feature) Enable server-initiated agentic behaviors and recursive LLM interactions.
- **Additional Utilities**: Configuration, progress tracking, cancellation, error reporting, and logging.

## Security and Trust Principles

MCP enables powerful integrations, so security and user control are central:

1. **User Consent and Control**: Users must explicitly consent to all data access and tool operations. Clear UIs should be provided for reviewing and authorizing activities.
2. **Data Privacy**: Hosts must obtain explicit user consent before sharing data with servers. Data should be protected with access controls and never transmitted elsewhere without consent.
3. **Tool Safety**: Tools can represent arbitrary code execution. Hosts must obtain explicit consent before invoking tools, and users should understand what each tool does.
4. **LLM Sampling Controls**: Users must approve any LLM sampling requests and control what prompts and results are visible to servers.

## Implementation Guidelines

- Build robust consent and authorization flows.
- Document security implications clearly.
- Implement strong access controls and data protections.
- Follow security best practices and consider privacy in all features.

## Learn More

- [Official MCP Website](https://modelcontextprotocol.io/introduction)
- [MCP Specification](https://spec.modelcontextprotocol.io/specification/)
- [GitHub Documentation](https://github.com/modelcontextprotocol/docs)

_Last updated: 2024-06-11_
