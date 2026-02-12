/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use project directory as root so API routes and app are resolved correctly
  // (avoids "Cannot find module for page" when parent dir has another lockfile)
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
