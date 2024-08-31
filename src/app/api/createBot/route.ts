import { NextResponse } from "next/server";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import prisma from "../../../../prisma/client";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const { botName, fullName } = await req.json();
    const { userId } = await auth();
    const getUser = await currentUser();
    if (!userId || !botName) {
      return NextResponse.json(
        { message: "User or bot name missing" },
        { status: 400 }
      );
    }

    //console.log("this is userId & botName", userId, botName);

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
          email: getUser?.emailAddresses[0].emailAddress!,
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

    return NextResponse.json({ chatbot }, { status: 200 });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2002") {
        console.log(
          "There is a unique constraint violation, a new user cannot be created with this email"
        );
        return NextResponse.json(
          { error: "Unique constraint violation" },
          { status: 409 }
        );
      }
    }

    console.error("An error occurred:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
