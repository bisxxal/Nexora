'use server'
 
import prisma from "@/lib/prisma"; 
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

import { embeddingQueue } from "@/lib/queue";

export const generateEmbeddings = async (url: string, type: 'yt' | 'text' | 'web' | 'github', collecttion: string, mode: 'bot' | 'notebook') => {
    const session = await getServerSession(authOptions);
    const userId = session?.user.id!;
    let name = "Untitled";

    if (!url && !collecttion && !type) {
        return "Invalid parameters"
    }

    // Try to guess a name if possible (the worker will refine it later if needed)
    if (type === 'github') 
        name = url.replace(/https:\/\/github\.com\//, '').replace(/\/$/, '').split('/').join('_');

    else if (type === 'yt') 
        name =  url.replace(/https:\/\/(www\.)?youtube\.com\/watch\?v=/, '').replace(/&.*$/, '');
    else if (type === 'web') 
        name =  url.replace(/https?:\/\/(www\.)?/, '').replace(/\/$/, '').split('/').join('_');
    
    else if (type === 'text') name = `text_document`;

    try {
        const model = await prisma.models.create({
            data: {
                collection_name: collecttion,
                source: type,
                userId,
                type: mode,
                name: name,
                status: 'PENDING'
            }
        });

        // Enqueue the job for the worker
        await embeddingQueue.add('generate-embedding', {
            url,
            type,
            collectionName: collecttion,
            mode,
            userId,
            modelId: model.id
        });

        return JSON.parse(JSON.stringify(model));
    } catch (error) {
        console.error("Error creating embedding job:", error);
        throw new Error("Failed to enqueue embedding job");
    }
}

 
export const LoadPdfEmbedingsFromBuffer = async (
    base64Pdf: string,
    fileName: string,
    mode: 'bot' | 'notebook'
) => {
    const session = await getServerSession(authOptions);

    const collectionName =
        (session?.user.name ?? 'Nexora') + '_pdf_collection' + Date.now();

    const model = await prisma.models.create({
        data: {
            collection_name: collectionName,
            source: 'pdf',
            userId: session?.user.id!,
            type: mode,
            name: fileName ? fileName.replace(/\.pdf$/i, '') : 'Untitled PDF',
            status: 'PENDING'
        },
    });

    await embeddingQueue.add('generate-pdf-embedding', {
        type: 'pdf',
        collectionName,
        mode,
        userId: session?.user.id,
        base64Pdf,
        fileName,
        modelId: model.id
    });

    return JSON.parse(JSON.stringify(model));
}