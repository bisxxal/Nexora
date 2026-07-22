'use client';
import { useSearchParams } from "next/navigation";
import ChatbotPage from "../chatbot/page";
import { Suspense } from 'react';

function EmbedContent() {
  const search = useSearchParams();

  const col           = search.get("siteId") || "";
  const id            = search.get("id") || "";
  const sessionId     = search.get("sessionId") || "";

  const welcomeMessage    = search.get("welcomeMessage")    || "Hello! How can I assist you today?";
  const headerTitle       = search.get("headerTitle")       || "Nexora AI";
  const primaryColor      = search.get("primaryColor")      || "#bed96d";
  const buttonColor       = search.get("buttonColor")       || "#bed96d";
  const buttonTextColor   = search.get("buttonTextColor")   || "#ffffff";
  const theme             = (search.get("theme") || "light") as "light" | "dark";

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <ChatbotPage
        collections={col}
        welcomeMessage={welcomeMessage}
        id={id}
        sessionId={sessionId}
        headerTitle={headerTitle}
        primaryColor={primaryColor}
        buttonColor={buttonColor}
        buttonTextColor={buttonTextColor}
        theme={theme}
      />
    </div>
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={<></>}>
      <EmbedContent />
    </Suspense>
  );
}
