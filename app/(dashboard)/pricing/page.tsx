 
// 'use client'

// import { useAnimated } from "@/hooks/useAnimated";
// import React, { useRef } from "react";
// import { Check } from "lucide-react";

// const Subscription = () => {
//   const plans = [
//     {
//       name: "Free",
//       price: "₹0",
//       cadence: "/mo",
//       description: "Get started with Nexora at no cost.",
//       features: [
//         "Up to 100 API requests per month",
//         "Community support",
//         "Access to Nexora dashboard",
//       ],
//       buttonText: "Current Plan",
//       badge: "Current Plan",
//       active: true,
//       popular: false,
//     },
//     {
//       name: "Starter",
//       price: "₹765",
//       cadence: "/mo",
//       description: "Perfect for individuals exploring AI-powered support.",
//       features: [
//         "Up to 1,000 API requests per month",
//         "Basic support",
//         "Access to Nexora dashboard",
//       ],
//       buttonText: "Choose Starter",
//       badge: null,
//       active: false,
//       popular: false,
//     },
//     {
//       name: "Pro",
//       price: "₹2,465",
//       cadence: "/mo",
//       description: "Ideal for small teams who need reliable AI assistance.",
//       features: [
//         "Up to 10,000 API requests per month",
//         "Priority email support",
//         "Custom branding options",
//         "Advanced analytics",
//       ],
//       buttonText: "Choose Pro",
//       badge: "Most Popular",
//       active: false,
//       popular: true,
//     },
//     {
//       name: "Enterprise",
//       price: "Custom",
//       cadence: "",
//       description: "For large organizations needing custom solutions.",
//       features: [
//         "Unlimited API requests",
//         "Dedicated account manager",
//         "SLA & custom integrations",
//       ],
//       buttonText: "Contact Sales",
//       badge: null,
//       active: false,
//       popular: false,
//     },
//   ];

//   const root = useRef<HTMLDivElement>(null);
//   const s = useAnimated(root);

//   return (
//     <div
//       ref={root}
//       id="pricing"
//       className="min-h-screen bg-[#0b0f0d py-20 px-6 sm:px-8"
//     >
//       <div className="max-w-6xl mx-auto text-center">
//         <div className="dash-hero dash-cd flex flex-col items-center">
//           <span className="text-xs font-medium tracking-[0.2em] uppercase text-emerald-400/80 mb-3">
//             Pricing
//           </span>
//           <h1 className="text-4xl sm:text-5xl font-semibold text-white mb-4 tracking-tight">
//             Plans built to scale with you
//           </h1>
//         </div>

//         <p className="text-gray-400 dash-cd max-w-xl mx-auto mb-14 text-base">
//           Choose the plan that fits your needs. Scale your AI support
//           effortlessly, upgrade whenever you're ready.
//         </p>

//         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-stretch">
//           {plans.map((plan) => (
//             <div
//               key={plan.name}
//               className={`dash-reveal relative flex flex-col rounded-2xl p-8 text-left transition-all duration-300 hover:-translate-y-1 ${
//                 plan.popular
//                   ? "bg-gradient-to-b from-emerald-950/60 to-[#111713] border border-emerald-500/40 shadow-[0_0_40px_-12px_rgba(16,185,129,0.35)]"
//                   : "bg-[#121513] border border-white/10 hover:border-white/20"
//               }`}
//             >
//               {plan.badge && (
//                 <span
//                   className={`absolute -top-3 left-8 px-3 py-1 rounded-full text-xs font-medium tracking-wide ${
//                     plan.popular
//                       ? "bg-emerald-500 text-black"
//                       : "bg-white/10 text-gray-200 border border-white/15"
//                   }`}
//                 >
//                   {plan.badge}
//                 </span>
//               )}

//               <h2 className="text-lg font-semibold text-white mb-1">
//                 {plan.name}
//               </h2>
//               <p className="text-sm text-gray-400 mb-6 leading-relaxed min-h-[2.5rem]">
//                 {plan.description}
//               </p>

//               <div className="flex items-baseline gap-1 mb-8">
//                 <span className="text-3xl font-semibold text-white">
//                   {plan.price}
//                 </span>
//                 {plan.cadence && (
//                   <span className="text-sm text-gray-500">{plan.cadence}</span>
//                 )}
//               </div>

//               <ul className="space-y-3 mb-10 flex-1">
//                 {plan.features.map((feature, index) => (
//                   <li
//                     key={index}
//                     className="flex items-start gap-2.5 text-sm text-gray-300"
//                   >
//                     <Check
//                       className={`w-4 h-4 mt-0.5 shrink-0 ${
//                         plan.popular ? "text-emerald-400" : "text-gray-500"
//                       }`}
//                     />
//                     <span>{feature}</span>
//                   </li>
//                 ))}
//               </ul>

