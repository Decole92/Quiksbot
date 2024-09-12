"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "../../../prisma/client";
import stripe from "@/lib/stripe";
import { BASE_URL } from "../../../constant/url";
import { userDetails } from "../../../typing";

export const createCheckoutSession = async (
  userDetails: userDetails,
  plan: string
) => {
  //   auth().protect();
  const { userId } = await auth();
  if (!userId) throw new Error("There's no userId found");

  let stripeId;

  try {
    const user = await prisma.user.findUnique({
      where: {
        clerkId: userId!,
      },
    });
    if (!user) {
      throw new Error("There's no user found in the query with userId");
    }
    stripeId = user?.stripeId;

    if (!stripeId) {
      const customer = await stripe.customers.create({
        name: userDetails?.name,
        email: userDetails?.email,
        metadata: {
          userId,
        },
      });

      await prisma.user.update({
        where: {
          clerkId: userId!,
        },
        data: {
          stripeId: customer?.id,
        },
      });
      stripeId = customer?.id;
    }

    const planType =
      plan === "PRO"
        ? {
            price: `${process.env.PRO_PRICING_ID}`,
            quantity: 1,
          }
        : {
            price: `${process.env.ULTIMATE_PRICING_ID}`,
            quantity: 1,
          };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [planType],
      mode: "subscription",
      customer: stripeId,
      success_url: `${BASE_URL}/view-chatbot?upgrade=true`,
      cancel_url: `${BASE_URL}/pricing`,
    });
    return session?.id;
  } catch (err) {
    console.log(
      "err occurs at the server while creating stripe checkout session",
      err
    );
  }
};

export const createStripePortal = async () => {
  auth().protect();
  const { userId } = await auth();

  const user = await prisma.user.findUnique({
    where: {
      clerkId: userId!,
    },
  });
  const stripeId = user?.stripeId;
  if (!stripeId) throw new Error("not user found while creating portal");

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeId,
    return_url: `${BASE_URL}/pricing`,
  });
  return session?.url;
};
