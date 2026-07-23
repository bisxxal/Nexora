import { userModels } from "@/action/user.action";
import { useQuery } from "@tanstack/react-query";

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
