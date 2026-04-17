import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { revalidatePath } from "next/cache";
import axios, { AxiosError } from "axios";
import * as cheerio from "cheerio";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function fetchWithRetry(
  url: string,
  retries = MAX_RETRIES
): Promise<string> {
  try {
    const response = await axios.get(url, {
      timeout: 30000,
      maxRedirects: 5,
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (axiosError.response) {
        console.error(
          `Error ${axiosError.response.status}: ${axiosError.response.statusText}`
        );
        if (axiosError.response.status === 508) {
          throw new Error("Redirection loop detected");
        }
      } else if (axiosError.request) {
        console.error("No response received from the server");
      } else {
        console.error("Error setting up the request:", axiosError.message);
      }
    } else {
      console.error("Non-Axios error:", error);
    }

    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const { address, chatbotId } = await req.json();
    if (!address || !chatbotId) {
      return NextResponse.json(
        { success: false, error: "URL and chatbotId are required" },
        { status: 400 }
      );
    }

    let html;
    try {
      html = await fetchWithRetry(address);
    } catch (error) {
      console.error(`Failed to fetch ${address}:`, error);
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch ${address}: ${error}`,
        },
        { status: 500 }
      );
    }

    const $ = cheerio.load(html);

    const links = $("a")
      .map((_: any, el: any) => {
        const href = $(el).attr("href");
        if (href && href.startsWith("/")) {
          return new URL(href, address).toString();
        }
        return href;
      })
      .get()
      .filter(
        (href: any) =>
          href && (href.startsWith("http") || href.startsWith("https"))
      )
      .filter(
        (value: any, index: any, self: any) => self.indexOf(value) === index
      );

    const linksWithWordCounts = await Promise.all(
      links.map(async (link: string) => {
        try {
          const pageHtml = await fetchWithRetry(link);
          const $page = cheerio.load(pageHtml);
          const bodyText = $page("body").text();
          const wordCount = bodyText.trim().split(/\s+/).length;

          await fetchMutation(api.sources.addWebsite, {
            chatBotId: chatbotId as any,
            weblinks: link,
            length: wordCount.toString(),
            content: bodyText,
          });

          return { url: link, wordCount };
        } catch (error) {
          console.error(`Error processing ${link}:`, error);
          return { url: link, wordCount: 0, error: error };
        }
      })
    );

    revalidatePath(`/edit-chatbot/${chatbotId}`);

    return NextResponse.json({
      success: true,
      links: linksWithWordCounts,
      errors: linksWithWordCounts
        .filter((link: any) => link.error)
        .map((link: any) => `${link.url}: ${link.error}`),
    });
  } catch (error) {
    console.error("Error in fetch-links API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error,
      },
      { status: 500 }
    );
  }
}
