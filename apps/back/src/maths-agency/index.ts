import path from "path";

import { Agency, Agent, User } from "@repo/agency";
import { MainAgent } from "./agents/MainAgent";
import { MathAgent } from "./agents/MathAgent";

export class MathAgency extends Agency {
  mainAgent: MainAgent;
  mathAgent: MathAgent;

  constructor() {
    super({
      name: "Maths Agency",
    });
    this.mainAgent = new MainAgent();
    this.mathAgent = new MathAgent();
  }

  getAgents(): Agent[] {
    return [this.mainAgent, this.mathAgent];
  }

  getAgentCommunications(agent: User): Agent[] {
    switch (agent) {
      case this.user:
        return [this.mainAgent];
      case this.mainAgent:
        return [this.mathAgent];
      default:
        return [];
    }
  }

  getDBPath(): string {
    return path.resolve(__dirname, "./db");
  }
}
