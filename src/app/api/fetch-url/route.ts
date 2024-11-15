import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
import prisma from "../../../../prisma/client";
import { revalidatePath } from "next/cache";
import chromium from "@sparticuz/chromium";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const isDevelopment = process.env.NODE_ENV === "development";
export async function POST(req: Request) {
  auth().protect();

  try {
    const { address, chatbotId, sourceId } = await req.json();
    console.log("url received", address, chatbotId);
    if (!address || !chatbotId) {
      return NextResponse.json(
        { success: false, error: "URL and chatbotId are required" },
        { status: 400 }
      );
    }
    let browser: any = null;
    const executablePath = await chromium.executablePath();
    console.log("chromium path", executablePath);

    if (isDevelopment) {
      console.log("dev here...");
      browser = await puppeteer.launch();
    } else {
      console.log("prod");
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath,
        headless: true!,
        ignoreHTTPSErrors: true,
      });
    }

    const page = await browser.newPage();

    console.log("Chromium:", await browser.version());
    console.log("Page Title:", await page.title());

    await page.goto(address, {
      waitUntil: "networkidle0",
      // waitUntil: "domcontentloaded",
    });

    // Get all links on the page
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll("a"));
      return anchors
        .map((anchor) => anchor.href)
        .filter((href) => href.startsWith("https"));
    });

    const uniqueLinks = Array.from(new Set(links));

    // Step 1: Determine or create the `Source`
    let source: any;
    if (sourceId !== null) {
      // Fetch the existing Source if `sourceId` is provided
      source = await prisma.source.findUnique({
        where: { id: sourceId },
      });
    } else {
      // Create a new Source and attach it to the ChatBot
      source = await prisma.source.create({
        data: {
          ChatBot: {
            connect: { id: chatbotId },
          },
        },
      });
    }

    if (!source) {
      return NextResponse.json(
        { success: false, error: "Source not found or creation failed" },
        { status: 500 }
      );
    }

    // Step 2: Process each link, fetch its content, and save to the `Website` table
    const linksWithWordCounts = await Promise.all(
      uniqueLinks.map(async (link: any) => {
        try {
          // Open each link in a new page
          const newPage = await browser.newPage();
          await newPage.goto(link, {
            // waitUntil: "domcontentloaded",
            waitUntil: "networkidle0",
            timeout: 30000,
          });

          // Get the text content of the page
          const bodyText = await newPage.evaluate(
            () => document.body.innerText || ""
          );
          const wordCount = bodyText.trim().split(/\s+/).length.toString();

          await newPage.close(); // Close the page after processing

          // Add the webpage under the current Source
          const newWebpage = await prisma.website.create({
            data: {
              weblinks: link,
              length: wordCount,
              content: bodyText,
              Source: {
                connect: { id: source.id }, // Connect to the existing or new Source
              },
            },
          });

          return { url: link, wordCount };
        } catch (error) {
          console.error(`Error processing ${link}:`, error);
          return { url: link, wordCount: 0 }; // If there's an error, set word count to 0
        }
      })
    );

    await browser.close(); // Close the Puppeteer browser

    // Step 3: Revalidate the cache for the chatbot
    revalidatePath(`/edit-chatbot/${chatbotId}`);

    // Return the links with word counts
    return NextResponse.json({ success: true, links: linksWithWordCounts });
  } catch (error) {
    console.error("Error in fetch-links API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
