import * as path from "path";

import { Agent } from "@repo/agency";

export class DemoAgent extends Agent {
  constructor() {
    super({
      name: "DemoAgent",
      description: path.resolve(__dirname, "./description.md"),
      instructions: path.resolve(__dirname, "./instructions.md"),
      tools: [],
    });
  }
}
