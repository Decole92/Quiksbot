"use server";
import nodemailer from "nodemailer";
import prisma from "../../../prisma/client";
import { auth } from "@clerk/nextjs/server";
import { Chat } from "openai/resources/beta/chat/chat.mjs";
import { AnyPtrRecord } from "dns";


type ChartDataEntry = {
  date: string;
  [botName: string]: number | string; // botName is dynamic, with the date being a string
};

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
      userWithCustomers?.ChatBot.flatMap((chatBot: any) =>
        chatBot?.customer
          //   .filter((customer) => customer.chatRoom.length > 0)

          .map((customer: any) => ({
            ...customer,
            ...chatBot,
          }))
      ) || [];

    return customers.sort((a: any, b: any) => {
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
      activeChats.ChatBot.flatMap((chatBot: any) =>
        chatBot.customer
          .filter((customer: any) => customer.chatRoom.length > 0)
          .map((customer:any) => ({
            ...customer,
            ...chatBot,
          }))
      ) || [];

    return customers.sort((a: any, b:any) => {
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

export const chartBarData = async() => {
  try {
    const chatbots = await prisma.chatBot.findMany({
      include: {
        customer: {
          include: {
            chatRoom: {
              select: {
                createdAt: true,
              },
            },
          
          },
        },
      },
    });
console.log("this is chatbots from server", chatbots)

    // Process the data to match the chart format
    const chartData =  chatbots?.reduce((acc:any, chatbot:ChatBot) => {
      chatbot?.customer?.forEach((customer:Customer) => {
        customer.chatRoom.forEach((chatRoom) => {
          const month = chatRoom.createdAt.toISOString().slice(0, 7); // Get YYYY-MM format
          const botName = chatbot.name;
    
          // Find or create the month entry
          let monthEntry = acc.find((entry: any) => entry.date === month);
          if (!monthEntry) {
            monthEntry = { date: month };
            acc.push(monthEntry);
          }
    
          // Increment the count for the specific chatbot
          monthEntry[botName as string] = (monthEntry[botName as string] || 0) as number + 1;
        });
      });
    
      return acc;
    }, [])
    
   
    const heatmapData = chatbots.flatMap((chatbot: any) =>
      chatbot.customer
        .filter((customer: Customer) => customer.lat && customer.lng) // Ensure lat/lng are present
        .map((customer: Customer) => ({
          lat: parseFloat(customer.lat!),
          lng: parseFloat(customer.lng!),
        }))
    );

    console.log("this is chartbar from server", chartData);
    console.log("this is heatmap data from server", heatmapData);



  // console.log("this is heatmap data from server", heatmapData);

  // console.log("this is chartbar from server & heatmapData", chartData, heatmapData)

  //return  chartData; // Return
  return { chartData, heatmapData };



  } catch (error) {
    console.error("Error fetching chart data:", error);

  }
}