//               <button
//                 disabled={plan.active}
//                 className={`w-full py-3 px-6 rounded-lg text-sm font-medium transition-all ${
//                   plan.active
//                     ? "bg-white/5 text-gray-400 border border-white/10 cursor-default"
//                     : plan.popular
//                     ? "bg-emerald-500 text-black hover:bg-emerald-400"
//                     : "bg-white/10 text-white border border-white/15 hover:bg-white/15"
//                 }`}
//               >
//                 {plan.buttonText}
//               </button>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Subscription;



'use client'

import { useAnimated } from "@/hooks/useAnimated";
import React, { useRef } from "react";
import { Check } from "lucide-react";

const Subscription = () => {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      cadence: "/mo",
      description: "Get started with Nexora at no cost.",
      features: [
        "Up to 100 API requests per month",
        "Community support",
        "Access to Nexora dashboard",
      ],
      buttonText: "Current Plan",
      badge: "Current Plan",
      active: true,
      popular: false,
    },
    {
      name: "Starter",
      price: "₹765",
      cadence: "/mo",
      description: "Perfect for individuals exploring AI-powered support.",
      features: [
        "Up to 1,000 API requests per month",
        "Basic support",
        "Access to Nexora dashboard",
      ],
      buttonText: "Choose Starter",
      badge: null,
      active: false,
      popular: false,
    },
    {
      name: "Pro",
      price: "₹2,465",
      cadence: "/mo",
      description: "Ideal for small teams who need reliable AI assistance.",
      features: [
        "Up to 10,000 API requests per month",
        "Priority email support",
        "Custom branding options",
        "Advanced analytics",
      ],
      buttonText: "Choose Pro",
      badge: "Most Popular",
      active: false,
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      cadence: "",
      description: "For large organizations needing custom solutions.",
      features: [
        "Unlimited API requests",
        "Dedicated account manager",
        "SLA & custom integrations",
      ],
      buttonText: "Contact Sales",
      badge: null,
      active: false,
      popular: false,
    },
  ];

  const root = useRef<HTMLDivElement>(null);
  const s = useAnimated(root);

  return (
    <div
      ref={root}
      id="pricing"
      className="min-h-screen py-20 px-6 sm:px-8"
      style={{ backgroundColor: "#F6F5EF" }}
    >
      <div className="max-w-6xl mx-auto text-center">

        <div className="dash-hero dash-cd flex flex-col items-center!">
          <h1 className="text-4xl mb-4 text-[#17221d]! [text-shadow:-3px_2px_1px_#0000004d] "> Plans built to <em>  scale with you .</em></h1>
          
          <p className="text-gray-600 dash-cd w-full -mt-5 mb-12">
            Choose the plan that fits your needs. Scale your AI support
            effortlessly, upgrade whenever you're ready.
          </p>
        </div> 

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`dash-reveal cursor-pointer relative flex flex-col shadow-[-3px_2px_1px_#0000005e] rounded-3xl p-8 text-left transition-all duration-300 hover:-translate-y-1 ${plan.popular
                ? "bg-[#1a1f1b] border border-[#1a1f1b] "
                : "bg-white border border-[#e4e1d6]  hover:border-[#c9c5b5] shadow-sm"
                }`}
            >
              {plan.badge && (
                <span
                  className={`absolute -top-3 left-8 px-3 py-1 rounded-full text-xs font-medium tracking-wide ${plan.popular
                    ? "bg-[#cff45f] text-[#101410]"
                    : "bg-[#eeece2] text-[#1a1f1b] border border-[#e4e1d6]"
                    }`}
                >
                  {plan.badge}
                </span>
              )}

              <h2
                className={`text-lg font-semibold mb-1 ${plan.popular ? "text-white" : "text-[#1a1f1b]"
                  }`}
              >
                {plan.name}
              </h2>
              <p
                className={`text-sm mb-6 leading-relaxed min-h-[2.5rem] ${plan.popular ? "text-[#c8ccc5]" : "text-[#6b6f66]"
                  }`}
              >
                {plan.description}
              </p>

              <div className="flex items-baseline gap-1 mb-8">
                <span
                  className={`text-3xl font-semibold ${plan.popular ? "text-white" : "text-[#1a1f1b]"
                    }`}
                >
                  {plan.price}
                </span>
                {plan.cadence && (
                  <span
                    className={`text-sm ${plan.popular ? "text-[#9a9e94]" : "text-[#8a8e84]"
                      }`}
                  >
                    {plan.cadence}
                  </span>
                )}
              </div>

              <ul className="space-y-3 mb-10 flex-1">
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    className={`flex items-start gap-2.5 text-sm ${plan.popular ? "text-[#d7dad2]" : "text-[#3f433c]"
                      }`}
                  >
                    <Check
                      className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? "text-emerald-400" : "text-emerald-700"
                        }`}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={plan.active}
                className={`w-full py-3 px-6 rounded-lg text-sm font-medium transition-all ${plan.active
                  ? "bg-[#eeece2] text-[#8a8e84] border border-[#e4e1d6] cursor-default"
                  : plan.popular
                    ? "bg-[#cff45f] text-[#101410] hover:bg-[#87b304] "
                    : "bg-[#1a1f1b] text-white hover:bg-[#2a2f2a]"
                  }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Subscription;