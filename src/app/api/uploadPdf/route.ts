import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "../../../../prisma/client";
import { getBot } from "@/actions/bot";
import { revalidatePath } from "next/cache";
import { generateEmbeddingsInPineconeVectorStore } from "@/lib/langchain";
import { BASE_URL } from "../../../../constant/url";
import { getUserPdfFiles } from "@/actions/user";

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };

const STANDARD_LIMIT = 2;
const PRO_LIMIT = 22;
const ULTIMATE_LIMIT = 50;

export async function POST(req: Request) {
  auth().protect();
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userFiles = await getUserPdfFiles(userId); // Ensure this returns a number

  // Find the user and their subscription plan
  const user = await prisma.user.findFirst({
    where: { clerkId: userId },
    include: { subscription: true },
  });

  console.log("This is the user:", user);

  // Set the upload limit based on the user's subscription plan
  const limit =
    user && user?.subscription?.plan === "STANDARD"
      ? STANDARD_LIMIT
      : user?.subscription?.plan === "PRO"
      ? PRO_LIMIT
      : ULTIMATE_LIMIT;

  console.log("This is usersFiles & limit:", userFiles, limit);

  // Check if userFiles is a valid number and within the allowed limit
  if (typeof userFiles === "number") {
    if (userFiles >= limit) {
      console.error("Upload limit exceeded, prompt user to upgrade.");
      return NextResponse.json(
        { error: "Upgrade your plan to upload more PDF files." },
        { status: 400 }
      );
    }
  } else {
    // Handle unexpected cases where userFiles is not a number
    console.error("Unexpected value for userFiles:", userFiles);
    return NextResponse.json(
      { error: "Unable to fetch the user files data." },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();

    // Extract fields
    const chatbotId = formData.get("chatbotId");
    const file = formData.get("file") as File | null;

    if (!chatbotId || !file) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    console.log("Chatbot ID:", chatbotId);
    console.log("File:", file);

    // Convert the file to a buffer for storing as Bytes in Prisma
    const fileBuffer = await file.arrayBuffer();
    const fileBytes = Buffer.from(fileBuffer);

    const chatbot = await getBot(chatbotId as string);
    let newPdf;
    let fileId: string;

    if (chatbot?.sourceId !== null) {
      newPdf = await prisma.pdfFile.create({
        data: {
          fileName: file.name,
          file: fileBytes, // Store the file as bytes
          Source: {
            connect: { id: chatbot?.sourceId },
          },
        },
      });

      fileId = newPdf?.id!;
    } else {
      const source = await prisma.source.create({
        data: {
          ChatBot: {
            connect: { id: chatbotId as string },
          },
        },
      });

      newPdf = await prisma.pdfFile.create({
        data: {
          fileName: file.name,
          file: fileBytes, // Store the file as bytes
          Source: {
            connect: { id: source.id },
          },
        },
      });

      fileId = newPdf?.id;
    }

    console.log("fileId", fileId);
    const generateEmbeddings = async () => {
      await generateEmbeddingsInPineconeVectorStore(file, fileId);
    };
    generateEmbeddings();

    revalidatePath(`${BASE_URL}/edit-chatbot/${chatbotId}`);

    return NextResponse.json({
      message: "File uploaded successfully",
      // newPdf,
      completed: true,
    });
  } catch (err: any) {
    console.log(
      "There is a unique constraint violation, a new user cannot be created with this email"
    );
    return NextResponse.json(
      { error: "Unique constraint violation", completed: false },
      { status: 409 }
    );
  }
}
