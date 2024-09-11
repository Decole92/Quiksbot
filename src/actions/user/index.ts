"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "../../../prisma/client";
import { getBot } from "../bot";

export const getUserSub = async (userId: string) => {
  if (!userId) return;
  try {
    const foundUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
      include: {
        subscription: true, // Include Billings relation
      },
    });

    if (!foundUser) throw new Error("No users found with such id");

    if (!foundUser.stripeId || !foundUser.subscription) {
      return "STANDARD";
    }

    return foundUser.subscription.plan;
  } catch (err) {
    console.error("Error while getting user subscription type:", err);
  }
};

export const getUserPdfFiles = async (userId: string) => {
  if (!userId) return;
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  try {
    const userChatbots = await prisma.chatBot.findMany({
      where: {
        userId: user?.id, // Ensure the chatbots belong to the user
      },
      include: {
        Source: {
          include: {
            pdfFile: true, // Include related PdfFile models
          },
        },
      },
    });

    let totalPdfFiles = 0;

    userChatbots.forEach((chatbot) => {
      if (chatbot.Source) {
        totalPdfFiles += chatbot.Source.pdfFile.length;
      }
    });

    return totalPdfFiles;
  } catch (err) {
    console.error("Error while getting user PDF files:", err);
  }
};

export const getUserById = async (id: string) => {
  auth().protect();
  try {
    const user = await prisma.user.findUnique({
      where: {
        clerkId: id,
      },
    });
    return { openAikey: user?.openAIkey };
  } catch (err) {
    console.log(
      "err occurs while getting getUserById from the server action",
      err
    );
  }
};

export const getUserByCustomer = async (customerId: string) => {
  try {
    const find = await prisma.user?.findFirst({
      where: {
        stripeId: customerId,
      },
    });
    console.log("userByStripeId", find);
    return find;
  } catch (err) {
    console.log(
      "error occurs while trying to get userByStripeId in user server action",
      err
    );
  }
};

export const updateOpenAiKey = async (key: string, useCustomKey: boolean) => {
  auth().protect();
  const { userId } = await auth();
  try {
    const updateKey = await prisma.user.update({
      where: {
        clerkId: userId!,
      },
      data: {
        openAIkey: useCustomKey ? key : null,
      },
    });

    return updateKey;
  } catch (err) {
    console.log("error has occur while trying to update openai key", err);
  }
};
