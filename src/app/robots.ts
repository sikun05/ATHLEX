import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/dashboard", "/checkout", "/auth/", "/login", "/signup", "/reset-password", "/forgot-password", "/verify-email"] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
