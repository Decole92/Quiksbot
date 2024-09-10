import { ChatOpenAI } from "@langchain/openai";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { getEncoding } from "@langchain/core/utils/tiktoken";
import pineconeClient from "./pinecone";
import { PineconeStore } from "@langchain/pinecone";

import { Index, RecordMetadata } from "@pinecone-database/pinecone";
import { auth } from "@clerk/nextjs/server";

export const donotdisturb = PDFLoader;
export const donotdisturb1 = ChatOpenAI;
export const donotdisturb2 = RecursiveCharacterTextSplitter;
export const donotdisturb3 = OpenAIEmbeddings;
export const donotdisturb4 = PineconeStore;
export const donotdisturb5 = getEncoding;

// const model = new ChatOpenAI({
//   model: "gpt-4o-mini",
//   apiKey: process.env.OPENAI_KEY,
//   temperature: 0,
// });

export const indexName = "quiksbot";

console.log(
  donotdisturb,
  donotdisturb1,
  donotdisturb3,
  donotdisturb4,
  donotdisturb2,
  donotdisturb5
);
const namespaceExists = async (
  index: Index<RecordMetadata>,
  namespace: string
) => {
  if (namespace === null) throw new Error("No namespace value provided.");
  const { namespaces } = await index.describeIndexStats();
  return namespaces?.[namespace] !== undefined;
};

export const generateDoc = async (file: File, fileId: string) => {
  if (!file) throw new Error("new pdf file uploaded");
  const fileBuffer = await file.arrayBuffer();
  const fileBytes = Buffer.from(fileBuffer);
  const fileBlob = new Blob([fileBytes], { type: file.type });

  console.log("--- loading pdf document ---");

  const loader = new PDFLoader(fileBlob);
  const docs = await loader.load();

  console.log("--- Splitting the document into smaller parts ----");
  const splitter = new RecursiveCharacterTextSplitter();

  const splitDocs = await splitter.splitDocuments(docs);
  console.log(`--- Splits into ${splitDocs.length} parts`);

  return splitDocs;
};

export const generateEmbeddingsInPineconeVectorStore = async (
  file: File,
  fileId: string
) => {
  const { userId } = auth();
  if (!userId) {
    throw new Error("User not found");
  }

  let pineconeVictorStore;

  console.log("-- Generate embeddings... ---");
  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_KEY!,
  });

  const index = await pineconeClient.index(indexName);
  const namespaceAlreadyExists = await namespaceExists(index, fileId);

  if (namespaceAlreadyExists) {
    console.log(
      `--- Namespace ${fileId} already exists, reusing the existing embeddings...`
    );
    pineconeVictorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      namespace: fileId,
    });
    return pineconeVictorStore;
  } else {
    const splitDocs = await generateDoc(file, fileId);

    console.log(
      `--- Storing the embedings in namespace ${fileId} in the ${indexName} Pinecone vector store... ---`
    );
    pineconeVictorStore = await PineconeStore.fromDocuments(
      splitDocs,
      embeddings,
      {
        pineconeIndex: index,
        namespace: fileId,
      }
    );
    return pineconeVictorStore;
  }
};
