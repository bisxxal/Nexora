import { Worker, Job } from 'bullmq';
import { QdrantClient } from "@qdrant/js-client-rest";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as cheerio from 'cheerio';
import pdfParse from 'pdf-parse';
import { YoutubeTranscript } from 'youtube-transcript';

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

async function loadGithubRepo(url: string, token: string): Promise<Document[]> {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) throw new Error("Invalid GitHub URL");
    const [_, owner, repo] = match;
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`;
    const res = await fetch(apiUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error("Failed to fetch repo tree");
    const data = await res.json();
    
    const docs: Document[] = [];
    const ignorePatterns = [/\.md$/, /node_modules/, /dist/, /build/, /tests?/, /\.github/, /\.vscode/, /yarn\.lock/, /package-lock\.json/, /\.(png|jpe?g|gif|svg|ico|webp)$/i];
    
    for (const file of data.tree) {
        if (file.type === "blob") {
            if (ignorePatterns.some((p) => p.test(file.path))) continue;
            // For a production app we might fetch in batches, but this is simple:
            const fileRes = await fetch(file.url, { headers: { Authorization: `Bearer ${token}` } });
            if (!fileRes.ok) continue;
            const fileData = await fileRes.json();
            if (fileData.encoding === "base64") {
                const content = Buffer.from(fileData.content, "base64").toString("utf-8");
                docs.push(new Document({ pageContent: content, metadata: { source: file.path } }));
            }
        }
    }
    return docs;
}

const worker = new Worker('embedding-queue', async (job: Job) => {
    const { url, type, collectionName, mode, userId, base64Pdf, fileName, modelId } = job.data;
    let docs: Document[] = [];

    console.log(`Processing job ${job.id} for model ${modelId} of type ${type}`);

    try {
        if (type === 'github') {
            if (!process.env.GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is not set');
            docs = await loadGithubRepo(url, process.env.GITHUB_TOKEN);
            const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1200, chunkOverlap: 200 });
            const splitDocs = await splitter.splitDocuments(docs);
            await QdrantVectorStore.fromDocuments(splitDocs, emmbeddings, { client: qclient, collectionName: collectionName });

        } else if (type === 'yt') {
            const transcript = await YoutubeTranscript.fetchTranscript(url);
            if (!transcript || transcript.length === 0) throw new Error("No transcript found");
            const text = transcript.map(t => t.text).join(' ');
            
            docs = [new Document({ pageContent: text, metadata: { source: url, title: `YouTube Video` } })];
            const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
            const splitDocs = await splitter.splitDocuments(docs);
            await QdrantVectorStore.fromDocuments(splitDocs, emmbeddings, { client: qclient, collectionName: collectionName });

        } else if (type === 'web') {
            const res = await fetch(url);
            const html = await res.text();
            const $ = cheerio.load(html);
            const text = $('body').text().replace(/\s+/g, ' ').trim();
            docs = [new Document({ pageContent: text, metadata: { source_url: url, source_type: "web" } })];
            
            const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
            const splitDocs = await splitter.splitDocuments(docs);
            await QdrantVectorStore.fromDocuments(splitDocs, emmbeddings, { client: qclient, collectionName: collectionName });

        } else if (type === 'text') {
            const rawDoc = new Document({ pageContent: url, metadata: { source_type: "text" } });
            docs = [rawDoc];
            const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
            const splitDocs = await splitter.splitDocuments(docs);
            await QdrantVectorStore.fromDocuments(splitDocs, emmbeddings, { client: qclient, collectionName: collectionName });

        } else if (type === 'pdf') {
            const pdfBuffer = Buffer.from(base64Pdf, 'base64');
            const data = await pdfParse(pdfBuffer);
            docs = [new Document({ pageContent: data.text, metadata: { source: "pdf", source_type: "pdf" } })];
            
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
