import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.kofferacoffeeexport.com"
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
    },{
      url: `${baseUrl}/about`,
      lastModified,
    },{
      url: `${baseUrl}/posts`,
      lastModified,
    },{
      url: `${baseUrl}/achievements`,
      lastModified,
    },{
      url: `${baseUrl}/benefits`,
      lastModified,
    },{
      url: `${baseUrl}/contact`,
      lastModified,
    },{
      url: `${baseUrl}/market`,
      lastModified,
    },{
      url: `${baseUrl}/products`,
      lastModified,
    }
  ];
}
