import fs from "fs";
import path from "path";

import { Agent } from "../agents/Agent";
import { Api } from "../api/Api";
import { Message } from "../threads/Message";
import { Thread } from "../threads/Thread";
import { TalkToAgent } from "../tools/TalkToAgent";
import { User } from "../user/User";
import { ThreadDelegate } from "../threads/ThreadDelegate";
import { AgentDelegate } from "../agents/AgentDelegate";

type AgencyParams = {
  name: string;
  mission?: string;
};

export abstract class Agency implements ThreadDelegate, AgentDelegate {
  name: string;
  mission: string;

  user: User;
  agents: Array<Agent>;
  threads: Array<Thread>;
  api: Api;
  dbPath: string;

  constructor({ name, mission }: AgencyParams) {
    this.name = name;
    this.mission = mission;
    this.user = new User("user", "User");
  }

  abstract getAgents(): Agent[];
  abstract getAgentCommunications(agent: User): Agent[];
  abstract getDBPath(): string;

  async run() {
    this.dbPath = this.getDBPath();
    this.agents = this.getAgents();
    if (!this.agents || this.agents.length === 0)
      throw new Error(
        "You can't init without defining any agents. User will talk to first defined agent",
      );
    for (const agent of this.agents) {
      agent.id = this.getSavedAgentId(agent);
      agent.setDelegate(this);
      if (this.mission)
        agent.instructions = `${this.mission}\n\n${agent.instructions}`;
      this.addCommonTools(agent);
      await agent.init();
    }
    this.threads = [];
    for (const agent of [this.user, ...this.agents]) {
      const recipientAgents = this.getAgentCommunications(agent);
      for (const recipientAgent of recipientAgents) {
        const thread = new Thread({
          id: this.getSavedThreadId(agent, recipientAgent),
          senderAgent: agent,
          recipientAgent,
          delegate: this,
        });
        thread.messages = this.getSavedMessages(thread.id);
        await thread.init();
        this.threads.push(thread);
      }
    }
    this.saveAgentsAndThreads();
  }

  async initApi(port: number) {
    this.api = new Api(this, port);
    await this.api.init();
  }

  async processUserMessage(threadId: string, message: string): Promise<string> {
    const thread = this.threads.find((thread) => thread.id === threadId);
    if (!thread) throw new Error("Thread not found");
    if (thread.senderAgent !== this.user)
      throw new Error("User can't send message to this thread");
    return await thread.send(message);
  }

  getThread(senderAgentName: string, recipientAgentName: string) {
    console.log("getThread", senderAgentName, recipientAgentName);
    return this.threads.find(
      (thread) =>
        thread.senderAgent.name === senderAgentName &&
        thread.recipientAgent.name === recipientAgentName,
    );
  }

  getAgentByName(agentName: string) {
    return this.agents.find((agent) => agent.name === agentName);
  }

  private addCommonTools(agent: Agent) {
    const recipientAgents = this.getAgentCommunications(agent);
    if (recipientAgents.length > 0) {
      agent.addTool(
        new TalkToAgent({
          senderAgent: agent,
          agency: this,
        }),
      );
    }
  }

  private getSavedAgentId(agent: Agent): string {
    const agentsDataStr = this.readFileContentOrCreate(
      path.resolve(this.dbPath, "./agents.json"),
    );
    const agentsData = agentsDataStr ? JSON.parse(agentsDataStr) : [];
    const agentData = agentsData.find((a: any) => a.name === agent.name);
    return agentData ? agentData.id : null;
  }

  private getSavedThreadId(senderAgent: User, recipientAgent: User): string {
    const threadsDataStr = this.readFileContentOrCreate(
      path.resolve(this.dbPath, "./threads.json"),
    );
    const threadsData = threadsDataStr ? JSON.parse(threadsDataStr) : [];
    const threadData = threadsData.find(
      (t: any) =>
        t.senderAgent === senderAgent.id &&
        t.recipientAgent === recipientAgent.id,
    );
    return threadData ? threadData.id : null;
  }

