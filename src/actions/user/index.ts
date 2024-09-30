"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "../../../prisma/client";
import { getBot } from "../bot";
import { ChatBot } from "@prisma/client";
import { NextResponse } from "next/server";
import { redirect } from "next/dist/server/api-utils";

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
  const user = await prisma?.user?.findUnique({
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

export const getUserCredits = async (id: string) => {
  // auth().protect();
  if (!id) return;

  try {
    const credits = await prisma.user.findFirst({
      where: {
        clerkId: id!,
      },
    });

    return credits?.credits;
  } catch (err) {
    console.log("error has occur while trying to get users get credit", err);
  }
};

export const blockAddress = async (value: string, chatBot: ChatBot) => {
  if (!value || !chatBot) return;

  try {
    const block = await prisma.blockPages.create({
      data: {
        address: value,
        chatbot: {
          connect: {
            id: chatBot?.id,
          },
        },
      },
    });
    return block;
  } catch (err) {
    console.log("error have occur while blocking page address", err);
  }
};

export const getBlocks = async (id: string) => {
  if (!id) throw new Error("no id is fetched by getBlocks");
  try {
    const getAddresses = await prisma.blockPages.findMany({
      where: {
        chatbotId: id,
      },
    });
    return getAddresses;
  } catch (err) {
    console.log("error occurs while try to fetch blocks address", err);
  }
};

export const RemovePageAddressById = async (id: string) => {
  if (!id) throw new Error("no id is fetched from removePageAddressById");

  try {
    const delAddress = await prisma.blockPages.delete({
      where: {
        id: id,
      },
    });
    return delAddress;
  } catch (err) {
    console.log("error occurs while try to remove blocks address", err);
  }
};

export const getBlocksById = async (id: string): Promise<string[]> => {
  if (!id) {
    throw new Error("Invalid or missing chatbotId");
  }

  try {
    const blockPages = await prisma.blockPages.findMany({
      where: {
        chatbotId: id,
      },
      select: {
        address: true, // Select the addresses directly
      },
    });

    if (!blockPages || blockPages.length === 0) {
      return [];
    }

    return blockPages.map((page) => page.address);
  } catch (err) {
    console.error("Error fetching blocked pages:", err);
    throw new Error("Failed to fetch blocked pages");
  }
};

export const getBotPosition = async (id: string) => {
  if (!id) {
    throw new Error("Invalid or missing chatbotId");
  }

  try {
    const botPosition = await prisma.chatBot.findUnique({
      where: {
        id: id,
      },
      select: {
        iconPosition: true,
      },
    });

    return botPosition?.iconPosition;
  } catch (err) {
    console.error("Error fetching blocked pages:", err);
    throw new Error("Failed to fetch blocked pages");
  }
};
