# MCP Fat Zebra Integration

This project provides a Mission Control Protocol (MCP) integration for Fat Zebra payment processing, implemented as a TypeScript/Node.js service with additional Python components.

## Project Overview

- TypeScript-based MCP server implementation
- Python-based agent integration
- Docker containerization support
- Terraform configurations for AWS deployment

## Prerequisites

- Node.js >= 22.0.0
- Python 3.7+
- Docker (for containerized deployment)
- Terraform (for AWS deployment)

## Installation

### Node.js Dependencies

```bash
npm install
```

### Python Dependencies

```bash
pip install -r requirements.txt
```

## Project Structure

```
.
├── src/               # TypeScript source code
│   ├── index.ts      # Main entry point
│   └── tools/        # MCP tool implementations
├── templates/         # Template files
├── docs/             # Documentation
├── dist/             # Compiled TypeScript output
└── terraform/        # Terraform deployment configurations
```

## Development

### Building the Project

```bash
npm run build   # Build TypeScript code
npm run watch   # Watch mode for development
```

### Running Locally

```bash
npm start
```

## Docker Deployment

### Building the Container

```bash
docker build -t mcp-fat-zebra .
```

### Running with Docker

```bash
docker run -it --rm mcp-fat-zebra
```

### Docker Compose

```bash
docker-compose up --build
```

## AWS Deployment with Terraform

### Configuration

1. Create a `terraform.tfvars` file:

```hcl
environment_name  = "dev"
image_tag         = "latest"
ecr_public_alias  = "your-ecr-public-alias"
vpc_id            = ""  # Optional
subnet_ids        = []  # Optional
```

### Deployment Steps

1. Initialize Terraform:

   ```bash
   terraform init
   ```

2. Preview changes:

   ```bash
   terraform plan
   ```

3. Apply configuration:
   ```bash
   terraform apply
   ```

### Infrastructure Components

- ECR Public repository
- VPC and networking (optional)
- ECS Cluster with Fargate
- Application Load Balancer
- CloudWatch Logs
- IAM roles and policies

## Environment Configuration

The project uses the following configuration files:

- `.env` - Environment variables
- `tsconfig.json` - TypeScript configuration
- `package.json` - Node.js project configuration

## Dependencies

### Node.js Dependencies

- mcp-framework: ^0.2.11
- node-fetch: ^3.3.2

### Python Dependencies

- anthropic >= 0.5.0
- fastapi >= 0.100.0
- uvicorn >= 0.22.0
- pydantic >= 2.0.0
- python-dotenv >= 1.0.0
- And others as specified in requirements.txt

## License

See the LICENSE file for details.

# Fat Zebra Agent Docker

This repository contains a Docker setup that integrates the mcp-fat-zebra MCP server with the fast-agent-fz Python agent.

## Prerequisites

- Docker and Docker Compose installed
- PowerShell 7 (for Windows users)
- Anthropic API key

## Getting Started

1. Clone this repository:

```
git clone https://github.com/yourusername/fast-agent-fz-docker.git
cd fast-agent-fz-docker
```

2. Run the start script to create necessary files and start the Docker container:

```powershell
./start.ps1
```

3. The first time you run the script, it will create a `.env` file. Edit this file to add your Anthropic API key:

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

4. Run the start script again to build and start the container:

```powershell
./start.ps1
```

5. Access the Fat Zebra Agent UI at: http://localhost:7860

## Testing

To run automated Playwright tests against the running Docker container:

```powershell
./test.ps1
```

The first time you run this script, it will:

1. Install Playwright if needed
2. Create a sample test in the tests directory
3. Run the test against the deployed Docker container

## Structure

The Docker container runs two services:

- **MCP Server (mcp-fat-zebra)**: A Node.js server providing MCP services
- **Fast Agent (fast-agent-fz)**: A Python Gradio app that connects to the MCP server

## Configuration

The configuration for the Fast Agent is generated automatically in the container. You can modify the Dockerfile or docker-compose.yml to customize the configuration.

## Logs

Logs are stored in the `logs` directory which is mounted as a volume in the Docker container.

## Stopping the Container

To stop the container:

```powershell
docker-compose down
```

## Troubleshooting

If you encounter issues:

1. Check the logs:

```powershell
docker-compose logs
```

2. Make sure you've set your Anthropic API key in the `.env` file

3. If the MCP server fails to start, you may need to check if port 7860 is already in use on your system.
