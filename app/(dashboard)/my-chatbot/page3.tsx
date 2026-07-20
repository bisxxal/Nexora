'use client'
import { useGetModels } from '@/hooks/useModel'
import { Bot, DotIcon, RefreshCcw, LayoutGrid, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap';
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// ─── Palette for pie slices ─────────────────────────────────────────────────
const SLICE_COLORS = [
  '#cff45f', '#64716a', '#a8c26c', '#4e9a6f',
  '#82ca9d', '#b2d8b2', '#6fa87a', '#3a7c54',
];

// ─── Custom tooltips ──────────────────────────────────────────────────────
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

const MyChatBot = () => {
  const { data, isLoading, refetch } = useGetModels()
  const [toallConversations, setTotalConversations] = useState<any>({});
  const [viewMode, setViewMode] = useState<'cards' | 'monitoring'>('monitoring');
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



  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".dash-reveal", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.65, stagger: 0.1, ease: "power3.out" });
      gsap.fromTo(".abot", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55, stagger: 0.08, delay: 0.28, ease: "power2.out" });
      gsap.fromTo(".chart-reveal", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.15, delay: 0.45, ease: "power3.out" });
    }, root);
    return () => ctx.revert();
  }, [viewMode]);

  return (
    <div ref={root} className='max-w-[1400px] mx-auto min-h-screen pb-20 px-5'>
      <div className='flex justify-between items-center py-10'>
        <div className="dash-reveal">
          <h1 className='text-[#17221d]'>My Agents</h1>
        </div>
        <div className='flex gap-3'>
          <button className={`w-fit h-[40px] px-4 py-0 rounded-full flex items-center gap-2 border ${viewMode === 'monitoring' ? 'bg-[#cff45f] text-[#17221d]' : 'bg-transparent'}`}
            onClick={() => setViewMode('monitoring')}>
            <TrendingUp size={18} /> Analytics
          </button>
          <button className={`w-fit h-[40px] px-4 py-0 rounded-full flex items-center gap-2 border ${viewMode === 'cards' ? 'bg-[#cff45f] text-[#17221d]' : 'bg-transparent'}`}
            onClick={() => setViewMode('cards')}>
            <LayoutGrid size={18} /> Agents
          </button>
          <button className='w-fit h-[40px] button-light bg px-4 py-0 !rounded-full flex items-center gap-2'
            onClick={() => refetch()}>Refetch <RefreshCcw size={20} />
          </button>
        </div>
      </div>

      {viewMode === 'monitoring' ? (
        <div className='dash-reveal space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
            <div className='shadow-xl shadow-[#64716a3b] h-[100px] bg-[#d9ddd4] border border-[#c9d0c5] flex items-center justify-center rounded-3xl flex-col'>
              <p className='text-xl font-bold text-[#64716a]'>Total chatbots</p>
              <p className='text-3xl text-[#17221d] font-black'>{data?.res?.length || 0}</p>
            </div>
            <div className='shadow-xl shadow-[#64716a3b] h-[100px] bg-[#d9ddd4] border border-[#c9d0c5] flex items-center justify-center rounded-3xl flex-col'>
              <p className='text-xl font-bold text-[#64716a]'>Total Conversations</p>
              <p className='text-3xl text-[#17221d] font-black'>{toallConversations?.totalTimes || 0}</p>
            </div>
            <div className='shadow-xl shadow-[#64716a3b] h-[100px] bg-[#d9ddd4] border border-[#c9d0c5] flex items-center justify-center rounded-3xl flex-col'>
              <p className='text-xl font-bold text-[#64716a]'>Context Sources</p>
              <p className='text-3xl text-[#17221d] font-black'>{toallConversations?.totalSources || 0}</p>
            </div>
          </div>
          
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6'>
            <div className='chart-reveal bg-[#d9ddd4] border border-[#c9d0c5] rounded-3xl p-6'>
               <h3 className='font-bold mb-4'>Conversation Distribution</h3>
               <ResponsiveContainer width="100%" height={300}>
                 <AreaChart data={barData}>
                   <defs><linearGradient id="colorC" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#cff45f" stopOpacity={0.8}/><stop offset="95%" stopColor="#cff45f" stopOpacity={0}/></linearGradient></defs>
                   <XAxis dataKey="name" />
                   <YAxis />
                   <Tooltip content={<CustomTooltip />} />
                   <Area type="monotone" dataKey="conversations" stroke="#cff45f" fillOpacity={1} fill="url(#colorC)" />
                 </AreaChart>
               </ResponsiveContainer>
            </div>
            <div className='chart-reveal bg-[#d9ddd4] border border-[#c9d0c5] rounded-3xl p-6'>
               <h3 className='font-bold mb-4'>Model Usage Source</h3>
               <ResponsiveContainer width="100%" height={300}>
                 <PieChart>
                    <Pie data={pieData} innerRadius={60} outerRadius={100} dataKey="value">
                      {pieData.map((_: any, idx: number) => <Cell key={idx} fill={SLICE_COLORS[idx % SLICE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                 </PieChart>
               </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className='flex gap-2.5 flex-wrap'>
          {data?.res?.map((model: any) => (
            <Link href={`embed?siteId=${model.collection_name}&id=${model.id}`} className='border block abot border-[#c9d0c5] rounded-2xl p-4 w-[460px]' key={model.id}>
              <div className='flex items-center justify-between mb-4'>
                <div className='bg-[#cff45f] p-2 rounded-xl'><Bot size={20} /></div>
                <div className='text-xs'>Active <DotIcon className='inline animate-pulse' color='green' size={20} /></div>
              </div>
              <p className='font-bold'>{model.name?.toUpperCase()}</p>
              <p className='text-sm text-zinc-600'>Source: {model.source?.toUpperCase()}</p>
              <p className='text-sm text-zinc-600'>Conversations: {model.times}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyChatBot