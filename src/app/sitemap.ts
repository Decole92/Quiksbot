import { MetadataRoute } from "next";
import { BASE_URL } from "../../constant/url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString();

  const routes = ["", "sign-in", "sign-up"];

  return routes.map((route) => ({
    url: `${BASE_URL}/${route}`,
    lastModified: currentDate,
  }));
}
