import { MetadataRoute } from "next";
import { BASE_URL } from "../../constant/url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/dashboard`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/analytic`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/chatlogs`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/create-chatbot`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/settings`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/sign-in`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/sign-up`,
      lastModified: new Date(),
    },
    {
      url: `${BASE_URL}/chatbot/`,
      lastModified: new Date(),
    },
  ];
}
