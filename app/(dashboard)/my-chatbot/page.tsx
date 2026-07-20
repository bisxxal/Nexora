'use client'
import Loading from '@/components/ui/loading'
import { useGetModels } from '@/hooks/useModel'
import { Bot, BotIcon, DotIcon, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
 import gsap from 'gsap';

const MyChatBot = () => {
  const { data, isLoading, refetch } = useGetModels()
  const [toallConversations, setTotalConversations] = useState<any>({});
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {

    const s = data?.res?.reduce(
      (acc: any, curr: any) => {
         acc.totalTimes += curr.times || 0;

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

  useLayoutEffect(() => {
  const ctx = gsap.context(() => {
    gsap.fromTo(
      ".dash-reveal",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: "power3.out" }
    );
    gsap.fromTo(
      ".abot",
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.55,
        stagger: 0.08,
        delay: 0.28,
        ease: "power2.out",
      }
    );
  }, root);
  return () => ctx.revert();
}, []);

  return (
    <div ref={root} className=' max-w-[1400px] mx-auto min-h-screen pb-20'>

      <div className=' flex justify-between px-5 '>

        <section className="dash-hero -mt-">
          <div className="dash-reveal">
            <h1 className='text-[#17221d]! [text-shadow:_-3px_2px_1px_#0000004d]'>My Agents</h1>
           </div>
        </section>

         <button className='w-fit h-[40px] button-light bg px-4 py-0 !rounded-full center gap-3'
          onClick={() => refetch()}>Refetch <RefreshCcw size={20} />
        </button>
      </div>

      <div className=' flex items-center justify-evenly mb-10'>

        <div className=' dash-reveal w-[30%] shadow-xl shadow-[#64716a3b] h-[100px] bg-[#d9ddd4] border border-[#c9d0c5] center rounded-3xl flex-col'>
          <p className='texth1 text-xl '>    Total chatbots </p>
          <p className=' text-3xl text-[#64716a] font-bold'>{data?.res?.length}</p>
        </div>

        <div className=' dash-reveal w-[30%] shadow-xl shadow-[#64716a3b] h-[100px] bg-[#d9ddd4] border border-[#c9d0c5] center rounded-3xl flex-col'>
          <p className='texth1 text-xl '>Total Conversations</p>
          <p className=' text-3xl text-[#64716a] font-bold'>{toallConversations?.totalTimes} / 100</p>
        </div>
        <div className='dash-reveal w-[30%] shadow-xl shadow-[#64716a3b] h-[100px] bg-[#d9ddd4] border border-[#c9d0c5] center rounded-3xl flex-col'>
          <p className='texth1 text-xl '>Context Sources</p>
          <p className=' text-3xl text-[#64716a] font-bold'>{toallConversations?.totalSources}</p>
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
                   data.res && data.res.length === 0 ? (
                      <div className=' center flex-col gap-3 '>
                        <p>No ChatBot found</p>
                        <Link href={`/dashboard`} className=' center gap-3 flex-col'>
                          <BotIcon className=' bg-amber-200 p-3 rounded-2xl' size={48} />
                          <p className=' mt-3 '>Create your first chatbot by uploading documents or adding text in the  Dashboard  section.</p>
                        </Link>
                      </div>
                    ) : (
                      <div className=' flex gap-2.5 flex-wrap '>
                        {data.res && data.res.map((model: any) => (
                          <Link href={`embed?siteId=${model.collection_name}&id=${model.id}&welcomeMessage=hi how can i assist you`} className='border block abot border-[#c9d0c5]  card-0 rounded-2xl p-3 px-4 w-[460px] ' key={model.id}>

                            <div className=' flex items-center justify-between px-5 gap-2'>
                              <div className=' bg-[#cff45f] mb-3 p-2 w-fit rounded-xl'><Bot className=' text-[#64716a]' /> </div>
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