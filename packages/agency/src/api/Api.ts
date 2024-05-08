import express, { Request, Response } from "express";
import cors from "cors";
import { sseMiddleware } from "express-sse-middleware";

import { Agency } from "../agency/Agency";
import { Message } from "../threads/Message";
import { SseClient } from "./SseClient";

export class Api {
  clients: Array<SseClient> = [];

  constructor(
    public agency: Agency,
    public port: number,
  ) {}

  async init() {
    const agency = this.agency;

    const app = express();
    app.use(express.json());
    app.use(sseMiddleware);
    app.use(cors());

    app.get("/ping", async (_: Request, res: Response) => {
      try {
        res.send({ hello: "world" });
      } catch (err) {
        res.status(500).send({ error: err });
      }
    });

    app.get("/info", async (_: Request, res: Response) => {
      try {
        res.send({
          name: agency.name,
          mission: agency.mission,
          agents: agency.agents.map((agent) => ({
            name: agent.name,
            id: agent.id,
          })),
        });
      } catch (err) {
        res.status(500).send({ error: err });
      }
    });

    app.get("/threads", async (_: Request, res: Response) => {
      try {
        res.send(
          agency.threads.map((thread) => ({
            id: thread.id,
            from: thread.senderAgent.name,
            to: thread.recipientAgent.name,
          })),
        );
      } catch (err) {
        res.status(500).send({ error: err });
      }
    });

    app.get("/threads/:threadId", async (req: Request, res: Response) => {
      try {
        const { threadId } = req.params;
        const thread = agency.threads.find((thread) => thread.id === threadId);
        res.send({
          id: thread.id,
          from: thread.senderAgent.name,
          to: thread.recipientAgent.name,
        });
      } catch (err) {
        res.status(500).send({ error: err });
      }
    });

    app.get(
      "/threads/:threadId/messages",
      async (req: Request, res: Response) => {
        try {
          const { threadId } = req.params;
          const thread = agency.threads.find(
            (thread) => thread.id === threadId,
          );
          if (!thread) throw { error: "Thread not found" };
          const messages = thread.messages.map((message) => ({
            date: message.date,
            type: message.type,
            content: message.content,
            from: message.from.name,
            to: message.to.name,
          }));
          res.send(messages);
        } catch (err) {
          res.status(500).send({ error: err });
        }
      },
    );

    app.get(
      "/threads/:threadId/sseClient",
      async (req: Request, res: Response) => {
        try {
          const { threadId } = req.params;
          const sseClient = new SseClient(threadId, res.sse());
          this.clients.push(sseClient);
          req.on("close", () => {
            this.removeSseClient(threadId);
          });
        } catch (err) {
          res.status(500).send({ error: err });
        }
      },
    );

    app.post("/message", async (req: Request, res: Response) => {
      try {
        const { threadId, message } = req.body;
        agency.processUserMessage(threadId, message);
        res.send({ ok: true });
      } catch (err) {
        console.log(err);
      }
    });

    try {
      await app.listen({ port: this.port });
      console.log(`API listening on port ${this.port}`);
    } catch (err) {
      console.error(err);
    }
  }

  sendMessage(threadId: string, message: Message) {
    if (!this.clients) return;
    const sseClient = this.clients.find(
      (client) => client.threadId === threadId,
    );
    if (!sseClient) return;
    sseClient.send({
      date: message.date,
      type: message.type,
      content: message.content,
      from: message.from.name,
      to: message.to.name,
    });
  }

  removeSseClient(threadId: string) {
    if (!this.clients) return;
    const sseClient = this.clients.find(
      (client) => client.threadId === threadId,
    );
    if (!sseClient) return;
    sseClient.close();
    this.clients = this.clients.filter(
      (client) => client.threadId !== threadId,
    );
  }
}
