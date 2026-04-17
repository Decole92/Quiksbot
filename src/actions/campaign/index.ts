"use server";

import { auth } from "@clerk/nextjs/server";
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../../convex/_generated/api";

export const getCampaign = async (userId: string) => {
  const { userId: authUserId } = await auth();
  if (!authUserId) throw new Error("Unauthorized");
  if (!userId) return;

  try {
    const campaign = await fetchQuery(api.campaigns.getCampaignsByUser, {
      userId,
    });

    return campaign;
  } catch (err) {
    throw new Error(
      "err has occur while trying to fetch campaigns",
      err as any
    );
  }
};

export const deleteCampaign = async (id: string) => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  if (!id) return;
  try {
    const campaign = await fetchMutation(api.campaigns.deleteCampaign, {
      id: id as any,
    });

    return campaign;
  } catch (err) {
    throw new Error(
      "err has occur while trying to delete campaigns",
      err as any
    );
  }
};
