import { MetadataRoute } from "next";
import { PRODUCTS, SERVICES, productHref, serviceHref } from "@/lib/catalog";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://fiaxe.com";
  
  // Key static routes
  const routes = [
    "",
    ...SERVICES.map(serviceHref),
    ...PRODUCTS.map(productHref),
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
    priority: route === "" ? 1 : route.startsWith("/services") || route.startsWith("/products") ? 0.9 : 0.8,
  }));
}
