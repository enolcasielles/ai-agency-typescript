import { PropsWithChildren } from "react";

import { getMessages, getThread } from "@/services/threads";
import { Message } from "@/types/Message";
import { Thread } from "@/types/Thread";

import Messages from "./components/Messages";
import ThreadContextProvider from "./contexts/ThreadContext";
import NewMessage from "./components/NewMessage";
import { redirect } from "next/navigation";

interface Props {
  params: {
    threadId: string;
  };
}

export default async function Component({ params }: PropsWithChildren<Props>) {
  const thread: Thread = await getThread(params.threadId);
  const messages: Array<Message> = await getMessages(params.threadId);

  if (!thread || !messages) redirect("/");

  return (
    <ThreadContextProvider messages={messages} thread={thread}>
      <main
        key="1"
        className="h-full p-8 flex flex-col w-full max-w-5xl m-auto gap-4"
      >
        <Messages />
        {thread.from === "User" && (
          <div className="w-full">
            <NewMessage />
          </div>
        )}
      </main>
    </ThreadContextProvider>
  );
}
