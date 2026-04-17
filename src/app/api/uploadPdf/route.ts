import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { revalidatePath } from "next/cache";
import { generateEmbeddingsInPineconeVectorStore } from "@/lib/langchain";
import { BASE_URL } from "../../../../constant/url";
import { getUserPdfFiles } from "@/actions/user";

const STANDARD_LIMIT = 2;
const PRO_LIMIT = 22;
const ULTIMATE_LIMIT = 50;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userFiles = await getUserPdfFiles(userId);

  // Find the user and their subscription plan
  const user = await fetchQuery(api.users.getUserWithSubscription, { clerkId: userId });

  // Set the upload limit based on the user's subscription plan
  const limit =
    user && user?.subscription?.plan === "STANDARD"
      ? STANDARD_LIMIT
      : user?.subscription?.plan === "PRO"
      ? PRO_LIMIT
      : ULTIMATE_LIMIT;

  if (typeof userFiles === "number") {
    if (userFiles >= limit) {
      console.error("Upload limit exceeded, prompt user to upgrade.");
      return NextResponse.json(
        { error: "Upgrade your plan to upload more PDF files." },
        { status: 400 }
      );
    }
  } else {
    console.error("Unexpected value for userFiles:", userFiles);
    return NextResponse.json(
      { error: "Unable to fetch the user files data." },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();

    const chatbotId = formData.get("chatbotId") as string | null;
    const file = formData.get("file") as File | null;

    if (!chatbotId || !file) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // Generate an upload URL from Convex storage
    const uploadUrl = await fetchMutation(api.sources.generatePdfUploadUrl, {});

    // Upload the file to Convex storage
    const fileBuffer = await file.arrayBuffer();
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type || "application/pdf" },
      body: fileBuffer,
    });

    if (!uploadResponse.ok) {
      return NextResponse.json(
        { error: "Failed to upload file to storage" },
        { status: 500 }
      );
    }

    const { storageId } = await uploadResponse.json();

    // Create the PDF record in Convex
    const newPdf = await fetchMutation(api.sources.createPdfFile, {
      fileName: file.name,
      storageId: storageId,
      chatBotId: chatbotId as any,
    });

    const fileId = (newPdf as any)?._id ?? (newPdf as any)?.id;

    // Generate embeddings in Pinecone (async, non-blocking)
    const generateEmbeddings = async () => {
      await generateEmbeddingsInPineconeVectorStore(file, fileId);
    };
    generateEmbeddings();

    revalidatePath(`${BASE_URL}/edit-chatbot/${chatbotId}`);

    return NextResponse.json({
      message: "File uploaded successfully",
      completed: true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Unique constraint violation", completed: false },
      { status: 409 }
    );
  }
}
