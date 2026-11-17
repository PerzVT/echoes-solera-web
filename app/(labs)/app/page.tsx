import type { Metadata } from "next";
import { ChatApp } from "@/components/labs/chat/ChatApp";
import { courier } from "@/components/labs/chat/font";

export const metadata: Metadata = { title: "New chat" };

export default function AppHomePage() {
  return (
    <div className={courier.variable}>
      <ChatApp />
    </div>
  );
}
