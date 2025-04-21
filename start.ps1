# Start script for mcp-fat-zebra
# This ensures we're in the correct directory before starting the application

# Get the directory where this script is located
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Change to the project directory
Set-Location -Path $scriptDir

# Run npm start
npm start 