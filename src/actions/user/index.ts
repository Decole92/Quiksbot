"use server";

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

export const getUserByCustomer = async (customerId: string) => {
  const find = await prisma.user?.findFirst({
    where: {
      stripeId: customerId,
    },
  });
  console.log("userByStripeId", find);
  return find;
};
