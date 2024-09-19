"use server";

import prisma from "../../../prisma/client";

import { auth } from "@clerk/nextjs/server";

import { BASE_URL } from "../../../constant/url";
import { Kufam } from "next/font/google";
import { revalidatePath } from "next/cache";

type userDetails = {
  name: string;
  email: string;
};

export const updateCredits = async (userId: string) => {
  try {
    const userBefore = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    console.log("User credits before update:", userBefore?.credits);

    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          increment: 1,
        },
      },
    });

    const userAfter = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    console.log("User credits after update:", userAfter?.credits);
  } catch (error) {
    console.error("Error updating credits:", error);
  }
};

export const startNewChat = async ({
  userDetails,
  id,
}: {
  userDetails: userDetails;
  id: string;
}) => {
  const { name, email } = userDetails;
  try {
    const chatbot = await prisma.chatBot.findUnique({
      where: {
        id: id,
      },
    });

    if (!chatbot) return;

    // console.log("about to get location here>>>");

    const response = await fetch(`${BASE_URL}/api/getLocation`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
      },
    });
    const data = await response.json();

    // console.log("this is data server side", data);
    const { country, city, lat, lng } = data;

    const customer = await prisma.customer.create({
      data: {
        name: name === "" ? "guest" : name,
        email: email === "" ? "guest" : email,
        country: country ? country : null,
        city: city ? city : null,
        lat: lat ? lat.toString() : null,
        lng: lng ? lng.toString() : null,

        Chatbot: {
          connect: { id: id },
        },
      },
    });

    // Log and return the customer ID
    console.log("customerId", customer.id, name, email);
    const customerId = customer?.id;

    //insert chatRoom

    const chatSession = await prisma.chatRoom.create({
      data: {
        Customer: {
          connect: {
            id: customerId,
          },
        },
      },
    });

    const chatSessionId = chatSession?.id;

    //insert initial message
    if (chatbot?.botType === "SalesBot" || chatbot?.botType === "Custom") {
      await prisma.chatMessage.create({
        data: {
          message: `${chatbot?.greetings}  `,
          role: "ai",
          ChatRoom: {
            connect: {
              id: chatSessionId,
            },
          },
          seen: true,
        },
      });
    }

    return chatSessionId;
  } catch (err) {
    console.log("err occurs while creating new chat room ", err);
  }
};

export const getChatMessages = async (chatRoomId: string) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: {
        chatRoomId: chatRoomId,
      },
    });

    // console.log("this is messages", messages);
    return messages;
  } catch (err) {
    console.log("err occurs while getting chat messages", err);
  }
};

export const getChatRoom = async (chatRoomId: string) => {
  try {
    const chatroom = await prisma.chatRoom.findUnique({
      where: {
        id: chatRoomId,
      },
      include: {
        message: true,
        Customer: true,
      },
    });

    // console.log("this is messages", messages);
    return chatroom;
  } catch (err) {
    console.log("err occurs while getting chat messages", err);
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

export const deleteChatRoomById = async (id: string) => {
  auth().protect();
  if (!id) throw new Error("there's no selectedChatroomId");
  try {
    const del = await prisma.chatRoom.findFirst({
      where: {
        id: id,
      },
    });
    const delCustomer = await prisma.customer.delete({
      where: {
        id: del?.customerId!,
      },
    });
    revalidatePath("/chatlogs");

    return {
      delCustomer,
      completed: true,
    };
  } catch (err) {
    console.log("err has occur while trying to delete chatroom..");
    return {
      completed: false,
    };
  }
};
