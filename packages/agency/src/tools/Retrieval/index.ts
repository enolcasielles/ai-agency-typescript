import { Tool } from "../Tool";

export class Retrieval extends Tool {
  constructor() {
    super({
      name: "Retrieval",
      description: "",
      parameters: {},
    });
  }

  run(): Promise<any> {
    throw new Error("Method not implemented.");
  }
}
