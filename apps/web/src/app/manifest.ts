import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ANDRÉ OS",
    short_name: "ANDRÉ OS",
    description:
      "Personal operating system for tasks, routines, saved links, time tracking and personal analytics.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F1014",
    theme_color: "#5B5CE2",
    icons: [
      {
        src: "/brand/app-icon-dark.png",
        sizes: "1280x1280",
        type: "image/png",
      },
    ],
  };
}
