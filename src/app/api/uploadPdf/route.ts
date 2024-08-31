import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "../../../../prisma/client";
import { Prisma } from "@prisma/client";
import { getBot } from "@/actions/bot";
import { revalidatePath } from "next/cache";
import { generateEmbeddingsInPineconeVectorStore } from "@/lib/langchain";
import { BASE_URL } from "../../../../constant/url";

export const config = {
  api: {
    bodyParser: false, // Disables Next.js body parsing so we can use formidable
  },
};

export async function POST(req: Request) {
  auth().protect();
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    return NextResponse.json({ message: "File uploaded successfully", newPdf });
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
  }
}
