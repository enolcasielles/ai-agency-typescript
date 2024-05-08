import { Message } from "./Message";
import { Thread } from "./Thread";

export interface ThreadDelegate {
  onNewMessage: (thread: Thread, message: Message) => void;
}
