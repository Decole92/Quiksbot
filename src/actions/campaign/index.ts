"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "../../../prisma/client";

export const getCampaign = async (userId: string) => {
  auth().protect();
  if (!userId) return;

  try {
    const campaign = await prisma.campaign.findMany({
      where: {
        userId: userId,
      },
    });
    console.log("campaign from backend", campaign);
    return campaign;
  } catch (err) {
    console.log("err has occur while trying to fetch campaigns", err);
  }
};

export const deleteCampaign = async (id: string) => {
  auth().protect();
  if (!id) return;
  try {
    const campaign = await prisma.campaign.delete({
      where: {
        id: id,
      },
    });
    console.log("campaign from backend", campaign);
    return campaign;
  } catch (err) {
    console.log("err has occur while trying to delete campaigns", err);
  }
};
