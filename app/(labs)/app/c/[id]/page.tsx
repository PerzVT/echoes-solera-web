import type { Metadata } from "next";
import { ChatApp } from "@/components/labs/chat/ChatApp";
import { stages, type Stage } from "@/components/labs/chat/agent";
import { findChat } from "@/components/labs/chat/data";
import { courier } from "@/components/labs/chat/font";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ at?: string; file?: string; notion?: string; type?: string; style?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: findChat(id).chat.title };
}

export default async function ChatPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { at, file, notion, type, style } = await searchParams;
  const stage = stages.find((x) => x === at) as Stage | undefined;
  return (
    <div className={courier.variable}>
      <ChatApp key={`${id}-${stage ?? ""}-${file ?? ""}-${notion ?? ""}`} chat={id} at={stage} file={file} notion={notion} type={type} style={style} />
    </div>
  );
}
