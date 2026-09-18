import { ChatbotUI } from "@/components/ChatbotUI";

export default async function ChatbotPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  
  return (
    <ChatbotUI
      collections={(searchParams.collections as string) || ""}
      welcomeMessage={(searchParams.welcomeMessage as string) || "Hello! How can I assist you today?"}
      id={(searchParams.id as string) || ""}
      sessionId={searchParams.sessionId as string | undefined}
      headerTitle={(searchParams.headerTitle as string) || "Nexora AI"}
      primaryColor={(searchParams.primaryColor as string) || "#bed96d"}
      buttonColor={searchParams.buttonColor as string | undefined}
      buttonTextColor={searchParams.buttonTextColor as string | undefined}
      theme={(searchParams.theme as "light" | "dark" | undefined) || "light"}
    />
  );
}
