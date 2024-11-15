"use server";

import { auth, currentUser, getAuth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "../../../prisma/client";
import { BASE_URL } from "../../../constant/url";

import pineconeClient from "@/lib/pinecone";
import { indexName } from "@/lib/langchain";
import { ChatBot, PdfFile, botType } from "@prisma/client";
import { backendClient } from "@/lib/edgstore-server";
import { onMailer } from "../customer";

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
            webpage: true,
          },
        },
        appointment: true,
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

export const updateTheme = async (id: string, watermark: boolean) => {
  if (!id) return;
  try {
    const updated = await prisma.chatBot.update({
      where: {
        id: id,
      },
      data: {
        watermark: watermark,
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

      const welcomeMail = {
        from: process.env.NODE_MAILER_EMAIL,
        to: newUser?.email,
        subject: "🎉 Welcome to QUIKSBOT – Let's Get Started!",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Welcome to QUIKSBOT</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  color: #555;
                  background-color: #f4f4f4;
                }
                .container {
                  background-color: #ffffff;
                  border-radius: 10px;
                  padding: 20px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                }
                .header h1 {
                  color: #333;
                  font-size: 24px;
                  margin-top: 0;
                }
                .button {
                  background-color: #E1B177;
                  color: white;
                  padding: 12px 25px;
                  text-decoration: none;
                  border-radius: 5px;
                  display: inline-block;
                  font-weight: bold;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  margin: 20px 0;
                }
                .footer {
                  font-size: 14px;
                  color: #777;
                  border-top: 1px solid #eee;
                  padding-top: 15px;
                  text-align: center;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Welcome to QUIKSBOT, ${getUser?.firstName}!</h1>
                </div>
                <p>We're thrilled to have you join our community! At QUIKSBOT, we're committed to helping you connect with your customers in real-time, offering seamless chat support and making every interaction count.</p>
                
                <p>Here's a quick overview of what you can do:</p>
                <ul>
                  <li><strong>Engage</strong> in real-time chat support with your customers.</li>
                  <li><strong>Access Chat Logs:</strong> View past interactions anytime.</li>
                  <li><strong>Personalize</strong> your bot settings for a tailored customer experience.</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="https://quiksbot.com/dashboard" class="button">Go to Your Dashboard</a>
                </div>
      
                <p>If you have any questions or need assistance getting started, our support team is just a click away. Feel free to reach out anytime!</p>
      
                <div class="footer">
                  <p>Thank you for choosing QUIKSBOT. We're excited to be part of your journey!</p>
                  <p>© 2023 QUIKSBOT. All rights reserved.</p>
                  <p><small>This email was sent automatically. Please do not reply.</small></p>
                </div>
              </div>
            </body>
          </html>
        `,
      };

      await onMailer({}, welcomeMail);
    }

    const getBotByUser = await prisma.chatBot.findMany({
      where: { userId: user !== null ? user?.id : newUser?.id! },
      include: {
        Source: {
          include: {
            pdfFile: true,
            characteristic: true,
            webpage: true,
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
        greetings: "Hey 👋 , How can we help you today?",
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

    return { err, status: 500, completed: false };
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

export const deleteWebsiteUrl = async (id: string) => {
  auth().protect();
  if (!id) throw new Error("invalid id");
  try {
    const del = await prisma.website.delete({
      where: {
        id: id,
      },
    });
    return del;
  } catch (err) {
    console.log("error occurs while trying to delete website url", err);
  }
};
export const deletePdf = async (id: string, chatbotId: string) => {
  auth().protect();
  if (!id) return;

  try {
    const Id = id;

    await prisma.pdfFile.delete({
      where: {
        id: id,
      },
    });
    const index = await pineconeClient.index(indexName);
    await index.namespace(Id).deleteAll();
    revalidatePath(`/edit-chatbot/${chatbotId}`);
    return {
      completed: true,
    };
  } catch (err) {
    console.log("error has occur while trying to delete pdfFile", err);
    return { completed: false };
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
      include: {
        Source: true,
        firstQuestion: true,
        blockPage: true,
        customer: true,
      },
    });
    // // Trigger revalidation for the chatbot view page
    revalidatePath("/dashboard");

    return { chatbot, completed: true };
  } catch (err) {
    console.error("Error occurred while deleting bot", err);
    return { completed: false, error: "Failed to delete bot" };
  }
};
