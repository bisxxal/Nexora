'use client'
import { useEffect } from 'react';
import Head from 'next/head';

const BotennicaChatbot = () => {
  useEffect(() => {
    const config = {
      "chatbotId": "6904b6716d0cfdd42b226c9d",
      "userId": "user_34pgy5szQE9zw7lZdYamhEWUYMs",
      "position": "bottom-right",
      "theme": "light",
      "primaryColor": "#3b82f6",
      "showAvatar": true,
      "welcomeMessage": "Hello! How can I help you today?",
      "placeholder": "Type your message here...",
      "language": "en",
      "showWatermark": true,
      "watermarkText": "Powered by Botennica",
      "baseUrl": "https://botennica.com",
      "name": "super-bot"
};
    
    // Initialize Botennica
    if ((window as any).botennica && (window as any).botennica.init) {
      (window as any).botennica.init(config);
    }
  }, []);

  return (
    <Head>
      <link rel="stylesheet" href="https://botennica.com/botennica-chatbot.css" />
      <script src="https://botennica.com/botennica-chatbot.js" />
      <script src="https://botennica.com/marked.min.js" />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.botennicaConfig = {
  "chatbotId": "6904b6716d0cfdd42b226c9d",
  "userId": "user_34pgy5szQE9zw7lZdYamhEWUYMs",
  "position": "bottom-right",
  "theme": "light",
  "primaryColor": "#3b82f6",
  "showAvatar": true,
  "welcomeMessage": "Hello! How can I help you today?",
  "placeholder": "Type your message here...",
  "language": "en",
  "showWatermark": true,
  "watermarkText": "Powered by Botennica",
  "baseUrl": "https://botennica.com",
  "name": "super-bot"
};
            document.addEventListener('DOMContentLoaded', function() {
              if (window.botennica && window.botennica.init) {
                window.botennica.init(window.botennicaConfig);
              }
            });
          `,
        }}
      />
    </Head>
  );
};

export default BotennicaChatbot;