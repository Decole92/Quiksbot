import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import prisma from "../../../../prisma/client";

type Option = {
  value: string;
  label: string;
};

// The handler function for the API route
export async function GET(req: Request) {
  const { userId } = await auth();
  try {
    const userOpenAiKey = await prisma.user.findFirst({
      where: {
        clerkId: userId!,
      },
    });
    if (!userOpenAiKey)
      throw new Error(
        "there's no user found while find openai key in the user table."
      );
    const openai = new OpenAI({
      apiKey:
        userOpenAiKey && userOpenAiKey?.openAIkey !== null
          ? userOpenAiKey?.openAIkey
          : process.env.OPENAI_KEY!,
    });

    const models = await openai.models.list();

    // Mapping the models to options format
    const response = await openai.models.list();

    if (!response || !response.data || response.data.length === 0) {
      return NextResponse.json({ error: "No models found" }, { status: 404 });
    }

    // Map the response to an options array
    const modelOptions: Option[] = response.data.map((model: any) => ({
      value: model.id,
      label: model.id,
    }));

    // Return the models as a JSON response
    return NextResponse.json({ modelOptions });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
