import { User } from "../user/User";

export enum MessageType {
  Text = "text",
  Action = "action",
  ActionResponse = "action_response",
}

interface Props {
  id: string;
  date: Date;
  type: MessageType;
  content: string;
  from: User;
  to: User;
}

export class Message {
  id: string;
  date: Date;
  type: MessageType;
  content: string;
  from: User;
  to: User;

  constructor({ id, date, type, content, from, to }: Props) {
    this.id = id;
    this.date = date;
    this.type = type;
    this.content = content;
    this.from = from;
    this.to = to;
  }
}
