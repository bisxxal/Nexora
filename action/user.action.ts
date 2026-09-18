'use server'

import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";

export const userModels = async () => {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { status: 401, message: "Unauthorized" };
        }
        const res = await prisma.models.findMany({
            where: {
                userId: session.user.id,
                type:'bot'
            },
            orderBy:{
                created_at:'desc'
            }
        });

        if (res)
            return {
                status: 200,
                res
            };
        return {
            status: 400,
            message: 'No models found',
        };

    } catch (error) {
        return {
            status: 500,
            message: 'failed to load models',
            
        };
    }
}

export const deleteModelAction = async (modelId: string) => {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { status: 401, message: "Unauthorized" };
        }
        
        // Ensure the model belongs to the user
        const existing = await prisma.models.findUnique({
            where: { id: modelId }
        });
        
        if (!existing || existing.userId !== session.user.id) {
            return { status: 404, message: "Model not found or unauthorized" };
        }

        await prisma.models.delete({
            where: {
                id: modelId,
            }
        });

        return {
            status: 200,
            message: 'Model deleted successfully',
        };

    } catch (error) {
        return {
            status: 500,
            message: 'Failed to delete model',
        };
    }
}