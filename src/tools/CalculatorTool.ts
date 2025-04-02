import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface CalculatorInput {
  operation: string;
  a: number;
  b: number;
}

class CalculatorTool extends MCPTool<CalculatorInput> {
  name = "calculator";
  description = "Perform basic arithmetic operations";

  schema = {
    operation: {
      type: z.enum(["add", "subtract", "multiply", "divide"]),
      description: "The arithmetic operation to perform (add, subtract, multiply, divide)",
    },
    a: {
      type: z.number(),
      description: "First number",
    },
    b: {
      type: z.number(),
      description: "Second number",
    },
  };

  async execute(input: CalculatorInput) {
    const { operation, a, b } = input;
    
    switch (operation) {
      case "add":
        return { result: a + b };
      case "subtract":
        return { result: a - b };
      case "multiply":
        return { result: a * b };
      case "divide":
        if (b === 0) {
          throw new Error("Cannot divide by zero");
        }
        return { result: a / b };
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  }
}

export default CalculatorTool; 