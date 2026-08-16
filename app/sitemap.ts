import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://fiaxe.com";
  
  // Key static routes
  const routes = [
    "",
    "/agents",
    "/customer-stories",
    "/pricing",
    "/contact-us",
    "/data-residency",
    "/security",
    "/privacy-policy",
    "/terms-of-use",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : route.includes("agents") || route.includes("pricing") ? 0.9 : 0.8,
  }));
}
