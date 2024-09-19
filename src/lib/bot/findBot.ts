import { auth } from "@clerk/nextjs/server";
import prisma from "../../../prisma/client";

export const findChatBot = async (id: string) => {
  const { userId } = auth();
  if (!userId) return;
  const res = await prisma.chatBot.findUnique({
    where: {
      id: id,
    },
    include: {
      Source: true,
      helpdesk: true,
    },
  });

  return res;
};
