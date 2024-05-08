import path from "path";

import { Agency, Agent, User } from "@repo/agency";
import { DemoAgent } from "./agents/DemoAgent";

export class DemoAgency extends Agency {
  demoAgent: DemoAgent;

  constructor() {
    super({
      name: "Demo Agency",
    });
    this.demoAgent = new DemoAgent();
  }

  getAgents(): Agent[] {
    return [this.demoAgent];
  }

  getAgentCommunications(agent: User): Agent[] {
    switch (agent) {
      case this.user:
        return [this.demoAgent];
      default:
        return [];
    }
  }

  getDBPath(): string {
    return path.resolve(__dirname, "./db");
  }
}
