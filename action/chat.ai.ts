'use server'
import { OpenAIEmbeddings } from "@langchain/openai";
import OpenAI from "openai";
import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantVectorStore } from "@langchain/qdrant";
import prisma from "@/lib/prisma";

const qclient = new QdrantClient({
    // url: process.env.QDRANT_URL!,
    // apiKey: process.env.QDRANT_API_KEY!,
    url: "http://localhost:6333",
});

const client = new OpenAI({
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey: process.env.GEMINI_API_KEY!,
});

const emmbeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY!,
});
export const chatAIAction = async (userQuary: string, collection: string, id:string) => {

    if (!userQuary || !collection) {
        return "Invalid parameters"
    }

    const vectorStore = await QdrantVectorStore.fromExistingCollection(emmbeddings, {
        client: qclient,
        collectionName: collection,
    })

    const vectorSearcher = vectorStore.asRetriever({
        k: 3,
    })
    const releventChunk = await vectorSearcher.invoke(userQuary);
    const SYSTEM_PROMPT = `
            You are an intelligent and helpful AI assistant designed to answer user queries using the context provided.

            Instructions:
            - Use only the information available in the given context to answer.
            - If the context does not fully answer the question, clearly state that and suggest what additional information might help.
            - Provide helpful, concise, and accurate answers.
            - When appropriate, include relevant external resources or links that may help the user.

            Context:
            ${JSON.stringify(releventChunk, null, 2)}
            `;

    const response = await client.chat.completions.create({
        model: "gemini-2.5-flash",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
                role: "user",
                content: userQuary
            },
        ]
    });

  if(id){
      await prisma.models.update({
        where: {
            id ,
        },
        data: {
            times: {
                increment: 1,
            }
        }

    });
  }
  console.log(response.choices)
    return response.choices[0].message.content;
}

// Vishal B_web_collection