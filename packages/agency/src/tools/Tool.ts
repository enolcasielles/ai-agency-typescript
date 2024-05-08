import { Agent } from "../agents/Agent";

type BaseRunProps = {
  callerAgent: Agent;
};

export type RunProps = BaseRunProps & Record<string, any>;

interface ToolParams {
  name: string;
  description: string;
  parameters: any;
}

export abstract class Tool {
  name: string;
  description: string;
  parameters: any;

  constructor({ name, description, parameters }: ToolParams) {
    this.name = name;
    this.description = description;
    this.parameters = parameters;
  }

  abstract run(parameters: RunProps): Promise<string>;
}
