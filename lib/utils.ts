import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { FileText, Github, Globe2,   Youtube } from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const sources = [
  { name: 'Website', field: 'website', description: 'Crawl pages, docs and your help centre.', placeholder: 'https://yourcompany.com', icon: Globe2, color: 'mint' },
  { name: 'YouTube', field: 'youtube', description: 'Turn videos into searchable expertise.', placeholder: 'https://youtube.com/watch?v=...', icon: Youtube, color: 'peach' },
  { name: 'Text note', field: 'textData', description: 'Add FAQs, launch notes or private context.', placeholder: 'Paste a useful piece of context...', icon: FileText, color: 'sky' },
  { name: 'github', field: 'github', description: 'Train your agent on product docs, READMEs and code.', placeholder: 'https://github.com/user/repo', icon: Github, color: 'sky' },
] as const;


import {   Code2, Database,   Sparkles } from 'lucide-react';

export const formatedText = (res: string) => {

let formattedResponse = res ;

 
formattedResponse = formattedResponse.replace(/```([\s\S]*?)```/g, (match, code) => {
  return `
    <pre class="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto text-sm mt-2 mb-2">
      <code>${code.trim()}</code>
    </pre>
  `
})

 
formattedResponse = formattedResponse
  .split("**")
  .map((text, index) =>
    index % 2 !== 1
      ? text
      : `<span class='font-bold text-blue-500'>${text}</span>`
  )
  .join("")

// ✅ Replace * with line breaks
formattedResponse = formattedResponse.split("*").join("<br/>")

  
formattedResponse = formattedResponse.replace(
  /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
  (match, text, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-500">${text}</a>`
  }
);

// Then do your existing regex for back-ticked URLs or just protocols
formattedResponse = formattedResponse.replace(
  /`(https?:\/\/[^\s`]+|https?:)`/g,
  (match, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-400 underline hover:text-blue-500">${url}</a>`
  }
);



// ✅ Handle inline code (non-link)
formattedResponse = formattedResponse.replace(/`([^`]+)`/g, (match, code) => {
  // If it’s not a link, render inline code style
  if (code.startsWith("http")) return match // skip — already handled above
  return `<code class="bg-gray-800 text-amber-300 px-1 py-0.5 rounded">${code}</code>`
})


return formattedResponse;
}


export const navItems = ['Product', 'Solutions', 'Resources', 'Pricing'];
export const features = [
  ['Everything knows its place', 'Import your docs, site, help centre, PDFs and product data. Nexora keeps every answer grounded in the sources you trust.', Database],
  ['A voice that sounds like you', 'Set tone, guardrails and escalation rules in one visual workspace. Your agent stays useful, on-brand and on task.', Sparkles],
  ['One line. Every page.', 'Publish a beautifully native chat experience with one lightweight script. No engineering queue required.', Code2],
];
export const stats = [['47%', 'fewer repetitive tickets'], ['3.2×', 'faster time to resolution'], ['24/7', 'always-on customer help'], ['< 2 min', 'to launch your first agent']];


export const SLICE_COLORS = [
  '#2563EB', // Blue
  '#7C3AED', // Purple
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#14B8A6', // Teal
  '#06B6D4', // Sky
  '#0EA5E9', // Light Blue
  '#6366F1', // Indigo
  '#A3E635', // Lime
];
