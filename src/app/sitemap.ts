// import { MetadataRoute } from "next";
// import { BASE_URL } from "../../constant/url";

// export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
//   const currentDate = new Date();

//   return [
//     {
//       url: `${BASE_URL}/`,
//       lastModified: currentDate,
//     },
//     {
//       url: `${BASE_URL}/dashboard`,
//       lastModified: currentDate,
//     },
//     {
//       url: `${BASE_URL}/analytic`,
//       lastModified: currentDate,
//     },
//     {
//       url: `${BASE_URL}/chatlogs`,
//       lastModified: currentDate,
//     },
//     {
//       url: `${BASE_URL}/create-chatbot`,
//       lastModified: currentDate,
//     },
//     {
//       url: `${BASE_URL}/pricing`,
//       lastModified: currentDate,
//     },
//     {
//       url: `${BASE_URL}/settings`,
//       lastModified: currentDate,
//     },
//     {
//       url: `${BASE_URL}/sign-in`,
//       lastModified: currentDate,
//     },
//     {
//       url: `${BASE_URL}/sign-up`,
//       lastModified: currentDate,
//     },
//   ];
// }

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
