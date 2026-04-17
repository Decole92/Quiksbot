import { NextResponse } from "next/server";

import { auth } from "@clerk/nextjs/server";

import axios from "axios";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const apiUrl = "https://graph.facebook.com/v20.0/v1/account";

  const cert =
    "CmYKIgi0wIG/samWAxIGZW50OndhIgl0aGUgcm9ib3RQtYepvgYaQBVJRINzrVKZMjpyB3nFFFfMjLNvO8UEUsA4sOpwGK/FnQ6nfV/zrfGlWYzrfFjahFxFU+E1+h4MhAn41WUZmAASL21aacrK9teh9lqytpqsai6UW+XgXMD0BfNLKPaLHPzduPegCENdQrU/nHE5hJKh";

  const response = await axios.post(apiUrl, {
    cc: "+420",
    phone_number: "771115054",
    method: "sms",
    cert: cert,
  });

  try {
    return NextResponse.json({ success: true, status: response?.status });
  } catch (error) {
    console.error("Error in fetch-links API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
