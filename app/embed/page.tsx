'use client';
import { useSearchParams } from "next/navigation";
import ChatbotPage from "../chatbot/page";
import { Suspense } from 'react';

function EmbedContent() {
  const search = useSearchParams();
  const col = search.get("siteId") || "";
  const welcomeMessage = search.get("welcomeMessage") || "Hello! How can I assist you today?";
  const id = search.get("id") || "";
  const sessionId = search.get("sessionId") || "";

  return <ChatbotPage collections={col} welcomeMessage={welcomeMessage} id={id} sessionId={sessionId}/>;
}

export default function EmbedPage() {
  return (
    <Suspense fallback={<>...</>}>
      <EmbedContent />
    </Suspense>
  );
}
