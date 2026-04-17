import stripe from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { getUserByCustomer } from "@/actions/user";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";

type Plans = "STANDARD" | "PRO" | "ULTIMATE";

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const body = await req.text();
  const signature = headersList.get("Stripe-Signature");

  if (!signature) {
    return new NextResponse("No signature", { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_KEY) {
    return new NextResponse("No STRIPE_WEBHOOK_KEY set", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_KEY!
    );
    // return NextResponse.json("Webhook resceived", { status: 200 });
  } catch (err) {
    return new NextResponse(`err ocurr on webhook ${err}`, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "payment_intent.succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer;

      const userDetails = await getUserByCustomer(customerId as string);

      const lineItems = await stripe.checkout.sessions.listLineItems(
        session.id
      );
      const priceId = lineItems?.data[0]?.price?.id;

      let plan: Plans;

      if (priceId === `${process.env.PRO_PRICING_ID}`) {
        plan = "PRO";
      } else if (priceId === `${process.env.ULTIMATE_PRICING_ID}`) {
        plan = "ULTIMATE";
      } else {
        plan = "STANDARD";
      }

      if (!userDetails) {
        return new NextResponse("User not found", { status: 505 });
      }

      await fetchMutation(api.billing.upsertSubscription, {
        userId: (userDetails as any)._id as any,
        plan,
      });

      break;
    }

    case "customer.subscription.deleted":
    case "subscription_schedule.canceled": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription?.customer as string;
      const userDetails = await getUserByCustomer(customerId as string);

      if (!userDetails) {
        return new NextResponse("User not found", { status: 505 });
      }

      await fetchMutation(api.billing.upsertSubscription, {
        userId: (userDetails as any)._id as any,
        plan: "STANDARD",
      });
      break;
    }

    default:
      return new NextResponse(`Unhandled event type: ${event.type}`, {
        status: 400,
      });
  }

  return NextResponse.json("Webhook resceived", { status: 200 });
}
