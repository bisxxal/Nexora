import { Worker, Job } from 'bullmq';
import { YoutubeLoader } from "@langchain/community/document_loaders/web/youtube";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { QdrantClient } from "@qdrant/js-client-rest";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

const emmbeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-small",
    apiKey: process.env.OPENAI_API_KEY,
});

const qclient = new QdrantClient({
    url: process.env.QDRANT_URL!,
    apiKey: process.env.QDRANT_API_KEY!,
});

const connection = {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT!),
    password: process.env.REDIS_PASSWORD,
    tls: {}
};

const worker = new Worker('embedding-queue', async (job: Job) => {
    const { url, type, collectionName, mode, userId, base64Pdf, fileName, modelId } = job.data;
    let docs;

    console.log(`Processing job ${job.id} for model ${modelId} of type ${type}`);

    try {
        if (type === 'github') {
            if (!process.env.GITHUB_TOKEN) {
                throw new Error('GITHUB_TOKEN is not set');
            }
            const loader = new GithubRepoLoader(url, {
                branch: 'main',
                recursive: true,
                maxConcurrency: 5,
                unknown: 'warn',
                accessToken: process.env.GITHUB_TOKEN,
            });
            docs = await loader.load();
            const ignorePatterns = [/\.md$/, /node_modules/, /dist/, /build/, /tests?/, /\.github/, /\.vscode/, /yarn\.lock/, /package-lock\.json/];
            docs = docs.filter((doc: any) => !ignorePatterns.some((p) => p.test(doc.metadata.source)));

            const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1200, chunkOverlap: 200 });
            const splitDocs = await splitter.splitDocuments(docs);
            await QdrantVectorStore.fromDocuments(splitDocs, emmbeddings, { client: qclient, collectionName: collectionName });

        } else if (type === 'yt') {
            const loader = YoutubeLoader.createFromUrl(url, { language: "en", addVideoInfo: true });
            docs = await loader.load();
            const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
            const splitDocs = await splitter.splitDocuments(docs);
            const enrichedDocs = splitDocs.map((doc) => ({
                ...doc,
                metadata: { ...doc.metadata, video_url: url, source: "youtube" },
            }));
            await QdrantVectorStore.fromDocuments(enrichedDocs, emmbeddings, { client: qclient, collectionName: collectionName });

        } else if (type === 'web') {
            const loader = new CheerioWebBaseLoader(url);
            docs = await loader.load();
            const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
            const splitDocs = await splitter.splitDocuments(docs);
            const enrichedDocs = splitDocs.map((doc) => ({
                ...doc,
                metadata: { ...doc.metadata, source_url: url, source_type: "web" },
            }));
            await QdrantVectorStore.fromDocuments(enrichedDocs, emmbeddings, { client: qclient, collectionName: collectionName });

        } else if (type === 'text') {
            const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
            const rawDoc = new Document({ pageContent: url, metadata: { source_type: "text" } });
            const splitDocs = await splitter.splitDocuments([rawDoc]);
            await QdrantVectorStore.fromDocuments(splitDocs, emmbeddings, { client: qclient, collectionName: collectionName });

        } else if (type === 'pdf') {
            const pdfBuffer = Buffer.from(base64Pdf, 'base64');
            const pdfBlob = new Blob([pdfBuffer], { type: 'application/pdf' });
            const loader = new WebPDFLoader(pdfBlob);
            docs = await loader.load();
            const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
            const splitDocs = await splitter.splitDocuments(docs);
            await QdrantVectorStore.fromDocuments(splitDocs, emmbeddings, { client: qclient, collectionName: collectionName });
        }

        // Update the model to completed
        const res = await prisma.models.update({
            where: { id: modelId },
            data: { status: 'COMPLETED' }
        });

        console.log(res)

        console.log(`Successfully processed job ${job.id} for model ${modelId}`);

    } catch (error: any) {
        console.error(`Error processing job ${job.id}:`, error);
        // Mark as failed
        const res = await prisma.models.update({
            where: { id: modelId },
            data: { status: 'FAILED' }
        });
        console.log(res)
        throw error; // Re-throw to let BullMQ know it failed
    }
}, { connection });

worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed.`);
});

worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
});

console.log('Worker is running and listening for jobs...');
