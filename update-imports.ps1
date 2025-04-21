Get-ChildItem -Path src -Recurse -Filter *.ts | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    
    # Replace imports
    $content = $content -replace 'import \{ ToolBase \} from "@modelcontext/typescript-sdk"', 'import { Tool } from "@modelcontextprotocol/sdk"'
    $content = $content -replace 'import \{ MCPTool \} from "mcp-framework"', 'import { Tool } from "@modelcontextprotocol/sdk"'
    
    # Replace class extensions
    $content = $content -replace 'extends ToolBase', 'extends Tool'
    $content = $content -replace 'extends MCPTool<.*?>', 'extends Tool'
    
    # Write the content back to the file
    Set-Content -Path $_.FullName -Value $content
}