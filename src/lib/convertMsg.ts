import { MessageParam } from "@anthropic-ai/sdk/resources/index.mjs";
import { ChatCompletionMessageParam } from "openai/resources/chat";

// Helper function to convert OpenAI format to Anthropic format
export const convertToAnthropicMessages = (
  messages: ChatCompletionMessageParam[]
): MessageParam[] => {
  return messages.map((msg) => ({
    role: msg.role === "assistant" ? "assistant" : "user",
    content: msg.content as string,
  }));
};
