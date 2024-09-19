import { MetadataRoute } from "next";
import { BASE_URL } from "../../constant/url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: "/chatbot/",
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}