import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import Anthropic from "@anthropic-ai/sdk";

type Option = {
  value: string;
  label: string;
};

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const userRecord = await fetchQuery(api.users.getUserByClerkId, {
      clerkId: userId,
    });
    if (!userRecord)
      throw new Error(
        "there's no user found while find openai key in the user table."
      );

    const deepseekai = new OpenAI({
      baseURL: "https://api.deepseek.com",
      apiKey:
        userRecord?.deepseekAiKey !== null && userRecord?.deepseekAiKey
          ? userRecord.deepseekAiKey
          : process.env.DEEPSEEK_KEY,
    });

    const xai = new OpenAI({
      baseURL: "https://api.x.ai/v1/",
      apiKey:
        userRecord?.xaiKey !== null && userRecord?.xaiKey
          ? userRecord.xaiKey
          : process.env.XAI_KEY,
    });
    const openai = new OpenAI({
      apiKey:
        userRecord?.openAIkey !== null && userRecord?.openAIkey
          ? userRecord.openAIkey
          : process.env.OPENAI_KEY!,
    });

    const anthropic = new Anthropic({
      apiKey:
        userRecord?.anthropicAiKey !== null && userRecord?.anthropicAiKey
          ? userRecord.anthropicAiKey
          : process.env.ANTHROPIC_KEY!,
    });

    const [anthropicResult, deepseekResult, xaiResult, openaiResult] =
      await Promise.allSettled([
        anthropic.models.list({ limit: 20 }),
        deepseekai.models.list(),
        xai.models.list(),
        openai.models.list(),
      ]);

    const allModels: any[] = [
      ...(xaiResult.status === "fulfilled" ? xaiResult.value.data : []),
      ...(anthropicResult.status === "fulfilled"
        ? anthropicResult.value.data
        : []),
      ...(openaiResult.status === "fulfilled" ? openaiResult.value.data : []),
      ...(deepseekResult.status === "fulfilled"
        ? deepseekResult.value.data
        : []),
    ];

    if (allModels.length === 0) {
      return NextResponse.json({ error: "No models found" }, { status: 404 });
    }

    const modelOptions: Option[] = allModels.map((model: any) => ({
      value: model.id,
      label: model.id,
    }));

    return NextResponse.json({ modelOptions });
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Failed to fetch models" },
      { status: 500 }
    );
  }
}
