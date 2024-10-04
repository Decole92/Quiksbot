import { MetadataRoute } from "next";
import { BASE_URL } from "../../constant/url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",

        allow: "/",
        disallow: [
          "/chatbot/",
          "/edit-chatbot/",
          "/settings",
          "/chatlogs/",
          "/dashboard",
          "/analytic",
          "/create-chatbot",
          "/pricing",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
