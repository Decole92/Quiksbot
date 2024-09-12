"use client";
import { CheckIcon } from "lucide-react";
import React, { useEffect, useTransition } from "react";
import { plans } from "../../../../constant/Features";
import { useUser } from "@clerk/nextjs";

import useSubcription from "@/hook/useSubscription";
import { Button } from "@/components/ui/button";
import getStripe from "@/lib/stripe-js";
import { createCheckoutSession, createStripePortal } from "@/actions/stripe";
import { redirect } from "next/dist/server/api-utils";
import { useRouter } from "next/navigation";

type userDetails = {
  name: string;
  email: string;
};
export default function Pricing() {
  const [isPending, startTransition] = useTransition();
  const { isOverFileLimit, hasActiveMembership } = useSubcription();
  const { user } = useUser();
  const router = useRouter();
  const handleUpgrade = (plan: string) => {
    if (!user) return;
    const userDetails = {
      name: user?.fullName,
      email: user?.primaryEmailAddress?.toString(),
    };

    startTransition(async () => {
      const stripe = await getStripe();
      console.log("this is stripe", stripe);
      if (hasActiveMembership === "PRO" || hasActiveMembership === "ULTIMATE") {
        const stripePortal = await createStripePortal();
        return router.push(stripePortal);
      }
      const sessionId = await createCheckoutSession(
        userDetails as userDetails,
        plan
      );
      console.log("this is sesssionId", sessionId);
      await stripe?.redirectToCheckout({
        sessionId: sessionId!,
      });
    });
  };

  return (
    <div className='bg-gray-100 min-h-screen py-12 mt-20'>
      <div className='md:max-w-5xl md:mx-auto lg:max-w-6xl lg:mx-auto w-full text-center px-4'>
        <h1 className='text-4xl font-thin text-gray-900'>Pricing Plans</h1>
        <p className='mt-4 text-lg text-gray-600'>
          Choose the plan that's right for your business. Our flexible pricing
          options make it easy to get started and scale as you grow.
        </p>

        <div className='mt-10 grid gap-8 md:grid-cols-3'>
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-lg shadow-lg p-5 ${
                plan.isMostPopular ? "ring-2 ring-[#E1B177]" : ""
              }`}
            >
              {plan.isMostPopular && (
                <span className='absolute top-0 right-0 bg-[#E1B177] text-white text-sm px-3 py-1 rounded-bl-lg'>
                  Most Popular
                </span>
              )}
              <h2 className='text-xl font-semibold text-gray-800'>
                {plan.name} Plan
              </h2>
              <h2 className='mt-4 text-gray-900 text-3xl font-bold'>
                {plan.price}
                {plan.name !== "Basic" && (
                  <span className='text-sm font-semibold leading-6 text-gray-600'>
                    /month
                  </span>
                )}
              </h2>

              <ul className='mt-6 space-y-3'>
                {plan.features.map((feature, idx) => (
                  <li key={idx} className='flex items-center  gap-2'>
                    <CheckIcon className='h-4 w-4 fill-primary' />
                    <p className='text-left'> {feature}</p>
                  </li>
                ))}
              </ul>
              {plan?.buttonText !== "" && (
                <Button
                  disabled={isPending}
                  onClick={() => handleUpgrade(plan?.name?.toUpperCase())}
                  className={`mt-6 block text-center py-2 px-4 rounded-md text-white w-full ${
                    plan.isMostPopular
                      ? "bg-[#E1B177] hover:bg-[#E1B177]"
                      : "bg-black/50 hover:bg-black"
                  }`}
                >
                  {hasActiveMembership === plan.name.toUpperCase()
                    ? "Manage Plan"
                    : plan.buttonText}
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}