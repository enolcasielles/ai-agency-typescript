import * as fs from "fs";
import {
  Assistant,
  AssistantUpdateParams,
} from "openai/resources/beta/assistants/assistants";

import { openaiClient } from "../openai/client";
import { Tool } from "../tools/Tool";
import { Retrieval } from "../tools/Retrieval";
import { User } from "../user/User";
import { AssistantCreateParams } from "openai/src/resources/beta/index.js";
import { AgentDelegate } from "./AgentDelegate";

interface Props {
  id?: string;
  name: string;
  description: string;
  instructions: string;
  model?: string;
  tools: Array<Tool>;
  files?: Array<string>;
}

export class Agent extends User {
  description: string;
  instructions: string;
  model: string;
  tools: Array<Tool>;
  files: Array<string>;

  assistant: Assistant;
  delegate: AgentDelegate;

  constructor({
    id,
    name,
    description,
    instructions,
    model,
    tools,
    files,
  }: Props) {
    super(id, name);
    this.description = description ? fs.readFileSync(description, "utf-8") : "";
    this.instructions = instructions
      ? fs.readFileSync(instructions, "utf-8")
      : "";
    this.model = model ?? "gpt-4-turbo-2024-04-09";
    this.tools = tools ?? [];
    this.files = files ?? [];
  }

  async init() {
    if (this.id) {
      let openAiAssistant = await openaiClient.beta.assistants.retrieve(
        this.id,
      );
      const shouldUpdate = this.shouldUpdate(openAiAssistant);
      if (shouldUpdate) {
        openAiAssistant = await openaiClient.beta.assistants.update(
          this.id,
          this.generateBody() as AssistantUpdateParams,
        );
      }
      this.assistant = openAiAssistant;
      if (shouldUpdate) this.delegate.onUpdateAgent(this);
    } else {
      this.assistant = await openaiClient.beta.assistants.create(
        this.generateBody() as AssistantCreateParams,
      );
      this.id = this.assistant.id;
    }
  }

  setDelegate(delegate: AgentDelegate) {
    this.delegate = delegate;
  }

  addTool(tool: Tool) {
    this.tools.push(tool);
  }

  addFile(file: string) {
    this.files.push(file);
  }

  private generateBody(): AssistantCreateParams | AssistantUpdateParams {
    return {
      model: this.model,
      name: this.name,
      description: this.description,
      instructions: this.instructions,
      tools: this.tools.map((tool) => {
        if (tool instanceof Retrieval)
          return {
            type: "retrieval",
          };
        return {
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        };
      }),
    };
  }

  private shouldUpdate(openAiAssistant: Assistant): boolean {
    if (this.name !== openAiAssistant.name) return true;
    if (this.description !== openAiAssistant.description) return true;
    if (this.instructions !== openAiAssistant.instructions) return true;
    if (this.model !== openAiAssistant.model) return true;
    if (this.tools.length !== openAiAssistant.tools.length) return true;
    return false;
  }
}
