"use server";

import { auth } from "@clerk/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";

export const getUserSub = async (userId: string) => {
  if (!userId) return;
  try {
    const user = await fetchQuery(api.users.getUserWithSubscription, { clerkId: userId });

    if (!user) return "STANDARD";

    if (!user.stripeId || !user.subscription) {
      return "STANDARD";
    }

    return user.subscription.plan;
  } catch (err) {
    console.error("Error while getting user subscription type:", err);
  }
};

export const getUserPdfFiles = async (userId: string) => {
  if (!userId) return;
  try {
    const count = await fetchQuery(api.users.getPdfFileCount, { clerkId: userId });
    return count;
  } catch (err) {
    console.error("Error while getting user PDF files:", err);
  }
};

export const getUserById = async (id: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!id) return;

  try {
    const user = await fetchQuery(api.users.getUserWithSubscription, { clerkId: id });

    return {
      openAikey: user?.openAIkey,
      deekseekAikey: user?.deepseekAiKey,
      anthropicAikey: user?.anthropicAiKey,
      xaiKey: user?.xaiKey,
      mailId: user?.mailId,
      email: user?.mail?.userEmail,
    };
  } catch (err) {
    throw new Error(
      "err occurs while getting getUserById from the server action",
      err as any
    );
  }
};

export const getUserByCustomer = async (customerId: string) => {
  try {
    const find = await fetchQuery(api.users.getUserByStripeId, { stripeId: customerId });
    return find;
  } catch (err) {
    throw new Error(
      "error occurs while trying to get userByStripeId in user server action",
      err as any
    );
  }
};

export const updateKey = async (
  key: string,
  useCustomKey: boolean,
  type: "openai" | "deekseekai" | "anthropicai" | "xai"
): Promise<void> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  try {
    const keyFields: Record<string, "openAIkey" | "deepseekAiKey" | "anthropicAiKey" | "xaiKey"> = {
      openai: "openAIkey",
      deekseekai: "deepseekAiKey",
      anthropicai: "anthropicAiKey",
      xai: "xaiKey",
    };

    const keyType = keyFields[type];

    if (keyType) {
      const value = useCustomKey && key && key !== "" ? key : null;

      await fetchMutation(api.users.updateApiKey, {
        clerkId: userId!,
        keyType,
        value,
      });
    }
  } catch (err) {
    throw new Error(
      "error has occur while trying to update openai key",
      err as any
    );
  }
};

export const getUserCredits = async (id: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!id) return;

  try {
    const credits = await fetchQuery(api.users.getUserCredits, { clerkId: id });
    return credits;
  } catch (err) {
    throw new Error(
      "error has occur while trying to get users get credit",
      err as any
    );
  }
};

export const blockAddress = async (value: string, chatBot: { id: string }) => {
  if (!value || !chatBot) return;

  try {
    const block = await fetchMutation(api.chatbots.addBlockPage, {
      chatbotId: chatBot.id as any,
      address: value,
    });
    return block;
  } catch (err) {
    throw new Error("error have occur while blocking page address", err as any);
  }
};

export const getBlocks = async (id: string) => {
  if (!id) throw new Error("no id is fetched by getBlocks");
  try {
    const getAddresses = await fetchQuery(api.chatbots.getBlockPagesByChatbotId, {
      chatbotId: id as any,
    });
    return getAddresses;
  } catch (err) {
    throw new Error(
      "error occurs while try to fetch blocks address",
      err as any
    );
  }
};

export const RemovePageAddressById = async (id: string) => {
  if (!id) throw new Error("no id is fetched from removePageAddressById");

  try {
    const delAddress = await fetchMutation(api.chatbots.removeBlockPage, {
      id: id as any,
    });
    return delAddress;
  } catch (err) {
    throw new Error(
      "error occurs while try to remove blocks address",
      err as any
    );
  }
};

export const getBlocksById = async (id: string): Promise<string[]> => {
  if (!id) {
    throw new Error("Invalid or missing chatbotId");
  }

  try {
    const blockPages = await fetchQuery(api.chatbots.getBlockPagesByChatbotId, {
      chatbotId: id as any,
    });

    if (!blockPages || blockPages.length === 0) {
      return [];
    }

    return blockPages.map((page: any) => page.address);
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
    const botPosition = await fetchQuery(api.chatbots.getBotPosition, {
      id: id as any,
    });

    return botPosition;
  } catch (err) {
    console.error("Error fetching blocked pages:", err);
    throw new Error("Failed to fetch blocked pages");
  }
};
