import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9",
    theme_color: "#0f172a",
    icons: [
      {
        src: siteConfig.logo,
        sizes: "640x640",
        type: "image/png",
      },
    ],
  };
}
