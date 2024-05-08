"use client";

import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { Message } from "@/types/Message";
import { getSseClient } from "@/services/threads";
import { Thread } from "@/types/Thread";

interface IContext {
  messages: Array<Message>;
  thread: Thread;
  newMessage: (message: string) => void;
}

const Context = createContext<IContext>(null);

export const useThreadContext = () => useContext(Context);

interface Props {
  thread: Thread;
  messages: Array<Message>;
}

export default function ThreadContextProvider({
  thread,
  messages: initialMessages,
  children,
}: PropsWithChildren<Props>) {
  const [messages, setMessages] = useState<Array<Message>>(initialMessages);

  const newMessage = (content: string) => {
    const message: Message = {
      temporal: true,
      date: new Date().toISOString(),
      type: "text",
      content,
      from: thread.from,
      to: thread.to,
    };
    setMessages((messages) => [...messages, message]);
  };

  useEffect(() => {
    const sseClient = getSseClient(thread.id);

    sseClient.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      setMessages((messages) =>
        [...messages, newMessage].filter((m) => m.temporal !== true),
      );
    };

    sseClient.onerror = function (error) {
      console.error("EventSource failed:", error);
      sseClient.close();
    };

    return () => {
      sseClient.close();
    };
  }, []);

  const value: IContext = {
    messages,
    thread,
    newMessage,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
}
