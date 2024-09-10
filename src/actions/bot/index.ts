"use server";

import { auth, currentUser, getAuth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "../../../prisma/client";
import { BASE_URL } from "../../../constant/url";

import pineconeClient from "@/lib/pinecone";
import { indexName } from "@/lib/langchain";
import { ChatBot, PdfFile, botType } from "@prisma/client";
import { redirect } from "next/navigation";

import { backendClient } from "@/app/api/edgestore/[...edgestore]/route";

export const updateBotName = async (
  id: string,
  name: string,
  role: string,
  imageUrl: string
) => {
  // const { userId } = await auth();
  // const {userId} =
  // if (!userId) return;
  // const user = currentUser()
  // if (!user) return;
  try {
    const update = await prisma.chatBot.update({
      where: {
        id: id,
      },
      data: {
        name: name,
        role: role,
        botIcon: imageUrl,
      },
    });
    revalidatePath(`/edit-chatbot/${id}`);
    return { update, completed: true };
  } catch (err) {
    console.error("error occur while updating bot name and tagline", err);
  }
};

export const updateFirstQuestion = async (
  chatbotId: string,
  question: string
) => {
  // const { userId } = await auth();
  // if (!userId) return;
  if (!question && !chatbotId) return;

  try {
    const newFirstQuestion = await prisma.firstQuestion.create({
      data: {
        question: question,
        chatbot: {
          connect: { id: chatbotId },
        },
      },
    });

    console.log("this is the questions", newFirstQuestion);
    revalidatePath(`${BASE_URL}/edit-chat/${chatbotId}`);
    return newFirstQuestion;
  } catch (err) {
    console.error("error occur while add questions to the chatbot", err);
  }
};

export const getBot = async (id: string) => {
  // const { userId } = await auth();
  // if (!userId && !id) return;

  try {
    const bot = await prisma.chatBot.findUnique({
      where: {
        id: id,
      },
      include: {
        Source: {
          include: {
            pdfFile: true,
            characteristic: true,
          },
        },
        User: true,
        firstQuestion: true,
      },
    });

    return bot;
  } catch (err) {
    console.log("err occurs while fetching bot", err);
  }
};
export const RemoveSuggestionId = async (id: string) => {
  // const { userId } = await auth();
  if (!id) return;

  try {
    const remove = await prisma.firstQuestion.delete({
      where: {
        id: id,
      },
    });
    return remove;
  } catch (err) {
    console.error("error has occur while removing suggestion question");
  }
};

export const RemoveCharacteristicId = async (id: string) => {
  // const { userId } = await getAuth();
  if (!id) return;

  try {
    const remove = await prisma.characteristic.delete({
      where: {
        id: id,
      },
    });
    revalidatePath(`/edit-chatbot/${id}`);
    return remove;
  } catch (err) {
    console.error("error has occur while removing suggestion question");
  }
};

export const updateGreetings = async (id: string, greetings: string) => {
  // const { userId } = await auth();
  if (!id) return;

  try {
    const updated = await prisma.chatBot.update({
      where: {
        id: id,
      },
      data: {
        greetings: greetings,
      },
    });
    return updated;
  } catch (err) {
    console.error("error has occur while updating greetings ");
  }
};

export const updateColor = async (id: string, color: string) => {
  // const { userId } = await auth();
  if (!id) return;

  try {
    const updated = await prisma.chatBot.update({
      where: {
        id: id,
      },
      data: {
        userMessageBgColor: color,
      },
    });
    return updated;
  } catch (err) {
    console.error("error has occur while updating userBgcolorPallete ");
  }
};

export const updateTheme = async (id: string, theme: string) => {
  // const { userId } = await auth();
  if (!id) return;
  const themeEnum = theme as any;
  try {
    const updated = await prisma.chatBot.update({
      where: {
        id: id,
      },
      data: {
        theme: themeEnum,
      },
    });
    return updated;
  } catch (err) {
    console.error("error has occur while updating theme ");
  }
};

export const getChatBotByUser = async (id: string) => {
  const getUser = await currentUser();
  if (!id) {
    console.error("No ID provided");
    return null;
  }
  console.log("userId", id);
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: id },
    });
    console.log("user", user);
    let newUser;
    if (!user) {
      newUser = await prisma.user.create({
        data: {
          fullname: getUser?.fullName!,
          clerkId: getUser?.id!,
          type: "owner",
          email: getUser?.emailAddresses[0].emailAddress!,
        },
      });
    }

    const getBotByUser = await prisma.chatBot.findMany({
      where: { userId: user !== null ? user?.id : newUser?.id! },
      include: {
        Source: {
          include: {
            pdfFile: true,
            characteristic: true,
          },
        },
        customer: {
          include: {
            chatRoom: true,
          },
        },
        User: true,
        firstQuestion: true,
      },
    });
    console.log("getBotByUser", getBotByUser);
    //console.log("This is bot", getBotByUser);
    return getBotByUser;
  } catch (err) {
    console.error("An error occurred while getting chatbot by user: ", err);
    return null; // or return an empty array if that fits your use case better: return [];
  }
};

