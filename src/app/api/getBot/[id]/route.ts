import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prisma from "../../../../../prisma/client";

export async function GET(req: Request) {
  const id = req.url.slice(req.url.lastIndexOf("/") + 1);
  const { userId } = await auth();

  if (!userId) return;
  try {
    const bot = await prisma.chatBot.findUnique({
      where: {
        id: id,
      },
      include: {
        Source: true,
        User: true,
        firstQuestion: true,
      },
    });

    if (bot) {
      return NextResponse.json(bot, { status: 200 });
    } else {
      return NextResponse.json(null, { status: 204 });
    }
  } catch (err) {
    return NextResponse.json(err, { status: 500 });
  }
}
