import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://koffera-coffee.vercel.app/",
      lastModified: new Date(),
    },
  ];
}
