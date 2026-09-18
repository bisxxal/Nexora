import { userModels, deleteModelAction } from "@/action/user.action";
import { useQuery, useMutation } from "@tanstack/react-query";

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

export const useDeleteModel = () => {
    return useMutation({
        mutationFn: async (modelId: string) => {
            const res = await deleteModelAction(modelId);
            if (res.status !== 200) {
                throw new Error(res.message);
            }
            return res;
        }
    });
};
