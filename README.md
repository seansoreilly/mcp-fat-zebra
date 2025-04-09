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
