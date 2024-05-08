"use client";

import { Menu } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent } from "../ui/sheet";
import { PropsWithChildren } from "react";
import { Thread } from "@/types/Thread";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Props {
  agencyName: string;
  threads: Array<Thread>;
}

function SideBar({ agencyName, threads, children }: PropsWithChildren<Props>) {
  return (
    <div className="flex flex-col md:flex-row h-screen">
      <Sheet>
        <SheetTrigger className="md:hidden" asChild>
          <Menu className="m-4 cursor-pointer" />
        </SheetTrigger>
        <SheetContent side="left">
          <div className="grid gap-4 py-4">
            <Content agencyName={agencyName} threads={threads} />
          </div>
        </SheetContent>
      </Sheet>
      <div className="hidden md:block bg-gray-100 w-64 h-screen">
        <Content agencyName={agencyName} threads={threads} />
      </div>
      <div className="flex-1 h-full">{children}</div>
    </div>
  );
}

const Content = ({ agencyName, threads }: Props) => {
  const pathname = usePathname();
  return (
    <>
      <div className="flex justify-center pt-4">
        <a href="/">
          <div className="flex flex-col items-center">
            <h1 className="text-black text-3xl">{agencyName}</h1>
            <span className="text-gray-500">Conversaciones</span>
          </div>
        </a>
      </div>
      {threads.map((thread) => {
        const active = pathname === `/threads/${thread.id}`;
        return (
          <a href={`/threads/${thread.id}`}>
            <div
              className={cn(
                "flex items-center justify-center gap-2 text-black mt-4 p-4 hover:bg-slate-200",
                active && "bg-slate-200",
              )}
            >
              <span>
                {thread.from} - {thread.to}
              </span>
            </div>
          </a>
        );
      })}
    </>
  );
};

export default SideBar;
