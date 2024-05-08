import { RunProps, Tool } from "@repo/agency";

interface OperationRunProps extends RunProps {
  operation: "add" | "subtract" | "multiply" | "divide";
  number1: number;
  number2: number;
}

export class OperationTool extends Tool {
  constructor() {
    super({
      name: "OperationTool",
      description:
        "Utiliza esta herramienta para realizar operaciones matemáticas. Debes especificar el tipo de operación que deseas realizar y los dos números que deseas operar. Puedes elegir entre 'add', 'subtract', 'multiply' o 'divide'.",
      parameters: {
        type: "object",
        properties: {
          operation: {
            type: "string",
            enum: ["add", "subtract", "multiply", "divide"],
            description:
              "La operación que deseas realizar. Puede ser 'add' para sumar, 'subtract' para restar, 'multiply' para multiplicar o 'divide' para dividir",
          },
          number1: {
            type: "number",
            description:
              "El primer valor de la operación matemática que deseas realizar",
          },
          number2: {
            type: "number",
            description:
              "El segundo valor de la operación matemática que deseas realizar",
          },
        },
        required: ["operation", "number1", "number2"],
      },
    });
  }

  async run(parameters: OperationRunProps): Promise<string> {
    const { operation, number1, number2 } = parameters;
    try {
      switch (operation) {
        case "add":
          return `El resultado de sumar ${number1} y ${number2} es ${number1 + number2}`;
        case "subtract":
          return `El resultado de restar ${number1} y ${number2} es ${number1 - number2}`;
        case "multiply":
          return `El resultado de multiplicar ${number1} y ${number2} es ${number1 * number2}`;
        case "divide":
          return `El resultado de dividir ${number1} entre ${number2} es ${number1 / number2}`;
        default:
          return "Por favor, especifica una operación válida: 'add', 'subtract', 'multiply' o 'divide'";
      }
    } catch (e) {
      console.log("Error in OperationTool.run", e);
      return "No he podido realizar la operación. Por favor, comprueba que los valores que me has proporcionado son correctos y vuelve a intentarlo.";
    }
  }
}
