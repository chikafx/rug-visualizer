import path from "path";
import type { NextConfig } from "next";

const nextConfig = {
  turbopack: {
    // point Turbopack to the containing `apps` folder so package-lock.json is used
    root: path.resolve(__dirname, "..", ".."),
  },
  /* config options here */
} as unknown as NextConfig;

export default nextConfig;
