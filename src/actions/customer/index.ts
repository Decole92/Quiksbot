"use server";
import nodemailer from "nodemailer";
import prisma from "../../../prisma/client";
import { auth } from "@clerk/nextjs/server";

export const getUserCustomers = async (userId: string) => {
  if (!userId) return;
  console.log("userId from getUserCustomers", userId);

  try {
    const userWithCustomers = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        ChatBot: {
          include: {
            customer: {
              include: {
                chatRoom: {
                  include: {
                    message: true, // Fetch messages for each ChatRoom
                  },
                  orderBy: {
                    createdAt: "asc",
                  },
                },
              },
            },
          },
        },
      },
    });

    const customers =
      userWithCustomers?.ChatBot.flatMap((chatBot) =>
        chatBot.customer
          //   .filter((customer) => customer.chatRoom.length > 0)

          .map((customer) => ({
            ...customer,
            ...chatBot,
          }))
      ) || [];

    return customers.sort((a, b) => {
      const dateA = new Date(a.chatRoom[0]?.createdAt || 0);
      const dateB = new Date(b.chatRoom[0]?.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (err) {
    console.log(
      "err occurs while fetching customer and chatroom , chatmessage",
      err
    );
  }
};

export const getAllActiveChats = async (userId: string) => {
  if (!userId) {
    console.log("there's no userId", userId);
    return;
  }
  let activeChats;
  try {
    activeChats = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        ChatBot: {
          include: {
            customer: {
              include: {
                chatRoom: {
                  where: { live: true, mailed: true },
                  include: {
                    message: true,
                  },
                  orderBy: {
                    createdAt: "desc", // Sort by createdAt in descending order
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!activeChats) {
      return [];
    }

    const customers =
      activeChats.ChatBot.flatMap((chatBot) =>
        chatBot.customer
          .filter((customer) => customer.chatRoom.length > 0)
          .map((customer) => ({
            ...customer,
            ...chatBot,
          }))
      ) || [];

    return customers.sort((a, b) => {
      const dateA = new Date(a.chatRoom[0]?.createdAt || 0);
      const dateB = new Date(b.chatRoom[0]?.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });
  } catch (err) {
    console.log("err occur while trying to get active chat message", err);
  }
};

export const viewMessage = async (id: string) => {
  const { userId } = auth();
  if (!userId) return;

  try {
    const view = prisma.chatRoom.findUnique({
      where: {
        id: id,
      },
      include: {
        Customer: true,
        message: true,
      },
    });
    //console.log("view", view);
    return view;
  } catch (err) {
    throw new Error("error occurs while fetching chatroom");
  }
};
export const updateChatRoomMode = async (id: string) => {
  if (!id) return;

  try {
    const update = prisma.chatRoom?.update({
      where: {
        id: id,
      },
      data: {
        live: false,
      },
    });

    return update;
  } catch (err) {
    throw new Error("error occurs while fetching chatroom");
  }
};
export const onMailer = (email: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODE_MAILER_EMAIL,
      pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    to: email,
    subject: "Realtime Support",
    text: "One of your customers on Quiks bot, just switched on realtime mode",
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
