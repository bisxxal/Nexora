'use client'

import { useAnimated } from "@/hooks/useAnimated";
import React, { useRef } from "react";

const Subscription = () => {
  const plans = [
    {
      name: "Free",
      price: "₹0/mo",
      description: "Get started with Superbot X at no cost.",
      features: [
        "✅ Up to 100 API requests per month",
        "✅ Community support",
        "✅ Access to Superbot X dashboard",
      ],
      buttonText: "Current Plan",
      highlighted: true, // Active plan
      active: true,
    },
    {
      name: "Starter",
      price: "₹765/mo",
      description: "Perfect for individuals exploring AI-powered support.",
      features: [
        "✅ Up to 1,000 API requests per month",
        "✅ Basic support",
        "✅ Access to Superbot X dashboard",
      ],
      buttonText: "Choose Starter",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "₹2465/mo",
      description: "Ideal for small teams who need reliable AI assistance.",
      features: [
        "✅ Up to 10,000 API requests per month",
        "✅ Priority email support",
        "✅ Custom branding options",
        "✅ Advanced analytics",
      ],
      buttonText: "Choose Pro",
      highlighted: false,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large organizations needing custom solutions.",
      features: [
        "✅ Unlimited API requests",
        "✅ Dedicated account manager",
        "✅ SLA & custom integrations",
      ],
      buttonText: "Contact Sales",
      highlighted: false,
    },
  ];

  const root = useRef<HTMLDivElement>(null);

  const a = useAnimated(root)

  return (
    <div ref={root} className="min-h-screen   py-16 px-6 sm:px-8">
      <div className="max-w-6xl mx-auto text-center">

        <div className="dash-hero dash-cd justify-center! center">
        <h1 className="text-4xl text-center mb-4">Nexora Subscription Plans</h1>
        
        </div>
        <p className="text-gray-600 dash-cd  -mt-5 mb-12">
          Choose the plan that fits your needs. Scale your AI support effortlessly.
        </p>

        <div className="grid   md:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl dash-reveal hover:scale-[1.05] transition-all shadow-md border p-8 flex flex-col transition-all duration-200 ${
                plan.active 
                  ? "bordercolor card bg-[#d9ddd4] scale-105"
                  : "border-none bg-[#cb114015] hover:shadow-lg"
              }`}
            >
              <h2
                className={`text-2xl font-semibold mb-2 ${
                  plan.active ? "textbg" : "text-gray-900"
                }`}
              >
                {plan.name}
              </h2>
              <p className="text-gray-700 mb-4">{plan.description}</p>
              <div
                className={`text-3xl font-bold mb-6 ${
                  plan.active ? "textbg" : "textbg"
                }`}
              >
                {plan.price}
              </div>
              <ul className="text-left space-y-2 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-700">
                     
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                disabled={plan.active}
                className={`mt-auto py-3 px-6 rounded-lg font-medium transition ${
                  plan.active
                    ? "button-light !rounded-lg text-white cursor-default"
                    : "bg-[#cb11403e] text-white hover:bg-gray-200"
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
