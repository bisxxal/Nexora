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
        console.log(error)
        return {
            status: 500,
            message: 'failed to load models',
            
        };
    }
}

export const NotebookModels = async () => {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return { status: 401, message: "Unauthorized" };
        }
        const res = await prisma.models.findMany({
            where: {
                userId: session.user.id,
                type:'notebook'
            },
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