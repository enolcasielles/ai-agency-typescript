"use client";

import { format } from "date-fns";

import { cn } from "@/lib/utils";

import { useThreadContext } from "../contexts/ThreadContext";
import { useEffect, useRef } from "react";

const Messages = () => {
  const { messages, thread } = useThreadContext();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages]);

  return (
    <div className="flex-1 overflow-scroll scrollbar-hide" ref={containerRef}>
      <div className="p-4 grid gap-2">
        {messages.map((message) => {
          const fromUser = message.from === thread.from;
          return (
            <div
              className={cn(
                "flex items-start mt-4 pr-8",
                fromUser && "flex-row-reverse pr-0 pl-8",
              )}
            >
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900">
                <p className="text-sm leading-snug">{message.content}</p>
                <p
                  className={cn(
                    "mt-1 text-xs text-gray-500 dark:text-gray-400",
                    fromUser && "text-right",
                  )}
                >
                  {format(new Date(message.date), "dd/MM/yyyy HH:mm:ss")}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Messages;
