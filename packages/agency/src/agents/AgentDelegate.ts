import { Agent } from "./Agent";

export interface AgentDelegate {
  onUpdateAgent: (agent: Agent) => void;
}
