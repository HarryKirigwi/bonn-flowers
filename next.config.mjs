/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Remove deprecated domains config if present
    // Use remotePatterns only if you need to allow remote images
    // For local images, you can leave this empty or remove the images property entirely
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
