import { Thread as OpenAiThread } from "openai/resources/beta/threads/threads";
import { Run } from "openai/resources/beta/threads/runs/runs";

import { openaiClient } from "../openai/client";
import { User } from "../user/User";
import { Message, MessageType } from "./Message";
import { ThreadDelegate } from "./ThreadDelegate";
import { Agent } from "../agents/Agent";

type ThreadParams = {
  id: string;
  senderAgent: Agent | User;
  recipientAgent: Agent;
  delegate: ThreadDelegate;
};

const MAX_RETRIES = 3;

export class Thread {
  id: string;
  senderAgent: Agent | User;
  recipientAgent: Agent;
  delegate: ThreadDelegate;

  messages: Array<Message>;
  thread: OpenAiThread;
  run: Run;

  constructor({ id, senderAgent, recipientAgent, delegate }: ThreadParams) {
    this.id = id;
    this.senderAgent = senderAgent;
    this.recipientAgent = recipientAgent;
    this.delegate = delegate;
    this.messages = [];
  }

  async init() {
    if (this.id) {
      this.thread = await openaiClient.beta.threads.retrieve(this.id);
    } else {
      this.thread = await openaiClient.beta.threads.create();
      this.id = this.thread.id;
    }
  }

  async send(message: string, retries: number = 1): Promise<string> {
    if (!this.recipientAgent.id) throw new Error("Recipient agent not set");
    if (!this.thread) await this.init();
    await openaiClient.beta.threads.messages.create(this.id, {
      role: "user",
      content: message,
    });
    this.run = await openaiClient.beta.threads.runs.create(this.id, {
      assistant_id: this.recipientAgent.id,
    });
    this.addNewMessage(MessageType.Text, message);
    while (true) {
      await this.waitUntilDone();
      if (this.run.status === "completed") {
        const _message = await this.extractMessage();
        this.addNewMessage(MessageType.Text, _message, true);
        return _message;
      } else if (this.run.status === "requires_action") {
        await this.processAction();
      } else {
        const err = "Run failed: " + this.run.status;
        console.log(err);
        if (retries < MAX_RETRIES) {
          console.log("Retrying in 30s...");
          await new Promise((resolve) => setTimeout(resolve, 30000));
          return this.send(message, retries + 1);
        }
        const _message = this.generateFailedMessage();
        this.addNewMessage(MessageType.Text, _message, true);
        return _message;
      }
    }
  }

  private async waitUntilDone() {
    while (["queued", "in_progress", "cancelling"].includes(this.run.status)) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.run = await openaiClient.beta.threads.runs.retrieve(
        this.id,
        this.run.id,
      );
    }
  }

  private async extractMessage() {
    const messages = await openaiClient.beta.threads.messages.list(this.id);
    const content = messages.data[0].content[0];
    if (content.type === "text") {
      return content.text.value;
    } else {
      throw new Error(
        "Framework does not support messages different than text yet.",
      );
    }
  }

  private generateFailedMessage() {
    return "Lo siento pero no puedo procesar tu mensaje en este momento. Por favor inténtalo de nuevo más tarde o mira los logs de la aplicación para ver que puede estar pasando.";
  }

  private async processAction() {
    const toolsToExecute =
      await this.run.required_action.submit_tool_outputs.tool_calls;
    const toolsResults = [];
    for (const toolToExecute of toolsToExecute) {
      this.addNewMessage(
        MessageType.Action,
        `Acción requerida. Ejecutando la tool ${toolToExecute.function.name} con parámetros ${toolToExecute.function.arguments}`,
        true,
      );
      const toolName = toolToExecute.function.name;
      const tool = this.recipientAgent.tools.find((t) => t.name === toolName);
      const toolResult = tool
        ? await tool.run({
            ...JSON.parse(toolToExecute.function.arguments),
            callerAgent: this.recipientAgent,
          })
        : "ERROR: no existe ninguna herramienta con el nombre que has indicado. Inténtalo de nuevo con el nombre correcto. La lista de herramientas disponibles es la siguiente: " +
          this.recipientAgent.tools.map((t) => t.name).join(", ");
      this.addNewMessage(
        MessageType.Action,
        `${toolToExecute.function.name} completada. Respuesta: ${toolResult.toString()}`,
        true,
      );
      toolsResults.push({
        tool_call_id: toolToExecute.id,
        output: toolResult.toString(),
      });
    }
    this.run = await openaiClient.beta.threads.runs.submitToolOutputs(
      this.id,
      this.run.id,
      {
        tool_outputs: toolsResults,
      },
    );
  }

  private addNewMessage(type: MessageType, content: string, inverse = false) {
    const message: Message = {
      id: Math.random().toString(),
      date: new Date(),
      type,
      content,
      from: inverse ? this.recipientAgent : this.senderAgent,
      to: inverse ? this.senderAgent : this.recipientAgent,
    };
    this.messages.push(message);
    this.delegate.onNewMessage(this, message);
  }
}
