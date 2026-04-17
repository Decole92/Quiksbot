import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const secret_key = process.env.CRONJOB_SECRET;

  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");

  if (secret !== secret_key) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // NOTE: The full cron cleanup logic (finding inactive chatbots older than 30 days,
    // deleting Pinecone vectors, and sending warning emails) should be implemented as a
    // Convex scheduled function in convex/crons.ts. There is no Convex query available
    // from a Next.js route to list ALL bots across all users with the required join data.
    console.log("Cron route triggered - cleanup logic should run in Convex crons.");

    return NextResponse.json({
      message: "Cron acknowledged. Cleanup logic should be migrated to convex/crons.ts for production use.",
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
