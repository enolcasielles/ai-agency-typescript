import * as path from "path";

import { Agent } from "@repo/agency";

export class MainAgent extends Agent {
  constructor() {
    super({
      name: "MainAgent",
      description: path.resolve(__dirname, "./description.md"),
      instructions: path.resolve(__dirname, "./instructions.md"),
      tools: [],
    });
  }
}
