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
  if (typeof window === "undefined") {
    // Server-side rendering
    return htmlContent
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // Client-side rendering
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  let plainText = doc?.body.textContent || "";

  plainText = plainText.replace(/\s+/g, " ").trim(); // Replace multiple spaces/newlines with a single space
  plainText = plainText.replace(/"/g, ""); // Remove double quotes
  plainText = plainText.replace(/\\n/g, " "); // Replace escaped newlines (\\n) with spaces
  plainText = plainText.replace(/\n/g, " "); // Replace newlines with spaces
  plainText = plainText.replace(/\\+/g, ""); // Replace all backslashes with nothing

  plainText = plainText.replace(/\n/g, " ");

  return plainText;
}
