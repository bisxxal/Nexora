"use client"
import { generateEmbeddings } from "@/ai-utils/embeding"
import PdfUploader from "@/components/pdfupload"
import { toastSuccess } from "@/lib/toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { LoaderCircle } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

function DashBoardPage() {
    const { data } = useSession();
    const client = useQueryClient();

    const sumbitForm = async (formData: FormData) => {
        const youtube = formData.get("youtube") as string
        const website = formData.get("website") as string
        const textData = formData.get("textData") as string
        const github = formData.get("github") as string

        try {
            if (youtube) {
                const collectionName = data?.user.name + "_youtube_collection" + Date.now();
                createCollections.mutate({ textData: youtube, type: 'yt', collectionName })
            }
            if (github) {
                const collectionName = data?.user.name + "_github_collection" + Date.now();
                createCollections.mutate({ textData: github, type: 'github', collectionName })
            }
            if (website) {
                const collectionName = data?.user.name + "_web_collection" + Date.now();
                createCollections.mutate({ textData: website, type: 'web', collectionName })
            }
            if (textData) {
                const collectionName = data?.user.name + "_text_collection" + Date.now();
                createCollections.mutate({ textData, type: 'text', collectionName })
            }
        } catch (error) {
        }
    }

    const createCollections = useMutation({
        mutationFn: async ({ textData, type, collectionName }: { textData: string, type: 'web' | 'text' | 'yt' | 'github'; collectionName: string }) => {
            return await generateEmbeddings(textData, type, collectionName, 'bot');
        },
        onSuccess: (data) => {
            if (data) {
                toastSuccess('collection added successfully!');
                client.invalidateQueries({ queryKey: ['modelsinfo'] });
            } else {
                toastSuccess('failed to add collection ');
            }
        },
    });

    return (
        <div className=" w-full px-10">
            <h1 className=" text-center text-gray-600 font-bold text-4xl my-5">Dashboard</h1>
            <h2 className=" text-xl font-semibold">Upload Context</h2>
            <p className=" text-gray-500 text-sm my-3">Upload documents or add text to train your AI chatbot. The more context you provide, the better your chatbot will perform.</p>

            {
                createCollections.isPending && <div className=" w-full rounded-3xl text-blue-500 card h-[70px] flex items-center justify-center mb-4">
                    <LoaderCircle className=" animate-spin mr-2" />
                    <p className=" text-lg font-medium">Creating collection...</p>
                </div>
            }
            <PdfUploader mode="bot" />
            <form action={sumbitForm}>
                <div className="card  mb-6 p-4  py-5 rounded-3xl flex flex-col placeholder:text-gray-50">
                    <h2 className="text-2xl text-gray-700 font-bold mb-4">Add YouTube Content</h2>
                    <input
                        type="text"
                        name="youtube"
                        placeholder="https://youtu.be/54wpqk927T8?si=WHeiBI-vO8tUbnKC"
                        className="w-full p-2 mb-4 border-2 bordercolor outline-none placeholder:text-amber-900/30 !rounded-xl"
                    />
                    <button disabled={createCollections.isPending} className="buttonbg disabled:opacity-20 px-4 py-2 rounded text-white">Submit</button>
                </div>

                <div className="card  mb-6 p-4  py-5 rounded-3xl flex flex-col placeholder:text-gray-50">
                    <h2 className="text-2xl text-gray-700 font-bold mb-4">Add Website Content</h2>
                    <input
                        type="text"
                        name="website"
                        placeholder="https://bisxxal.tech"
                        className="w-full p-2 mb-4 border-2 bordercolor outline-none placeholder:text-amber-900/30 !rounded-xl"
                    />
                    <button disabled={createCollections.isPending} className="buttonbg disabled:opacity-20 px-4 py-2 rounded text-white">Submit</button>

                </div>

                <div className="card  mb-6 p-4  py-5 rounded-3xl flex flex-col placeholder:text-gray-50">
                    <h2 className="text-2xl text-gray-700 font-bold mb-4">Add github link</h2>
                    <input
                        type="text"
                        name="github"
                        placeholder="https://github.com/bisxxal"
                        className="w-full p-2 mb-4 border-2 bordercolor outline-none placeholder:text-amber-900/30 !rounded-xl"
                    />
                    <button disabled={createCollections.isPending} className="buttonbg disabled:opacity-20 px-4 py-2 rounded text-white">Submit</button>

                </div>


                <div className="card  mb-6 p-4  py-5 rounded-3xl flex flex-col placeholder:text-gray-50">
                    <h2 className="text-2xl text-gray-700 font-bold mb-4">Add text content</h2>
                    <textarea
                        rows={10}
                        name="textData"
                        className="w-full p-2 mb-4 border-2 bordercolor outline-none placeholder:text-amber-900/30 !rounded-xl"

                        placeholder="
Paste or type additional context here... (e.g., FAQ answers, product descriptions, company policies)
You can add up to 10,000 characters of text context."
                    />
                    <button disabled={createCollections.isPending} className="buttonbg disabled:opacity-20 px-4 py-2 rounded text-white">Submit</button>

                </div>

            </form>



        </div>
    )
}


export default DashBoardPage