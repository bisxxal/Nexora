'use client'
import Loading from '@/components/ui/loading'
import { useGetModels } from '@/hooks/useModel'
import { Bot, BotIcon, DotIcon, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const MyChatBot = () => {
  const { data, isLoading, refetchTimeTable } = useGetModels()
  const [toallConversations, setTotalConversations] = useState<any>({});

  useEffect(() => {

   const s = data?.res?.reduce(
  (acc: any, curr: any) => {
    // Add times
    acc.totalTimes += curr.times || 0;

    // Add source only if not seen before
    if (!acc.uniqueSources.has(curr.source)) {
      acc.uniqueSources.add(curr.source);
    }

    return acc;
  },
  { totalTimes: 0, uniqueSources: new Set() }
);

// Convert Set size into totalSources
const result = {
  totalTimes: s?.totalTimes,
  totalSources: s?.uniqueSources.size,
};

    setTotalConversations(result || {});
  }, [data])
  return (
    <div className=' w-full min-h-screen pb-20'>

      <div className=' flex justify-between px-5 '>
        <h1 className='text-gray-600 ml-5 text-4xl font-bold my-5 mt-10'>My Chatbots</h1>
        <button className='w-fit h-[40px] buttonbg px-4 py-0 !rounded-full center gap-3' onClick={() => refetchTimeTable()}>Refetch <RefreshCcw size={20} /> </button>
      </div>

      <div className=' flex items-center justify-evenly mb-10'>
        <div className=' w-[30%] shadow-xl h-[100px] bordercolor border center rounded-3xl flex-col'>
          <p className='textbg'>Total chatbots</p>
          <p className=' text-3xl text-green-500 font-bold'>{data?.res?.length}</p>
        </div>
        <div className=' w-[30%] shadow-xl h-[100px] bordercolor border center rounded-3xl flex-col'>
          <p className='textbg'>Total Conversations</p>
          <p className=' text-3xl text-green-500 font-bold'>{toallConversations?.totalTimes} / 100</p>
        </div>
        <div className=' w-[30%] shadow-xl h-[100px] bordercolor border center rounded-3xl flex-col'>
          <p className=' textbg'>Context Sources</p>
          <p className=' text-3xl text-green-500 font-bold'>{toallConversations?.totalSources}</p>
        </div>

      </div>
      {
        isLoading ? (
          <Loading boxes={3} child={' h-[300px]  w-[500px] rounded-2xl '} parent={' !flex-row !flex-warp h-[400px] w-full '} />
        ) : (
          <div>
            {
              data?.status === 200 ? (
                <ul>
                  {
                    data.res.length === 0 ? (
                      <div className=' center flex-col gap-3 '>
                        <p>No ChatBot found</p>
                        <Link href={`/dashboard`} className=' center gap-3 flex-col'>
                          <BotIcon className=' bg-amber-200 p-3 rounded-2xl' size={48} />
                          <p className=' mt-3 '>Create your first chatbot by uploading documents or adding text in the  Dashboard  section.</p>
                        </Link>
                      </div>
                    ) : (
                      <div className=' flex gap-2.5 flex-wrap '>
                        {data.res.map((model: any) => (
                          <Link href={`embed?siteId=${model.collection_name}&id=${model.id}&welcomeMessage=hi how can i assist you`} className=' card border bordercolor rounded-2xl p-3 px-4 w-[460px] ' key={model.id}>

                            <div className=' flex items-center justify-between px-5 gap-2'>
                              <div className=' bg-[#cb1140c5] mb-3 p-2 w-fit rounded-xl'><Bot className=' text-[#f9d3dde9]' /> </div>
                              <div className=' flex items-end gap-2 flex-col'>
                                <div className=' bg-green-500/50 text-green-600 pr-2 rounded-full center w-fit'> <DotIcon className=' animate-pulse text-xl' color='green' size={28} /> Active</div>                                <p>Contex from : {model?.source?.toUpperCase()}</p>
                                <p>Conversations : {model?.times}</p>
                              </div>
                            </div>
                            <p className='mt-5'>Name : {model?.name?.toUpperCase()}</p>
                            <p className=' mt-3 text-zinc-600 text-sm'>Site Id : {model.collection_name}</p>
                            <p className=' mt-3 text-zinc-600 text-sm'>Model id : {model.id}</p>
                            <p className=' mt-3 text-zinc-600 text-sm'>Last active at : {model.updated_at.toLocaleString("en-US")}</p>
                            <p className=' mt-3 text-zinc-600 text-sm'>Created at : {model.created_at.toLocaleString("en-US")}</p>
                          </Link>
                        ))}
                      </div>
                    )
                  }
                </ul>
              )
                : (
                  <div className=' center gap-3 '>
                    <p>no data found</p>

                  </div>
                )
            }
          </div>
        )
      }
      {/* <Loading boxes={2} child={' h-[220px]  w-[500px] rounded-2xl '} parent={' !flex-row !flex-wrap !justify-start h-[400px] w-full '} /> */}
    </div>
  )
}

export default MyChatBot