  private getSavedMessages(threadId: string): Message[] {
    const messagesDataStr = this.readFileContentOrCreate(
      path.resolve(this.dbPath, "./messages.json"),
    );
    const messagesData = messagesDataStr ? JSON.parse(messagesDataStr) : [];
    const messages = messagesData
      .filter((m: any) => m.threadId === threadId)
      .map((message: any) => {
        const fromUser = message.from === this.user.id;
        const toUser = message.to === this.user.id;
        return new Message({
          id: message.id,
          date: new Date(message.date),
          type: message.type,
          content: message.content,
          from: fromUser
            ? this.user
            : this.agents.find((a) => a.id === message.from),
          to: toUser ? this.user : this.agents.find((a) => a.id === message.to),
        });
      });
    return messages;
  }

  private saveAgentsAndThreads(): void {
    const agentsData = this.agents.map((agent) => ({
      name: agent.name,
      id: agent.id,
    }));
    fs.writeFileSync(
      path.resolve(this.dbPath, "./agents.json"),
      JSON.stringify(agentsData),
    );
    const threadsData = this.threads
      .filter((t) => t.id !== null)
      .map((t) => ({
        id: t.id,
        recipientAgent: t.recipientAgent.id,
        senderAgent: t.senderAgent.id,
      }));
    fs.writeFileSync(
      path.resolve(this.dbPath, "./threads.json"),
      JSON.stringify(threadsData),
    );
  }

  private readFileContentOrCreate(filePath: string) {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, "utf-8");
    } else {
      fs.writeFileSync(filePath, "");
      return null;
    }
  }

  /**
   * ThreadDelegate implementation
   */
  onNewMessage(thread: Thread, message: Message): void {
    if (!this.api) return;
    this.api.sendMessage(thread.id, message);
    const messagesDataStr = this.readFileContentOrCreate(
      path.resolve(this.dbPath, "./messages.json"),
    );
    const messages = messagesDataStr ? JSON.parse(messagesDataStr) : [];
    messages.push({
      id: message.id,
      threadId: thread.id,
      date: message.date.toISOString(),
      type: message.type,
      content: message.content,
      from: message.from.id,
      to: message.to.id,
    });
    fs.writeFileSync(
      path.resolve(this.dbPath, "./messages.json"),
      JSON.stringify(messages),
    );
  }

  /**
   * AgentDelegate implementation
   */
  onUpdateAgent(agent: Agent): void {
    const agentsDataStr = fs.readFileSync(
      path.resolve(this.dbPath, "./agents.json"),
      "utf-8",
    );
    const agentsData = JSON.parse(agentsDataStr);
    const agentData = agentsData.find((a: any) => a.id === agent.id);
    agentData.name = agent.name;
    fs.writeFileSync(
      path.resolve(this.dbPath, "./agents.json"),
      JSON.stringify(agentsData),
    );

    const threadsDataStr = fs.readFileSync(
      path.resolve(this.dbPath, "./threads.json"),
      "utf-8",
    );
    const threadsData = JSON.parse(threadsDataStr);
    const threadsDataFiltered = threadsData.filter(
      (t: any) => t.senderAgent !== agent.id && t.recipientAgent !== agent.id,
    );
    fs.writeFileSync(
      path.resolve(this.dbPath, "./threads.json"),
      JSON.stringify(threadsDataFiltered),
    );

    const messagesDataStr = fs.readFileSync(
      path.resolve(this.dbPath, "./messages.json"),
      "utf-8",
    );
    const messagesData = JSON.parse(messagesDataStr);
    const messagesDataFiltered = messagesData.filter(
      (m: any) => m.from !== agent.id && m.to !== agent.id,
    );
    fs.writeFileSync(
      path.resolve(this.dbPath, "./messages.json"),
      JSON.stringify(messagesDataFiltered),
    );
  }
}
