"use server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export const updateCredits = async (userId: string) => {
  try {
    await fetchMutation(api.users.incrementCredits, {
      userId: userId as any,
    });
  } catch (error) {
    console.error("Error updating credits:", error);
  }
};

export const getChatMessages = async (chatRoomId: string) => {
  try {
    const messages = await fetchQuery(api.chat.getChatMessages, {
      chatRoomId: chatRoomId as any,
    });
    return messages;
  } catch (err) {
    throw new Error(`err occurs while getting chat messages: ${err}`);
  }
};

export const getChatRoom = async (chatRoomId: string) => {
  try {
    const chatroom = await fetchQuery(api.chat.getChatRoom, {
      chatRoomId: chatRoomId as any,
    });
    return chatroom;
  } catch (err) {
    console.error("err occurs while getting chat room", err);
  }
};

export const getUserById = async (id: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  try {
    const user = await fetchQuery(api.users.getUserByClerkId, { clerkId: id });
    return { openAikey: user?.openAIkey };
  } catch (err) {
    throw new Error(
      "err occurs while getting getUserById from the server action",
      err as any
    );
  }
};

export const deleteChatRoomById = async (id: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!id) throw new Error("there's no selectedChatroomId");
  try {
    // deleteChatRoom in Convex already handles storage cleanup (imageStorageId)
    await fetchMutation(api.chat.deleteChatRoom, {
      chatRoomId: id as any,
    });

    revalidatePath("/chatlogs");
    return { completed: true };
  } catch (err) {
    console.error("err has occur while trying to delete chatroom..");
    return { completed: false };
  }
};

export const updateGuestDetails = async ({
  userDetails,
  id,
}: {
  userDetails: { name: string; email: string };
  id: string;
}) => {
  if (!id || !userDetails) {
    throw new Error("There's no id or userDetails provided!");
  }

  try {
    const guestUpdate = await fetchMutation(api.chat.updateCustomerDetails, {
      chatRoomId: id as any,
      name: userDetails.name,
      email: userDetails.email,
    });
    return guestUpdate;
  } catch (err) {
    throw new Error(
      "error occurs while try to update guest details",
      err as any
    );
  }
};

/**
 * Upload an image to Convex storage and attach it to a chat message.
 * Returns the public URL of the uploaded image.
 */
export const uploadImageAndGetUrl = async (
  messageId: string,
  image: FormData
): Promise<string | null> => {
  if (!image) return null;

  const file = image.get("file") as File | null;
  if (!file) return null;

  try {
    // 1. Get a Convex upload URL
    const uploadUrl = await fetchMutation(api.chat.generateImageUploadUrl);

    // 2. Upload the file to Convex storage
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload image to Convex storage");
    }

    const { storageId } = await uploadResponse.json();

    // 3. Get the public URL from Convex
    const imageUrl = await fetchMutation(api.files.getFileUrl, { storageId });

    if (!imageUrl) return null;

    // 4. Update the chat message with image info
    await fetchMutation(api.chat.updateMessageImage, {
      messageId: messageId as any,
      imageRef: storageId,
      imageUrl,
      imageStorageId: storageId,
    });

    return imageUrl;
  } catch (error) {
    throw new Error(`Failed to upload image: ${error}`);
  }
};