export const updateChatbotPosition = async (
  id: string,
  position: string,
  icon: string
) => {
  const { userId } = await auth();
  if (!userId && !id) return;

  try {
    const updated = await prisma.chatBot.update({
      where: {
        id: id,
      },
      data: {
        icon: icon,
        iconPosition: position,
      },
    });
    return updated;
  } catch (err) {
    console.error("An error occurred while update icon and iconPosition ", err);
    return null; // or return an empty array if that fits your use case better: return [];
  }
};

export const createNewChatbot = async (botName: string, fullName: string) => {
  try {
    // const { botName, fullName } = await req.json();
    const getUser = await currentUser();
    const { userId } = await auth();
    if (!userId || !botName) return;

    let user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          fullname: fullName,
          clerkId: userId,
          type: "owner",
          email: getUser?.emailAddresses[0]?.emailAddress!,
        },
      });
    }

    const chatbot = await prisma.chatBot.create({
      data: {
        name: botName,
        greetings: "Hey!, How can we help you today?",
        userId: user.id,
        role: "Customer support agent", // Associating the chatbot with the created/found user
      },
    });
    revalidatePath("/dashboard");

    return {
      chatbot,
      completed: true,
    };
  } catch (err: any) {
    console.log(
      "There is a unique constraint violation, a new user cannot be created with this email"
    );

    return { err, status: 500 };
  }
};

export const addCharacteristic = async (
  chatbotId: string,
  characteristic: string
) => {
  console.log(`Recieved source and processing it`);
  try {
    const { userId } = await auth();

    if (!userId || !characteristic || !chatbotId) return;

    let newCharacteristic;

    const chatbot = await getBot(chatbotId);

    if (chatbot?.sourceId !== null) {
      newCharacteristic = await prisma.characteristic.create({
        data: {
          characteristic,
          Source: {
            connect: { id: chatbot?.sourceId },
          },
        },
      });
    } else {
      const source = await prisma.source.create({
        data: {
          ChatBot: {
            connect: { id: chatbotId },
          },
        },
      });

      newCharacteristic = await prisma.characteristic.create({
        data: {
          characteristic,
          Source: {
            connect: { id: source.id },
          },
        },
      });
    }
    revalidatePath(`/edit-chatbot/${chatbotId}`);
    console.log("Characteristic added successfully", newCharacteristic);
    return newCharacteristic;
  } catch (err) {
    console.log("error occurs while trying to add new characteristics", err);
  }
};

export const deletePdf = async (id: string, chatbotId: string) => {
  // const { userId } = await auth();
  // if (!userId) throw new Error("unauthorized user");
  if (!id) return;

  try {
    const index = await pineconeClient.index(indexName);
    await index.namespace(id).deleteAll();

    await prisma.pdfFile.delete({
      where: {
        id: id,
      },
    });
    revalidatePath(`/edit-chatbot/${chatbotId}`);
  } catch (err) {
    console.log("error has occur while trying to delete pdfFile", err);
  }
};

export const deleteBot = async (sourceId: string, chatbot: ChatBot) => {
  const { userId } = await auth();

  if (!userId || !sourceId || !chatbot?.id) {
    console.error("Invalid parameters provided");
  }

  try {
    const index = await pineconeClient.index(indexName);

    const pdfFiles = await prisma.pdfFile.findMany({
      where: { sourceId },
    });

    for (const pdf of pdfFiles) {
      try {
        await index.namespace(pdf.id).deleteAll();
        console.log(`Successfully deleted all vectors for PDF: ${pdf.id}`);
      } catch (deleteError) {
        console.error(
          `Failed to delete vectors for PDF: ${pdf.id}`,
          deleteError
        );
      }
    }

    await prisma.pdfFile.deleteMany({
      where: { sourceId },
    });

    if (chatbot?.botIcon) {
      await backendClient.myPublicImages.deleteFile({
        url: chatbot?.botIcon,
      });
    }
    if (chatbot?.icon) {
      await backendClient.myPublicImages.deleteFile({
        url: chatbot?.icon,
      });
    }

    await prisma.chatBot.delete({
      where: { id: chatbot?.id },
    });
    // // Trigger revalidation for the chatbot view page
    redirect(`${BASE_URL}/view-chatbot`);

    // return { deleted, completed: true };
  } catch (err) {
    console.error("Error occurred while deleting bot", err);
    return { completed: false, error: "Failed to delete bot" };
  }
};
