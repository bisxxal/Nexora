'use server'
import { OpenAIEmbeddings } from "@langchain/openai";
import OpenAI from "openai";
import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantVectorStore } from "@langchain/qdrant";
import prisma from "@/lib/prisma";
import { MemoryClient } from "mem0ai";

const qclient = new QdrantClient({
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY!,
});

const mem0Client = new MemoryClient({ apiKey: process.env.MEM0_API_KEY! });

const client = new OpenAI({
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey: process.env.GEMINI_API_KEY!,
});

const emmbeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY!,
});

export const chatAIAction = async (userQuary: string, collection: string, id: string, sessionId: string = "default-session") => {

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

    // Retrieve memories from Mem0 using the unique session ID of the current end-user
    const memories = await mem0Client.search(userQuary, { filters: { user_id: sessionId } });
    const memoryString = memories.results?.map(m => m.memory).join('\n') || "No previous memory.";

    const SYSTEM_PROMPT = `
            You are an intelligent and helpful AI assistant designed to answer user queries using the context provided.
            You also have access to long-term memory about the user.

            Instructions:
            - Use only the information available in the given context and memory to answer.
            - If the context does not fully answer the question, clearly state that and suggest what additional information might help.
            - Provide helpful, concise, and accurate answers.
            - When appropriate, include relevant external resources or links that may help the user.

            Context:
            ${JSON.stringify(releventChunk, null, 2)}
            
            Memory:
            ${memoryString}
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

    const assistantMsg = response.choices[0].message.content || "";

    // Save interaction to Mem0
    await mem0Client.add(
        [
            { role: "user", content: userQuary },
            { role: "assistant", content: assistantMsg }
        ],
        { user_id: sessionId, metadata: { chatbotId: id } }
    );

    if (id) {
        await prisma.models.update({
            where: {
                id,
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