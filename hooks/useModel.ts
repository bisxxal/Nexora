import { NotebookModels, userModels } from "@/action/user.action";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

export const useGetModels = () => {

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['modelsinfo'],
        queryFn: async () => {
            return await userModels();  
        },
    });

    return {
        data, isLoading, refetch,
    };
};
