'use client'
import Loading from '@/components/ui/loading'
import { useGetModels } from '@/hooks/useModel'
import { Bot, BotIcon, DotIcon, RefreshCcw, BarChart2, PieChart as PieIcon, LayoutGrid, TrendingUp, LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { SLICE_COLORS } from '@/lib/utils'

 
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1f1b] border border-[#cff45f]/30 rounded-xl px-4 py-2 shadow-xl text-sm">
        <p className="font-semibold text-[#cff45f]">{label || payload[0].name}</p>
        <p className="text-white mt-0.5">
          Conversations: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};
//   Custom tooltip for bar chart  
const BarTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1f1b] border border-[#cff45f]/30 rounded-xl px-4 py-2 shadow-xl text-sm">
        <p className="font-semibold text-[#cff45f]">{label}</p>
        <p className="text-white mt-0.5">
          Conversations: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

//   Custom tooltip for pie chart  
const PieTooltip = ({ active, payload }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1a1f1b] border border-[#cff45f]/30 rounded-xl px-4 py-2 shadow-xl text-sm">
        <p className="font-semibold text-[#cff45f]">{payload[0].name}</p>
        <p className="text-white mt-0.5">
          Conversations: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const MyChatBot = () => {
  const { data, isLoading, refetch } = useGetModels()
  const [toallConversations, setTotalConversations] = useState<any>({});
  const root = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'monitoring'>('monitoring');


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


  const barData = useMemo(() => {
    if (!data?.res) return [];
    return data.res
      .map((m: any) => ({
        name: (m.name || 'Unnamed').toUpperCase(),
        conversations: m.times || 0,
      }))
      .sort((a: any, b: any) => b.conversations - a.conversations);
  }, [data]);

  const pieData = useMemo(() => {
    if (!data?.res) return [];
    const grouped: Record<string, number> = {};
    data.res.forEach((m: any) => {
      const src = (m.source || 'Unknown').toUpperCase();
      grouped[src] = (grouped[src] || 0) + (m.times || 0);
    });
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [data]);

  const topModel = useMemo(() => {
    if (!pieData.length) return null;
    return [...pieData].sort((a, b) => b.value - a.value)[0];
  }, [pieData]);

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
      gsap.fromTo(
        ".chart-reveal",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.15,
          delay: 0.45,
          ease: "power3.out",
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
            <h1 className='text-[#17221d]! [text-shadow:_-3px_2px_1px_#0000004d]'> {viewMode === 'cards' ? " My Agents " : 'Monitoring'}</h1>
          </div>
        </section>

        <div className='flex items-center gap-3'>

          <div className='flex gap-3 w-fit h-fit p-1 rounded-full border border-[#959795] '>

            <button className={`w-fit h-[40px] px-4 py-0 rounded-full flex items-center gap-2   ${viewMode === 'monitoring' ? 'text-[#cff45f] bg-[#17221d]' : 'text-[#959795]'}`}
              onClick={() => setViewMode('monitoring')}>
              <TrendingUp size={18} /> Analytics
            </button>
            <button className={`w-fit h-[40px] px-4 py-0 rounded-full flex items-center gap-2   ${viewMode === 'cards' ? 'text-[#cff45f] bg-[#17221d]' : ' text-[#959795] '}`}
              onClick={() => setViewMode('cards')}>
              <LayoutGrid size={18} /> Agents
            </button>
          </div>

          <button className='w-fit h-[40px] button-light bg px-4 py-0 !rounded-full flex items-center gap-2'
            onClick={() => refetch()}>Refetch <RefreshCcw size={20} />
          </button>
        </div>

      </div>

      <div className=' gap-5 flex items-center justify-evenly mb-10'>
        <div className=' dash-reveal w-[30%]   h-[100px] bg-[#f7f9f5] flex-1 border border-[#c9d0c5]  p-6  shadow-[-3px_2px_1px_#0000005e] center rounded-3xl flex-col'>
          <p className='texth1 text-xl '>    Total chatbots </p>
          <p className=' text-3xl text-[#64716a] font-bold'>{data?.res?.length}</p>
        </div>

        <div className=' dash-reveal w-[30%]   h-[100px] bg-[#f7f9f5] flex-1 border border-[#c9d0c5] p-6  shadow-[-3px_2px_1px_#0000005e] center rounded-3xl flex-col'>
          <p className='texth1 text-xl '>Total Conversations</p>
          <p className=' text-3xl text-[#64716a] font-bold'>{toallConversations?.totalTimes} / 100</p>
        </div>

        <div className='dash-reveal w-[30%]   h-[100px] bg-[#f7f9f5] flex-1 border border-[#c9d0c5]  p-6  shadow-[-3px_2px_1px_#0000005e] center rounded-3xl flex-col'>
          <p className='texth1 text-xl '>Context Sources</p>
          <p className=' text-3xl text-[#64716a] font-bold'>{toallConversations?.totalSources}</p>
        </div>
      </div>

      {/*   Monitoring view   */}
      {viewMode === 'monitoring' &&  (

        isLoading ? (
          <>
            <Loading boxes={2} child={' h-full  w-full rounded-3xl '} parent={' !px-5 !flex-col !flex-warp h-[740px] w-full '} />

          </>
        ) :
        <>

          <div className='px-5 mb-12  flex lg:grid-cols-3 gap-6'>

            {/* Bar Chart   */}
            <div className='chart-reveal bg-[#f7f9f5] flex-1 border border-[#c9d0c5] rounded-3xl p-6  shadow-[-3px_2px_1px_#0000005e]'>
              <div className='flex items-center gap-2 mb-5'>
                <div className='bg-[#cff45f] p-2 rounded-xl'>
                  <BarChart2 size={18} className='text-[#17221d]' />
                </div>
                <div>
                  <h2 className='font-bold text-[#17221d] text-base leading-tight'>Conversations per Chatbot</h2>
                  <p className='text-xs text-[#64716a]'>Total usage by agent</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} barSize={25} margin={{ top: 4, right: 10, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="1 1" stroke="#c9d0c5" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#64716a', fontSize: 10, fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: '#64716a', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: '#64716a18' }} />
                  <Bar dataKey="conversations"  radius={[4, 4, 0, 0]}>
                    {barData.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={SLICE_COLORS[index % SLICE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {barData[0] && (
                <p className='text-center text-xs text-[#64716a] mt-1 font-medium'>
                  🏆 Most active: <span className='text-[#17221d] font-bold'>{barData[0].name}</span> ({barData[0].conversations} chats)
                </p>
              )}

            </div>

            {/* Pie/Donut Chart — Conversations by AI model source */}
            <div className='chart-reveal bg-[#f7f9f5]  border border-[#c9d0c5] rounded-3xl p-6  shadow-[-3px_2px_1px_#0000005e]'>
              <div className='flex items-center gap-2 mb-5'>
                <div className='bg-[#64716a] p-2 rounded-xl'>
                  <PieIcon size={18} className='text-[#cff45f]' />
                </div>
                <div>
                  <h2 className='font-bold text-[#17221d] text-base leading-tight'>AI Model Usage</h2>
                  <p className='text-xs text-[#64716a]'>Which model drives the most conversations</p>
                </div>
              </div>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={230}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={SLICE_COLORS[index % SLICE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => (
                          <span style={{ color: '#64716a', fontSize: 12, fontWeight: 600 }}>{value}</span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {topModel && (
                    <p className='text-center text-xs text-[#64716a] mt-1 font-medium'>
                      🤖 Top model: <span className='text-[#17221d] font-bold'>{topModel.name}</span> ({topModel.value} conversations)
                    </p>
                  )}
                </>
              ) : (
                <div className='h-[230px] flex items-center justify-center text-[#64716a] text-sm'>
                  No conversation data yet
                </div>
              )}
            </div>
          </div>

          <div className='chart-reveal bg-[#f7f9f5] flex-1 border border-[#c9d0c5] rounded-3xl p-6  shadow-[-3px_2px_1px_#0000005e] p-'>
            <h3 className='font-bold mb-4'>Conversation Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={barData}>
                <defs>
                  <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9} />
                    <stop offset="50%" stopColor="#6366F1" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.05} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />

                <Area
                  type="monotone"
                  dataKey="conversations"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#colorConversations)"
                  fillOpacity={1}
                  dot={{
                    r: 4,
                    fill: "#3B82F6",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                  activeDot={{
                    r: 7,
                    fill: "#2563EB",
                    stroke: "#fff",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>

            </ResponsiveContainer>
          </div>
        </>

      )}

      {/*   Agent Cards    */}
      {viewMode === 'cards' && (
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
                          <p className=' mt-3 '>Create your first chatbot by uploading documents or adding text in the Dashboard section.</p>
                        </Link>
                      </div>
                    ) : (
                      <div className=' flex gap-2.5 flex-wrap '>
                        {data.res && data.res.map((model: any) => (
                          <div className={`border block abot border-[#c9d0c5] bg-[#f7f9f5] rounded-3xl  shadow-[-3px_2px_1px_#0000005e] p-3 px-4 w-[460px] ${model.status === 'PENDING' ? 'opacity-70 cursor-not-allowed' : ''}`} key={model.id}>
                            <div className=' flex items-center justify-between px-5 gap-2'>
                              <div className=' bg-[#cff45f] mb-3 p-2 w-fit rounded-xl'><Bot className=' text-[#64716a]' /></div>
                              <div className=' flex items-end gap-2 flex-col'>
                                {model?.status === 'PENDING' ? (
                                  <div className=' bg-yellow-500/50 text-yellow-700 px-3 py-1 rounded-full center w-fit text-sm font-medium'><LoaderCircle className='animate-spin mr-1' size={14} /> Processing</div>
                                ) : model?.status === 'FAILED' ? (
                                  <div className=' bg-red-500/50 text-red-700 px-3 py-1 rounded-full center w-fit text-sm font-medium'>Failed</div>
                                ) : (
                                  <div className=' bg-linear-to-tl from-green-600 to-emerald-30 button-green text-white green-600 pr-2 rounded-full center w-fit'><DotIcon className=' animate-pulse text-xl' color='green' size={28} /> Active</div>
                                )}
                                <p>Context from : {model?.source?.toUpperCase()}</p>
                                <p>Conversations : {model?.times}</p>
                              </div>
                            </div>
                            <p className='mt-5'>Name : {model?.name?.toUpperCase()}</p>
                            <p className=' mt-3 text-zinc-600 text-sm'>Site Id : {model.collection_name}</p>
                            <p className=' mt-3 text-zinc-600 text-sm'>Model id : {model.id}</p>
                            <p className=' mt-3 text-red-600  text-sm '>Last active at : {model.updated_at.toLocaleString('en-US')}</p>
                            <p className=' mt-3 text-zinc-600 text-sm'>Created at : {model.created_at.toLocaleString('en-US')}</p>

                           {  model.status !== 'FAILED' && <Link href={model.status === 'PENDING' || model.status === 'FAILED' ? '#' : `embed?siteId=${model.collection_name}&id=${model.id}&welcomeMessage=hi how can i assist you`}  
                            className='flex center  button-light w-full p-2 rounded-full mt-5 mb-1 '>Test agent </Link>}
                          </div>
                        ))}
                      </div>
                    )
                  }
                </ul>
              ) : (
                <div className=' center gap-3 '>
                  <p>no data found</p>
                </div>
              )
            }
          </div>
        )
      )}
    </div>
  )
}

export default MyChatBot
