import * as path from "path";

import { Agent } from "@repo/agency";
import { OperationTool } from "./tools/Operation";

export class MathAgent extends Agent {
  constructor() {
    super({
      name: "MathAgent",
      description: path.resolve(__dirname, "./description.md"),
      instructions: path.resolve(__dirname, "./instructions.md"),
      tools: [new OperationTool()],
    });
  }
}
