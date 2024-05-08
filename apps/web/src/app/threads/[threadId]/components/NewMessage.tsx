"use client";

import { PropsWithChildren, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sendNewMessage } from "@/services/threads";
import { useThreadContext } from "../contexts/ThreadContext";

interface Props {}

const NewMessage = ({}: PropsWithChildren<Props>) => {
  const { thread, newMessage } = useThreadContext();

  const [message, setMessage] = useState("");

  const onSendNewMessage = async () => {
    setMessage("");
    newMessage(message);
    await sendNewMessage(thread.id, message);
  };

  return (
    <div className="flex items-center space-x-2 ">
      <Input
        className="flex-1 w-full"
        placeholder="Escribe un mensaje..."
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSendNewMessage();
          }
        }}
      />
      <Button onClick={onSendNewMessage}>Enviar</Button>
    </div>
  );
};

export default NewMessage;
