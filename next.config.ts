import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Anexos são enviados como data URL (base64) via Server Action;
      // o cap real fica no cliente (~8MB por arquivo). Base64 infla ~33%,
      // então deixamos folga aqui pra imagens e clipes curtos.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
