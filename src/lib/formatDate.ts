import { characteristic } from "../../typing";

export function formatDateTime(timestamp: Date) {
  const date = new Date(timestamp);

  // Format the date to "MM/DD/YYYY"
  const formattedDate = new Intl.DateTimeFormat("en-US").format(date);

  // Format the time to "hh:mm AM/PM"
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  // Combine both date and time
  return `${formattedDate} ${formattedTime}`;
}

export function htmlToText(htmlContent: string): string {
  let plainText = htmlContent
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  plainText = plainText.replace(/"/g, "");
  plainText = plainText.replace(/\\n/g, " ");
  plainText = plainText.replace(/\n/g, " ");
  plainText = plainText.replace(/\\+/g, "");

  return plainText;
}

const MODEL_MAX_TOKENS = {
  "gpt-3.5-turbo": 16385, // Confirmed by your error; newer variants (e.g., 0125)
  "gpt-4": 8192, // Base GPT-4; 32k variant exists as "gpt-4-32k"
  "gpt-4-turbo": 128000, // Correct for 2024 releases (e.g., gpt-4-turbo-2024-04-09)
  "gpt-4o": 128000, // Matches GPT-4o’s 128k context window
  "claude-3-sonnet": 200000, // Claude 3 family standard as of 2024
  "claude-3-opus": 200000, // Claude 3 family standard
  "claude-3-haiku": 200000, // Claude 3 family standard
  default: 16385, // Reasonable fallback; matches gpt-3.5-turbo
};

function getMaxTokens(modelName: string | undefined) {
  const normalizedModel = modelName?.toLowerCase() || "";
  return (
    MODEL_MAX_TOKENS[normalizedModel as keyof typeof MODEL_MAX_TOKENS] ||
    MODEL_MAX_TOKENS["default"]
  );
}

export function checkContextLength(chatbot: any, model: string) {
  // Default token-to-char ratio (approx. 4 chars per token for English text)
  const TOKEN_TO_CHAR_RATIO = 4;

  const maxTokens = getMaxTokens(model);
  const characteristicChars =
    (chatbot &&
      chatbot?.Source?.characteristic
        ?.map((character: characteristic) => character?.characteristic || "")
        .join("").length) ||
    0;

  // 2. Calculate character count from webpage data
  let webpageChars = 0;

  if (chatbot?.Source?.webpage && chatbot.Source.webpage.length > 0) {
    webpageChars = chatbot.Source.webpage.reduce((total: any, webpage: any) => {
      // Assuming webpage.length is the character count; adjust if it's something else
      return total + (webpage.length || 0);
    }, 0);
  }

  // 3. Total character count
  const totalChars = characteristicChars + webpageChars;

  // 4. Estimate token count (can be adjusted based on model-specific tokenization)
  const estimatedTokens = Math.ceil(totalChars / TOKEN_TO_CHAR_RATIO);

  // 5. Check against max token limit
  const exceedsLimit = estimatedTokens > maxTokens;

  // 6. Generate alert message if limit is exceeded
  let alertMessage = null;
  if (exceedsLimit) {
    alertMessage = `Warning: The total content exceeds the model's maximum context length. Estimated tokens: ${estimatedTokens} (Max: ${maxTokens}). Please reduce the content to avoid errors like "400 This model's maximum context length is ${maxTokens} tokens. However, your messages resulted in ${estimatedTokens} tokens."`;
  }

  // 7. Return result
  return {
    totalChars,
    estimatedTokens,
    exceedsLimit,
    alertMessage,
    characteristicChars,
    webpageChars,
  };
}
