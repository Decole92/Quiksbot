import stripe from "@/lib/stripe";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import type { Plans } from "@prisma/client";
import { getUserByCustomer } from "@/actions/user";
import prisma from "../../../../prisma/client";

export async function POST(req: NextRequest) {
  const headersList = headers();
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
    console.log("event", event);
    // return NextResponse.json("Webhook resceived", { status: 200 });
  } catch (err) {
    console.log("error occur while assessing the webhook", err);
    return new NextResponse(`err ocurr on webhook ${err}`, { status: 400 });
  }
  console.log("this is event", event);
  switch (event.type) {
    case "checkout.session.completed":
    case "payment_intent.succeeded": {
      //   const invoice = event.data?.object;
      console.log("payment_intent.succeeded called");
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
      const prevBilling = await prisma.billings.findFirst({
        where: {
          userId: userDetails?.id,
        },
      });
      if (prevBilling) {
        await prisma.billings.update({
          where: {
            userId: userDetails?.id,
          },
          data: {
            plan: plan,
          },
        });
      } else {
        await prisma.billings.create({
          data: {
            plan: plan,
            userId: userDetails?.id,
          },
        });
      }

      console.log("Billing record created successfully");
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

      await prisma.billings.update({
        where: {
          userId: userDetails.id,
        },
        data: {
          plan: "STANDARD",
        },
      });
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
      return new NextResponse(`Unhandled event type: ${event.type}`, {
        status: 400,
      });
  }

  return NextResponse.json("Webhook resceived", { status: 200 });
}
